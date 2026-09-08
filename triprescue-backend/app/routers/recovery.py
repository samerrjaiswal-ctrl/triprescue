from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any
from app.schemas import RecoveryPlanApply

router = APIRouter(tags=["Recovery"])

# GET /api/disruptions/{disruption_id}/recovery-plans - Generate/List plans
@router.get("/disruptions/{disruption_id}/recovery-plans")
async def get_recovery_plans(disruption_id: str):
    """
    Generate or retrieve ranked recovery plans for a disruption.
    TODO: Run Recovery Engine scoring algorithm and AI rationale generation.
    """
    return {
        "disruption_id": disruption_id,
        "plans": [
            {
                "id": "plan_cheapest",
                "label": "CHEAPEST",
                "is_recommended": False,
                "additional_cost": 900,
                "time_impact_hours": 3.5,
                "itinerary_preserved_pct": 78,
                "bookings_changed_count": 3,
                "convenience_score": 3.0,
                "hotel_preserved": False,
                "activity_preserved": False,
                "rationale_text": "Cheapest alternative rebooks overnight sleeper bus. Minimal added expense, but delays arrival and cancels morning activity.",
                "changes": [
                    {
                        "original_booking": "Delhi → Chandigarh Train (5:00 PM)",
                        "new_booking": "Delhi → Manali Overnight Bus (11:00 PM)",
                        "change_type": "REBOOKED",
                    },
                    {
                        "original_booking": "Paragliding Session",
                        "new_booking": "Cancelled (Refund Requested)",
                        "change_type": "CANCELLED",
                    },
                ],
            },
            {
                "id": "plan_best",
                "label": "BEST_OVERALL",
                "is_recommended": True,
                "additional_cost": 2100,
                "time_impact_hours": 1.2,
                "itinerary_preserved_pct": 92,
                "bookings_changed_count": 2,
                "convenience_score": 4.5,
                "hotel_preserved": True,
                "activity_preserved": True,
                "rationale_text": "Best Overall balances budget with zero itinerary loss. Rebooks late evening train and private cab transfer directly to Manali.",
                "changes": [
                    {
                        "original_booking": "Delhi → Chandigarh Train (5:00 PM)",
                        "new_booking": "Delhi → Chandigarh Shatabdi (9:00 PM)",
                        "change_type": "REBOOKED",
                    },
                    {
                        "original_booking": "Chandigarh → Manali Volvo",
                        "new_booking": "Chandigarh → Manali Private Cab",
                        "change_type": "REPLACED",
                    },
                ],
            },
            {
                "id": "plan_fastest",
                "label": "FASTEST",
                "is_recommended": False,
                "additional_cost": 4500,
                "time_impact_hours": 0.0,
                "itinerary_preserved_pct": 100,
                "bookings_changed_count": 1,
                "convenience_score": 5.0,
                "hotel_preserved": True,
                "activity_preserved": True,
                "rationale_text": "Fastest option takes direct connecting flight from Delhi to Bhuntar (Kullu). Arrives on original schedule with zero activity delay.",
                "changes": [
                    {
                        "original_booking": "Delhi → Chandigarh Train + Volvo",
                        "new_booking": "Connecting Flight Delhi → Bhuntar (Kullu)",
                        "change_type": "REBOOKED",
                    },
                ],
            },
        ],
        "recommendation_explanation": "Best Overall is recommended because it preserves your hotel and important activity while keeping additional cost moderate.",
        "how_we_decide": "Plans are ranked using a weighted composite of cost (30%), time impact (25%), itinerary preservation (25%), and convenience (20%).",
    }

# GET /api/recovery-plans/{plan_id}/compare - Compare plans
@router.get("/recovery-plans/{plan_id}/compare")
async def compare_plans(plan_id: str):
    """
    Structured comparison data across all 3 recovery archetypes.
    TODO: Query DB for generated plan matrix.
    """
    return {
        "plans": [
            {
                "label": "CHEAPEST",
                "additional_cost": 900,
                "time_impact_hours": 3.5,
                "itinerary_preserved_pct": 78,
                "bookings_changed": 3,
                "hotel_preserved": False,
                "activity_preserved": False,
                "convenience_score": 3.0,
                "is_recommended": False,
            },
            {
                "label": "BEST_OVERALL",
                "additional_cost": 2100,
                "time_impact_hours": 1.2,
                "itinerary_preserved_pct": 92,
                "bookings_changed": 2,
                "hotel_preserved": True,
                "activity_preserved": True,
                "convenience_score": 4.5,
                "is_recommended": True,
            },
            {
                "label": "FASTEST",
                "additional_cost": 4500,
                "time_impact_hours": 0.0,
                "itinerary_preserved_pct": 100,
                "bookings_changed": 1,
                "hotel_preserved": True,
                "activity_preserved": True,
                "convenience_score": 5.0,
                "is_recommended": False,
            },
        ],
        "recommendation_rationale": "Best Overall costs ₹1,200 more than cheapest but saves ~2.3 hours and preserves 100% of hotel stay and activities.",
    }

# POST /api/recovery-plans/{plan_id}/apply - Execute/Confirm recovery plan
@router.post("/recovery-plans/{plan_id}/apply")
async def apply_recovery_plan(plan_id: str, payload: RecoveryPlanApply):
    """
    Execute selected recovery plan, update bookings, and recalculate Trip Health.
    TODO: Atomic transaction updating bookings in PostgreSQL and notifying providers.
    """
    return {
        "applied": True,
        "plan_id": plan_id,
        "trip_health_before": 23,
        "trip_health_after": 98,
        "trip_status": "STABLE",
        "recovery_summary": {
            "bookings_changed": 2,
            "bookings_preserved": 4,
            "additional_cost": 2100,
            "refunds": 500,
            "new_charges": 2600,
            "net_cost": 2100,
            "additional_time_hours": 1.2,
        },
        "message": "Trip successfully recovered! Downstream bookings have been updated.",
    }
