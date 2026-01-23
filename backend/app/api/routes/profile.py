"""
Profile API Routes

Endpoints for health profile management.
"""

from typing import Optional, List
from fastapi import APIRouter
from pydantic import BaseModel

from app.api.deps import CurrentUser

router = APIRouter()


# Request/Response Models
class ConstraintsModel(BaseModel):
    """SDOH constraints."""
    exercise_safety: str = "safe"
    income_band: str = "moderate"
    food_access: str = "good"
    time_availability: str = "moderate"
    additional_notes: Optional[str] = None


class ProfileResponse(BaseModel):
    """Health profile response."""
    age_band: Optional[str] = None
    sex: Optional[str] = None
    family_history_hypertension: bool = False
    family_history_diabetes: bool = False
    smoking_status: str = "never"
    alcohol_consumption: str = "none"
    bmi_category: str = "normal"
    activity_level: str = "sedentary"
    diet_pattern: str = "mixed"
    risk_bands: Optional[dict] = None
    top_risk_factors: Optional[List[str]] = None
    constraints: Optional[ConstraintsModel] = None


class UpdateProfileRequest(BaseModel):
    """Request to update profile."""
    age_band: Optional[str] = None
    sex: Optional[str] = None
    family_history_hypertension: Optional[bool] = None
    family_history_diabetes: Optional[bool] = None
    smoking_status: Optional[str] = None
    alcohol_consumption: Optional[str] = None
    bmi_category: Optional[str] = None
    activity_level: Optional[str] = None
    diet_pattern: Optional[str] = None
    constraints: Optional[ConstraintsModel] = None


# Endpoints
@router.get("", response_model=ProfileResponse)
async def get_profile(current_user: CurrentUser):
    """Get current user's health profile."""
    # TODO: Retrieve profile from database (Phase 7)
    return ProfileResponse()


@router.put("", response_model=ProfileResponse)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: CurrentUser,
):
    """Update user's health profile."""
    # TODO: Update profile in database (Phase 7)
    return ProfileResponse(**request.model_dump(exclude_unset=True))


@router.get("/constraints", response_model=ConstraintsModel)
async def get_constraints(current_user: CurrentUser):
    """Get user's SDOH constraints."""
    # TODO: Retrieve constraints from database (Phase 7)
    return ConstraintsModel()


@router.put("/constraints", response_model=ConstraintsModel)
async def update_constraints(
    constraints: ConstraintsModel,
    current_user: CurrentUser,
):
    """Update user's SDOH constraints."""
    # TODO: Update constraints in database (Phase 7)
    return constraints
