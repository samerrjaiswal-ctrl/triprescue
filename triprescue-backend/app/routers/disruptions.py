from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any
from app.schemas import DisruptionCreate

router = APIRouter(tags=["Disruptions"])

# POST /api/trips/{trip_id}/disruptions - Report disruption
@router.post("/trips/{trip_id}/disruptions", status_code=201)
async def report_disruption(trip_id: str, disruption: DisruptionCreate):
    """
    Report or simulate a disruption on a booking.
    TODO: Create disruption event, trigger cascade evaluation on dependency graph.
    """
    return {
        "disruption_id": "dis_001",
        "trip_id": trip_id,
        "booking_id": disruption.booking_id,
        "type": disruption.type,
        "delay_minutes": disruption.delay_minutes,
        "severity": "MAJOR",
        "status": "ACTIVE",
    }

# GET /api/disruptions/{disruption_id}/impact - Impact Analysis
@router.get("/disruptions/{disruption_id}/impact")
async def get_impact_analysis(disruption_id: str):
    """
    Get graph impact analysis results and AI explanations for downstream cascade.
    TODO: Query Dependency Graph Engine for affected nodes, slack times, and LLM generated headline.
    """
    return {
        "disruption_id": disruption_id,
        "impact_results": [
            {
                "booking_id": "bk_transfer_001",
                "booking_label": "Airport Transfer",
                "booking_type": "TRANSFER",
                "severity": "CRITICAL",
                "slack_minutes": -270,
                "reason_text": "Transfer at 12:30 PM missed — flight arrives at 5:00 PM",
            },
            {
                "booking_id": "bk_train_001",
                "booking_label": "Delhi → Chandigarh Train",
                "booking_type": "TRAIN",
                "severity": "CRITICAL",
                "slack_minutes": -120,
                "reason_text": "Train departs at 5:00 PM — impossible to reach station from airport",
            },
            {
                "booking_id": "bk_bus_001",
                "booking_label": "Chandigarh → Manali Volvo",
                "booking_type": "BUS",
                "severity": "CRITICAL",
                "slack_minutes": -30,
                "reason_text": "Missed train means missing the 10:30 PM Volvo bus",
            },
            {
                "booking_id": "bk_hotel_001",
                "booking_label": "Solang Valley Resort",
                "booking_type": "HOTEL",
                "severity": "AT_RISK",
                "slack_minutes": 0,
                "reason_text": "Check-in delayed past midnight — late check-in notice required",
            },
            {
                "booking_id": "bk_activity_001",
                "booking_label": "Paragliding Session",
                "booking_type": "ACTIVITY",
                "severity": "AT_RISK",
                "slack_minutes": 0,
                "reason_text": "Morning slot at risk if arrival delayed past 9:00 AM",
            },
        ],
        "summary": {
            "critical_count": 3,
            "at_risk_count": 2,
            "safe_count": 0,
            "total_affected": 5,
            "total_bookings": 6,
            "estimated_cost_range": {"min": 1800, "max": 4500},
            "estimated_time_impact_hours": {"min": 1, "max": 5},
        },
        "headline": "Your trip is at risk",
        "summary_text": "A 5-hour flight delay creates multiple downstream impacts across your connected itinerary.",
    }
