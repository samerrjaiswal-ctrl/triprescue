"""
TripRescue — Trips Router
Handles trip creation, listing, detail, and health score.
Uses in-memory store (backed by Supabase) instead of hardcoded data.
"""

import uuid
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.schemas import TripCreate
from app import store

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("", status_code=201)
async def create_trip(trip: TripCreate):
    """Create a new trip and store it."""
    trip_id = f"trip_{uuid.uuid4().hex[:8]}"
    meta = {
        "id": trip_id,
        "name": trip.name,
        "destination": trip.destination,
        "start_date": trip.start_date,
        "end_date": trip.end_date,
        "traveler_count": trip.traveler_count,
        "budget_ceiling": trip.budget_ceiling,
        "recovery_strategy": trip.recovery_strategy,
        "preferences": trip.preferences or {},
        "status": "DRAFT",
        "trip_health_score": None,
        "booking_count": 0,
    }
    store.save_trip(trip_id, meta)
    return meta


@router.get("")
async def list_trips(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("created_at"),
):
    """List all trips in the current session."""
    trips = store.list_trips()
    if status:
        trips = [t for t in trips if t.get("status", "").upper() == status.upper()]
    if search:
        trips = [t for t in trips if search.lower() in t.get("name", "").lower()]
    return {"trips": trips, "total": len(trips)}


@router.get("/{trip_id}")
async def get_trip(trip_id: str):
    """Get full trip details including bookings and graph info."""
    if trip_id == "trip_001":
        store.seed_demo_data()

    entry = store.get_trip(trip_id)
    if not entry:
        # Auto-create a minimal placeholder so demo flow doesn't break
        store.get_or_create_trip(trip_id)
        entry = store.get_trip(trip_id)

    trip_data = dict(entry["trip"])
    bookings = entry.get("bookings", [])
    graph = entry.get("graph")

    trip_data["bookings"] = bookings
    trip_data["booking_count"] = len(bookings)

    if graph:
        trip_data["trip_health_score"] = graph.compute_trip_health()
        trip_data["graph_summary"] = {
            "node_count": len(graph.nodes),
            "edge_count": len(graph.edges),
        }
    else:
        trip_data["trip_health_score"] = trip_data.get("trip_health_score") or (92 if bookings else None)
        trip_data["graph_summary"] = {"node_count": 0, "edge_count": 0}

    trip_data.setdefault("active_disruptions", [])
    trip_data.setdefault("dependencies", [])
    trip_data.setdefault("preferences", {
        "avoid_changing_hotels": True,
        "protect_important_activities": True,
        "avoid_overnight_travel": True,
        "minimize_booking_changes": False,
    })

    return trip_data


@router.get("/{trip_id}/health")
async def get_trip_health(trip_id: str):
    """Compute and return real Trip Health score from the live dependency graph."""
    entry = store.get_trip(trip_id)
    graph = entry["graph"] if entry else None

    if not graph:
        return {
            "trip_id": trip_id,
            "trip_health_score": 100,
            "status": "STABLE",
            "connections": {"safe": 0, "at_risk": 0, "critical": 0},
            "message": "No bookings added yet."
        }

    health = graph.compute_trip_health()
    safe = sum(1 for n in graph.nodes.values() if n.status.value == "SAFE")
    at_risk = sum(1 for n in graph.nodes.values() if n.status.value == "AT_RISK")
    critical = sum(1 for n in graph.nodes.values() if n.status.value == "CRITICAL")

    if health >= 85:
        status = "STABLE"
    elif health >= 60:
        status = "AT_RISK"
    else:
        status = "DISRUPTED"

    return {
        "trip_id": trip_id,
        "trip_health_score": health,
        "status": status,
        "connections": {"safe": safe, "at_risk": at_risk, "critical": critical},
        "total_bookings": len(graph.nodes),
    }
