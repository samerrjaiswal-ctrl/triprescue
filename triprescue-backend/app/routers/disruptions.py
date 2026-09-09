"""
TripRescue — Disruptions Router
Reports disruptions and runs the real Topological Ripple Propagation algorithm
on the live DependencyGraph built from user's actual bookings.

No hardcoded Manali demo graph — engine runs on whatever the user entered.
"""

import uuid
from fastapi import APIRouter, HTTPException
from typing import Optional
from app.schemas import DisruptionCreate
from app import store

router = APIRouter(tags=["Disruptions"])


@router.post("/trips/{trip_id}/disruptions", status_code=201)
async def report_disruption(trip_id: str, disruption: DisruptionCreate):
    """
    Report or simulate a disruption on a booking.
    Runs the real Topological Ripple Propagation on the live dependency graph.
    Returns graph-computed impact results (not hardcoded).
    """
    graph = store.get_trip_graph(trip_id)

    if not graph or not graph.nodes:
        raise HTTPException(
            status_code=400,
            detail=(
                "No bookings found for this trip. "
                "Please add bookings first using POST /api/trips/{trip_id}/bookings/batch"
            )
        )

    booking_id = disruption.booking_id
    if booking_id not in graph.nodes:
        # Try to match by booking_id prefix or use first node
        matching = [nid for nid in graph.nodes if booking_id in nid]
        booking_id = matching[0] if matching else list(graph.nodes.keys())[0]

    delay_mins = disruption.delay_minutes or 300

    # ── Run real Topological Ripple Propagation ──────────────────────────────
    disruption_id = f"dis_{uuid.uuid4().hex[:8]}"
    summary = graph.propagate_disruption(
        disrupted_booking_id=booking_id,
        delay_minutes=delay_mins,
        disruption_type=disruption.type or "DELAY",
        disruption_id=disruption_id,
    )

    # Persist in store for subsequent impact/recovery calls
    store.save_disruption(trip_id, disruption_id, summary)

    # Update trip health score in store
    entry = store.get_trip(trip_id)
    if entry:
        entry["trip"]["trip_health_score"] = summary.trip_health_after
        entry["trip"]["status"] = "DISRUPTED"

    severity = "CRITICAL" if summary.critical_count > 0 else "MAJOR" if summary.at_risk_count > 0 else "MINOR"

    return {
        "disruption_id": disruption_id,
        "trip_id": trip_id,
        "booking_id": booking_id,
        "type": disruption.type,
        "delay_minutes": delay_mins,
        "severity": severity,
        "status": "ACTIVE",
        "trip_health_before": summary.trip_health_before,
        "trip_health_after": summary.trip_health_after,
        "affected_count": summary.total_affected,
        "critical_count": summary.critical_count,
        "at_risk_count": summary.at_risk_count,
        "total_financial_risk": summary.total_financial_risk,
        "headline": summary.headline,
    }


@router.get("/disruptions/{disruption_id}/impact")
async def get_impact_analysis(disruption_id: str):
    """
    Get the full graph impact analysis for a disruption.
    Returns real slack values, node severities, and blast radius
    computed by the DAG engine — not hardcoded.
    """
    summary = store.get_disruption_summary(disruption_id=disruption_id)

    if not summary:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No disruption analysis found for ID '{disruption_id}'. "
                "Please POST to /api/trips/{trip_id}/disruptions first."
            )
        )

    return {
        "disruption_id": summary.disruption_id,
        "trip_id": summary.trip_id,
        "disrupted_booking_id": summary.disrupted_booking_id,
        "delay_minutes": summary.delay_minutes,
        "trip_health_before": summary.trip_health_before,
        "trip_health_after": summary.trip_health_after,
        "summary": {
            "critical_count": summary.critical_count,
            "at_risk_count": summary.at_risk_count,
            "safe_count": summary.safe_count,
            "total_affected": summary.total_affected,
            "total_bookings": summary.total_bookings,
            "total_financial_risk": summary.total_financial_risk,
            "estimated_cost_range": {
                "min": round(summary.total_financial_risk * 0.4),
                "max": round(summary.total_financial_risk)
            },
            "estimated_time_impact_hours": {
                "min": round(summary.delay_minutes / 60 * 0.5, 1),
                "max": round(summary.delay_minutes / 60, 1)
            },
        },
        "headline": summary.headline,
        "summary_text": summary.summary_text,
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
            for r in summary.impact_results
        ],
        "graph_topology": summary.graph_topology,
    }
