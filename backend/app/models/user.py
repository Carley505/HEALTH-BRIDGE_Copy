"""
User Model

MongoDB document model for user accounts.
"""

from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import EmailStr, Field


class User(Document):
    """User document model."""

    email: Indexed(EmailStr, unique=True)
    firebase_uid: Indexed(str, unique=True)
    display_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

    def update_timestamp(self):
        """Update the updated_at timestamp."""
        self.updated_at = datetime.utcnow()
