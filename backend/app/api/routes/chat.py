"""
Chat API Routes

Endpoints for chat sessions and messaging.
"""

from typing import Optional, List
from uuid import uuid4
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field
from datetime import datetime

from app.api.deps import CurrentUser
from app.models.chat import ChatSession, ChatMessage
from app.services.chat_service import get_or_create_session, generate_chat_response
from app.core.rate_limit import limiter

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

class CreateSessionRequest(BaseModel):
    """Request to create a new chat session."""
    session_type: str = Field(
        default="general",
        pattern=r"^(intake|follow_up|general)$",
        description="Session type: intake, follow_up, or general",
    )


class CreateSessionResponse(BaseModel):
    """Response with new session details."""
    session_id: str
    session_type: str
    message: str


class SendMessageRequest(BaseModel):
    """Request to send a message."""
    session_id: str = Field(..., min_length=1, max_length=100)
    content: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Message content (1-5000 characters)",
    )


class SendMessageResponse(BaseModel):
    """Response with assistant message."""
    message_id: str
    content: str
    agent_name: Optional[str] = None


class MessageItem(BaseModel):
    """A single message in history."""
    role: str
    content: str
    created_at: datetime
    agent_name: Optional[str] = None


class SessionHistoryResponse(BaseModel):
    """Full session history."""
    session_id: str
    session_type: str
    created_at: datetime
    messages: List[MessageItem]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/session", response_model=CreateSessionResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def create_session(
    request_body: CreateSessionRequest,
    request: Request,
    current_user: CurrentUser,
):
    """Create a new chat session."""
    uid = current_user.firebase_uid if hasattr(current_user, 'firebase_uid') else current_user.get('uid')
    session = await get_or_create_session(user_id=uid, session_type=request_body.session_type)

    return CreateSessionResponse(
        session_id=session.session_id,
        session_type=session.session_type,
        message=f"Session created. Type: {session.session_type}",
    )


@router.post("/message", response_model=SendMessageResponse)
@router.post("/quick", response_model=SendMessageResponse)
@limiter.limit("60/minute")
async def send_message(
    request_body: SendMessageRequest,
    request: Request,
    current_user: CurrentUser,
):
    """Send a message and get fast AI response powered by OpenAI."""
    uid = current_user.firebase_uid if hasattr(current_user, 'firebase_uid') else current_user.get('uid')

    assistant_content = await generate_chat_response(
        user_id=uid,
        session_id=request_body.session_id,
        user_message=request_body.content,
        current_user=current_user,
    )

    return SendMessageResponse(
        message_id=str(uuid4()),
        content=assistant_content,
        agent_name="health_coach_agent",
    )


@router.get("/session/{session_id}/messages")
@limiter.limit("60/minute")
async def get_session_messages(
    session_id: str,
    request: Request,
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


@router.get("/sessions")
@limiter.limit("60/minute")
async def get_sessions(
    request: Request,
    current_user: CurrentUser,
):
    """Get user's chat sessions."""
    uid = current_user.firebase_uid if hasattr(current_user, 'firebase_uid') else current_user.get('uid')
    sessions = await ChatSession.find(ChatSession.user_id == uid).sort("-created_at").to_list()
    
    return {
        "sessions": [
            {
                "session_id": s.session_id,
                "session_type": s.session_type,
                "created_at": s.created_at.isoformat(),
            }
            for s in sessions
        ]
    }
