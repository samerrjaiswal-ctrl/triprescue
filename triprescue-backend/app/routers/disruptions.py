from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any
from app.schemas import DisruptionCreate
from app.engine.graph import build_manali_demo_graph, DependencyGraph
from app.engine.models import DisruptionImpactSummary

router = APIRouter(tags=["Disruptions"])

# Active in-memory graph state for demo
active_graph: DependencyGraph = build_manali_demo_graph()
last_summary: Optional[DisruptionImpactSummary] = None

# POST /api/trips/{trip_id}/disruptions - Report disruption
@router.post("/trips/{trip_id}/disruptions", status_code=201)
async def report_disruption(trip_id: str, disruption: DisruptionCreate):
    """
    Report or simulate a disruption on a booking.
    Executes real-time Dependency Graph Topological Ripple Propagation.
    """
    global active_graph, last_summary

    # Fresh graph reset for the calculation
    active_graph = build_manali_demo_graph()

    # Default to bk_1 (flight) if booking_id isn't directly recognized
    booking_id = disruption.booking_id if disruption.booking_id in active_graph.nodes else "bk_1"
    delay_mins = disruption.delay_minutes or 300

    # Run Topological Ripple Propagation Algorithm
    last_summary = active_graph.propagate_disruption(
        disrupted_booking_id=booking_id,
        delay_minutes=delay_mins,
        disruption_type=disruption.type or "DELAY",
        disruption_id="dis_001",
    )

    return {
        "disruption_id": last_summary.disruption_id,
        "trip_id": trip_id,
        "booking_id": booking_id,
        "type": disruption.type,
        "delay_minutes": delay_mins,
        "severity": "CRITICAL" if last_summary.critical_count > 0 else "MAJOR",
        "status": "ACTIVE",
        "trip_health_after": last_summary.trip_health_after,
        "affected_count": last_summary.total_affected,
        "critical_count": last_summary.critical_count,
        "at_risk_count": last_summary.at_risk_count,
        "total_financial_risk": last_summary.total_financial_risk,
    }


# GET /api/disruptions/{disruption_id}/impact - Impact Analysis
@router.get("/disruptions/{disruption_id}/impact")
async def get_impact_analysis(disruption_id: str):
    """
    Get graph impact analysis results and AI explanations for downstream cascade.
    Queries the Dependency Graph Engine for affected nodes, slack times, and blast radius.
    """
    global active_graph, last_summary

    # Ensure propagation has run at least once
    if last_summary is None:
        active_graph = build_manali_demo_graph()
        last_summary = active_graph.propagate_disruption(
            disrupted_booking_id="bk_1",
            delay_minutes=300,
            disruption_type="DELAY",
            disruption_id=disruption_id,
        )

    return {
        "disruption_id": last_summary.disruption_id,
        "trip_id": last_summary.trip_id,
        "disrupted_booking_id": last_summary.disrupted_booking_id,
        "delay_minutes": last_summary.delay_minutes,
        "trip_health_before": last_summary.trip_health_before,
        "trip_health_after": last_summary.trip_health_after,
        "summary": {
            "critical_count": last_summary.critical_count,
            "at_risk_count": last_summary.at_risk_count,
            "safe_count": last_summary.safe_count,
            "total_affected": last_summary.total_affected,
            "total_bookings": last_summary.total_bookings,
            "total_financial_risk": last_summary.total_financial_risk,
            "estimated_cost_range": {"min": 1800, "max": 4500},
            "estimated_time_impact_hours": {"min": 1.2, "max": 5.0},
        },
        "headline": last_summary.headline,
        "summary_text": last_summary.summary_text,
        "impact_results": [
            {
                "booking_id": r.booking_id,
                "booking_label": r.booking_label,
                "booking_type": r.booking_type,
                "severity": r.severity.value,
                "slack_minutes": r.slack_minutes,
                "reason_text": r.reason_text,
                "original_start": r.original_start,
                "effective_upstream_end": r.effective_upstream_end,
                "required_buffer": r.required_buffer,
                "cost_at_risk": r.cost_at_risk,
                "is_non_refundable": r.is_non_refundable,
            }
            for r in last_summary.impact_results
        ],
        "graph_topology": last_summary.graph_topology,
    }
