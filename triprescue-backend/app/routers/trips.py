from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.schemas import TripCreate, TripResponse

router = APIRouter(prefix="/trips", tags=["Trips"])

# POST /api/trips - Create a new trip
@router.post("", status_code=201)
async def create_trip(trip: TripCreate):
    """
    Create a new trip.
    TODO: Insert into PostgreSQL via SQLAlchemy and return new trip record.
    """
    return {
        "id": "trip_001",
        "name": trip.name,
        "destination": trip.destination,
        "status": "DRAFT",
        "trip_health_score": None,
        "created_at": "2026-09-08T18:00:00Z",
    }

# GET /api/trips - List trips
@router.get("")
async def list_trips(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("created_at"),
):
    """
    List all trips for the authenticated user.
    TODO: Query PostgreSQL with filters and sorting.
    """
    return {
        "trips": [
            {
                "id": "trip_001",
                "name": "Manali Adventure",
                "destination": "Manali",
                "start_date": "2026-09-12",
                "end_date": "2026-09-17",
                "traveler_count": 2,
                "trip_health_score": 92,
                "status": "ACTIVE",
                "booking_count": 6,
            }
        ],
        "total": 1,
    }

# GET /api/trips/{trip_id} - Get full trip details
@router.get("/{trip_id}")
async def get_trip(trip_id: str):
    """
    Get full trip details including bookings, dependencies, and health score.
    TODO: Query PostgreSQL for trip, bookings, graph dependencies, and active disruptions.
    """
    return {
        "id": trip_id,
        "name": "Manali Adventure",
        "destination": "Manali",
        "start_date": "2026-09-12",
        "end_date": "2026-09-17",
        "traveler_count": 2,
        "budget_ceiling": 5000.0,
        "recovery_strategy": "best_overall",
        "trip_health_score": 92,
        "status": "ACTIVE",
        "bookings": [],
        "dependencies": [],
        "active_disruptions": [],
        "preferences": {
            "avoid_changing_hotels": True,
            "protect_important_activities": True,
            "avoid_overnight_travel": True,
            "minimize_booking_changes": False,
        },
    }

# GET /api/trips/{trip_id}/health - Trip Health
@router.get("/{trip_id}/health")
async def get_trip_health(trip_id: str):
    """
    Calculate and retrieve current Trip Health score and connection breakdown.
    TODO: Run Trip Health Engine algorithm over current dependency graph.
    """
    return {
        "trip_id": trip_id,
        "trip_health_score": 92,
        "status": "ACTIVE",
        "connections": {
            "safe": 5,
            "at_risk": 0,
            "critical": 0,
        },
    }
