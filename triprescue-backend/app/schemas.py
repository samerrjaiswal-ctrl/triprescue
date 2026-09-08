from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Trip Schemas ---
class TripCreate(BaseModel):
    name: str = Field(..., max_length=255)
    destination: str
    start_date: str
    end_date: str
    traveler_count: int = Field(default=1, ge=1)
    budget_ceiling: float = Field(default=5000.0, ge=0)
    recovery_strategy: str = "best_overall"
    preferences: Optional[Dict[str, Any]] = None

class TripResponse(BaseModel):
    id: str
    name: str
    destination: str
    start_date: str
    end_date: str
    traveler_count: int
    budget_ceiling: float
    recovery_strategy: str
    trip_health_score: Optional[int] = None
    status: str = "DRAFT"
    booking_count: Optional[int] = 0
    created_at: Optional[str] = None

# --- Booking Schemas ---
class BookingCreate(BaseModel):
    type: str  # FLIGHT, TRAIN, BUS, HOTEL, TRANSFER, ACTIVITY, TOUR, EVENT
    origin: Optional[str] = None
    destination: Optional[str] = None
    start_time: str
    end_time: str
    provider: Optional[str] = None
    confirmation_number: Optional[str] = None
    cost: float = 0.0
    is_important: bool = False
    notes: Optional[str] = ""

class BookingResponse(BookingCreate):
    id: str
    trip_id: str
    sequence_index: int = 0
    status: str = "CONFIRMED"

# --- Disruption Schemas ---
class DisruptionCreate(BaseModel):
    booking_id: str
    type: str  # DELAY, CANCELLATION, WEATHER, PLAN_CHANGE, CUSTOM
    delay_minutes: Optional[int] = 0
    description: Optional[str] = ""

class DisruptionResponse(BaseModel):
    disruption_id: str
    booking_id: str
    type: str
    delay_minutes: int
    severity: str
    status: str

# --- Recovery Plan Schemas ---
class RecoveryPlanApply(BaseModel):
    confirmed: bool = True

class UserPreferencesUpdate(BaseModel):
    recovery_strategy: Optional[str] = None
    budget_ceiling: Optional[float] = None
    avoid_changing_hotels: Optional[bool] = None
    protect_important_activities: Optional[bool] = None
    avoid_overnight_travel: Optional[bool] = None
    minimize_booking_changes: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    ai_explanations: Optional[bool] = None
