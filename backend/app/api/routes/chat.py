"""
Chat API Routes

Endpoints for chat sessions and messaging.
"""

from typing import Optional, List
from uuid import uuid4
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.api.deps import CurrentUser
from app.models.chat import ChatSession, ChatMessage
from app.services.chat_service import get_or_create_session, generate_chat_response

router = APIRouter()


# Request/Response Models
class CreateSessionRequest(BaseModel):
    """Request to create a new chat session."""
    session_type: str = "general"  # intake, follow_up, general


class CreateSessionResponse(BaseModel):
    """Response with new session details."""
    session_id: str
    session_type: str
    message: str


class SendMessageRequest(BaseModel):
    """Request to send a message."""
    session_id: str
    content: str


class SendMessageResponse(BaseModel):
    """Response with assistant message."""
    message_id: str
    content: str
    agent_name: Optional[str] = None


class MessageItem(BaseModel):
    """A single message in history."""
    role: str
    content: str
    created_at: str


# Endpoints
@router.post("/session", response_model=CreateSessionResponse)
async def create_session(
    request: CreateSessionRequest,
    current_user: CurrentUser,
):
    """
    Create a new chat session.

    Session types:
    - intake: First-time health assessment
    - follow_up: Returning user check-in
    - general: Educational questions
    """
    uid = current_user.firebase_uid if hasattr(current_user, 'firebase_uid') else current_user.get('uid')
    session = await get_or_create_session(user_id=uid, session_type=request.session_type)

    return CreateSessionResponse(
        session_id=session.session_id,
        session_type=session.session_type,
        message=f"Session created. Type: {session.session_type}",
    )


@router.post("/message", response_model=SendMessageResponse)
async def send_message(
    request: SendMessageRequest,
    current_user: CurrentUser,
):
    """
    Send a message and get AI response powered by OpenAI.
    """
    uid = current_user.firebase_uid if hasattr(current_user, 'firebase_uid') else current_user.get('uid')

    assistant_content = await generate_chat_response(
        user_id=uid,
        session_id=request.session_id,
        user_message=request.content,
        current_user=current_user,
    )

    return SendMessageResponse(
        message_id=str(uuid4()),
        content=assistant_content,
        agent_name="health_coach_agent",
    )


@router.get("/session/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    current_user: CurrentUser,
):
    """Get all messages in a session."""
    messages = await ChatMessage.find(ChatMessage.session_id == session_id).sort("created_at").to_list()
    
    return {
        "session_id": session_id,
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ],
    }
