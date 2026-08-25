import os
from typing import List, Optional
from uuid import uuid4
from datetime import datetime

from openai import AsyncOpenAI
from app.config.settings import settings
from app.models.chat import ChatSession, ChatMessage
from app.models.profile import HealthProfile

# Reusable AsyncOpenAI client singleton for connection pooling and speed
_client: Optional[AsyncOpenAI] = None


def get_openai_client() -> AsyncOpenAI:
    """Get or create singleton async OpenAI client."""
    global _client
    if _client is None:
        api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not configured")
        _client = AsyncOpenAI(api_key=api_key, timeout=15.0, max_retries=2)
    return _client


def build_system_prompt(user_name: str, user_email: str, profile: Optional[HealthProfile]) -> str:
    """Construct personalized system prompt based on user identity and health profile."""
    prompt = (
        "You are HealthBridge AI, a friendly, concise, empathetic, and culturally sensitive "
        "preventive health coach for hypertension and diabetes risk in African and developing communities.\n\n"
        f"User Identity:\n"
        f"- Name: {user_name}\n"
    )
    if user_email:
        prompt += f"- Email: {user_email}\n"

    prompt += (
        f"- When the user asks about their name, greeting, or identity, address them directly as {user_name}.\n\n"
        "Instructions:\n"
        "- Give actionable, practical, culturally relevant micro-habits.\n"
        "- Keep replies direct, warm, concise (under 120 words unless detailed explanation requested).\n"
        "- Use the user's specific health profile below to personalize answers without repeating unnecessary generic questions.\n"
        "- Clarify that this is lifestyle guidance, not a clinical prescription.\n\n"
    )

    if profile:
        profile_details = [
            f"- Age Band: {profile.age_band or 'Not specified'}",
            f"- Sex: {profile.sex or 'Not specified'}",
            f"- Family History of Hypertension: {'Yes' if profile.family_history_hypertension else 'No/Not reported'}",
            f"- Family History of Diabetes: {'Yes' if profile.family_history_diabetes else 'No/Not reported'}",
            f"- Smoking Status: {profile.smoking_status}",
            f"- Alcohol Consumption: {profile.alcohol_consumption}",
            f"- Activity Level: {profile.activity_level}",
            f"- Diet Pattern: {profile.diet_pattern}",
            f"- BMI Category: {profile.bmi_category}",
        ]
        if profile.constraints:
            profile_details.append(
                f"- Constraints: food_access={profile.constraints.food_access}, income_band={profile.constraints.income_band}, exercise_safety={profile.constraints.exercise_safety}"
            )
        prompt += "User Health Profile:\n" + "\n".join(profile_details) + "\n\n"
    else:
        prompt += "Health Profile: No questionnaire completed yet. If health questions arise, gently suggest completing their profile.\n\n"

    return prompt


async def get_or_create_session(user_id: str, session_id: Optional[str] = None, session_type: str = "general") -> ChatSession:
    """Find active session by ID or create a new one."""
    if session_id:
        session = await ChatSession.find_one(ChatSession.session_id == session_id, ChatSession.user_id == user_id)
        if session:
            return session

    new_session_id = session_id or str(uuid4())
    session = ChatSession(
        user_id=user_id,
        session_id=new_session_id,
        session_type=session_type,
        is_active=True,
    )
    await session.create()
    return session


async def generate_chat_response(
    user_id: str,
    session_id: str,
    user_message: str,
    current_user: Optional[object] = None,
) -> str:
    """Process user message through OpenAI and return fast agent response."""
    # 1. Fetch user model and health profile
    from app.models.user import User
    user = await User.find_one(User.firebase_uid == user_id)
    profile = await HealthProfile.find_one(HealthProfile.user_id == user_id)

    # Determine user display name
    user_name = "Friend"
    user_email = ""
    if user and user.display_name:
        user_name = user.display_name
        user_email = user.email or ""
    elif user and user.email:
        user_name = user.email.split('@')[0].capitalize()
        user_email = user.email
    elif isinstance(current_user, dict):
        user_name = current_user.get("display_name") or (current_user.get("email", "").split("@")[0].capitalize() if current_user.get("email") else "Friend")
        user_email = current_user.get("email", "")
    elif hasattr(current_user, "display_name") and current_user.display_name:
        user_name = current_user.display_name
        user_email = getattr(current_user, "email", "")
    elif hasattr(current_user, "email") and current_user.email:
        user_name = current_user.email.split("@")[0].capitalize()
        user_email = current_user.email

    # 2. Fetch or create session
    session = await get_or_create_session(user_id, session_id)

    # 3. Save user message
    user_chat_msg = ChatMessage(
        session_id=session.session_id,
        role="user",
        content=user_message,
        agent_name=None,
    )
    await user_chat_msg.create()

    # 4. Fetch recent chat history (last 6 messages for fast context window)
    history_messages = await ChatMessage.find(ChatMessage.session_id == session.session_id).sort("created_at").to_list()
    
    # 5. Build prompt
    system_prompt = build_system_prompt(user_name, user_email, profile)
    messages_payload = [{"role": "system", "content": system_prompt}]

    for msg in history_messages[-6:]:
        messages_payload.append({
            "role": msg.role,
            "content": msg.content
        })

    # 5. Call OpenAI with fast parameters
    client = get_openai_client()
    try:
        completion = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_payload,
            temperature=0.6,
            max_tokens=250,
        )
        assistant_content = completion.choices[0].message.content or "I'm here to support your health journey. How can I help you today?"
    except Exception as e:
        print(f"[ERROR] OpenAI API call failed: {e}")
        assistant_content = (
            "I am having trouble connecting right now. Please check your network and try again in a moment."
        )

    # 6. Save assistant response
    assistant_chat_msg = ChatMessage(
        session_id=session.session_id,
        role="assistant",
        content=assistant_content,
        agent_name="health_coach_agent",
    )
    await assistant_chat_msg.create()

    session.update_timestamp()
    await session.save()

    return assistant_content

