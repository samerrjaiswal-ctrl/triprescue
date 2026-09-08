from fastapi import APIRouter
from typing import Dict, Any
from app.schemas import UserPreferencesUpdate

router = APIRouter(prefix="/users", tags=["Users"])

# GET /api/users/{user_id}/preferences
@router.get("/{user_id}/preferences")
async def get_user_preferences(user_id: str):
    """
    Get user profile and recovery preferences.
    TODO: Query user_preferences table in PostgreSQL.
    """
    return {
        "user_id": user_id,
        "recovery_strategy": "best_overall",
        "budget_ceiling": 5000,
        "avoid_changing_hotels": True,
        "protect_important_activities": True,
        "avoid_overnight_travel": True,
        "minimize_booking_changes": False,
        "notifications_enabled": True,
        "ai_explanations": True,
    }

# PATCH /api/users/{user_id}/preferences
@router.patch("/{user_id}/preferences")
async def update_user_preferences(user_id: str, prefs: UserPreferencesUpdate):
    """
    Update recovery preferences.
    TODO: Persist updated preferences to PostgreSQL.
    """
    return {
        "user_id": user_id,
        "updated": True,
        "preferences": prefs.model_dump(exclude_unset=True),
    }
