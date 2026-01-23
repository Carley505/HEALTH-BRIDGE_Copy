"""
Habit Plan Model

MongoDB document model for 4-week habit plans.
"""

from datetime import datetime
from typing import Optional, List
from beanie import Document, Indexed
from pydantic import Field, BaseModel


class Habit(BaseModel):
    """Individual habit within a plan."""

    title: str
    description: str
    frequency: str  # daily, 3x_week, weekly
    category: str  # diet, activity, stress, sleep
    difficulty: str = "easy"  # easy, moderate, challenging


class HabitPlan(Document):
    """4-week habit plan document model."""

    user_id: Indexed(str)  # Reference to User.firebase_uid

    # Plan details
    week_number: int = 1  # Current week (1-4)
    start_date: datetime
    end_date: datetime

    # Habits (1-3 per plan)
    habits: List[Habit] = []

    # Status
    status: str = "active"  # active, completed, abandoned

    # Feedback tracking
    adherence_notes: Optional[str] = None
    obstacles_reported: Optional[List[str]] = None
    successes_reported: Optional[List[str]] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "habit_plans"

    def update_timestamp(self):
        """Update the updated_at timestamp."""
        self.updated_at = datetime.utcnow()
