"""
TripRescue — In-Memory Trip Store (with Supabase sync)
Stores trips, bookings, graphs, and disruption state in-session.
Supabase is used as persistent backing store when available.
"""

import os
import uuid
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# In-memory store structure:
# trips_store[trip_id] = {
#   "trip":     { trip metadata dict },
#   "bookings": [ list of booking dicts ],
#   "graph":    DependencyGraph | None,
#   "last_disruption_id": str | None,
#   "last_disruption_summary": DisruptionImpactSummary | None,
# }
# ---------------------------------------------------------------------------
trips_store: Dict[str, Dict[str, Any]] = {}


def get_or_create_trip(trip_id: str, meta: Optional[Dict] = None) -> Dict:
    """Return existing trip or create a new one in the store."""
    if trip_id not in trips_store:
        trips_store[trip_id] = {
            "trip": meta or {
                "id": trip_id,
                "name": "My Trip",
                "destination": "",
                "start_date": "",
                "end_date": "",
                "traveler_count": 1,
                "budget_ceiling": 5000.0,
                "recovery_strategy": "best_overall",
                "preferences": {},
                "status": "DRAFT",
                "trip_health_score": None,
            },
            "bookings": [],
            "graph": None,
            "last_disruption_id": None,
            "last_disruption_summary": None,
        }
    elif meta:
        trips_store[trip_id]["trip"].update(meta)
    return trips_store[trip_id]


def get_trip(trip_id: str) -> Optional[Dict]:
    return trips_store.get(trip_id)


def list_trips() -> List[Dict]:
    return [entry["trip"] for entry in trips_store.values()]


def seed_demo_data() -> None:
    """Seed canonical Manali Adventure trip (trip_001) and precompute demo disruption (dis_001)."""
    if "trip_001" in trips_store:
        return

    from app.engine.graph import build_manali_demo_graph

    trip_id = "trip_001"
    meta = {
        "id": trip_id,
        "name": "Manali Adventure",
        "destination": "Manali, Himachal Pradesh",
        "start_date": "2026-09-12",
        "end_date": "2026-09-17",
        "traveler_count": 2,
        "budget_ceiling": 5000.0,
        "recovery_strategy": "best_overall",
        "preferences": {
            "avoid_changing_hotels": True,
            "protect_important_activities": True,
            "avoid_overnight_travel": True,
            "minimize_booking_changes": False,
        },
        "status": "DISRUPTED",
        "trip_health_score": 23,
        "booking_count": 6,
    }

    bookings = [
        {
            "id": "bk_1",
            "trip_id": trip_id,
            "type": "FLIGHT",
            "title": "Pune to New Delhi (IndiGo 6E-1234)",
            "origin": "Pune (PNQ)",
            "destination": "New Delhi (DEL)",
            "start_time": "10:00",
            "end_time": "12:00",
            "day_offset": 0,
            "cost": 8400.0,
            "is_important": False,
            "is_refundable": False,
            "provider": "IndiGo Airlines",
            "confirmation_number": "6E-1234-DEL",
        },
        {
            "id": "bk_2",
            "trip_id": trip_id,
            "type": "TRANSFER",
            "title": "Airport Transfer (DEL T2 to Hotel)",
            "origin": "DEL Airport T2",
            "destination": "Connaught Place",
            "start_time": "12:30",
            "end_time": "13:30",
            "day_offset": 0,
            "cost": 1100.0,
            "is_important": False,
            "is_refundable": False,
            "provider": "Uber Premier",
            "confirmation_number": "UB-5678-DEL",
        },
        {
            "id": "bk_3",
            "trip_id": trip_id,
            "type": "HOTEL",
            "title": "The Imperial, New Delhi (Day Use)",
            "origin": "New Delhi",
            "destination": "New Delhi",
            "start_time": "14:00",
            "end_time": "16:00",
            "day_offset": 0,
            "cost": 6500.0,
            "is_important": False,
            "is_refundable": False,
            "provider": "The Imperial Hotel",
            "confirmation_number": "IMP-9012-DEL",
        },
        {
            "id": "bk_4",
            "trip_id": trip_id,
            "type": "TRAIN",
            "title": "Delhi to Chandigarh Shatabdi (12005)",
            "origin": "NDLS",
            "destination": "CDG",
            "start_time": "17:00",
            "end_time": "20:30",
            "day_offset": 0,
            "cost": 2400.0,
            "is_important": True,
            "is_refundable": False,
            "provider": "Indian Railways",
            "confirmation_number": "IRCTC-12005",
        },
        {
            "id": "bk_5",
            "trip_id": trip_id,
            "type": "BUS",
            "title": "Chandigarh to Manali Volvo (HRTC)",
            "origin": "Chandigarh Sec 43",
            "destination": "Manali Mall Road",
            "start_time": "23:00",
            "end_time": "07:00",
            "day_offset": 0,
            "cost": 2800.0,
            "is_important": True,
            "is_refundable": False,
            "provider": "Himachal Tourism",
            "confirmation_number": "HRTC-VOL-882",
        },
        {
            "id": "bk_6",
            "trip_id": trip_id,
            "type": "ACTIVITY",
            "title": "Solang Valley Paragliding",
            "origin": "Solang",
            "destination": "Solang",
            "start_time": "10:00",
            "end_time": "16:00",
            "day_offset": 1,
            "cost": 3500.0,
            "is_important": True,
            "is_refundable": False,
            "provider": "Himalayan Adventures",
            "confirmation_number": "ACT-SOLANG-77",
        },
    ]

    graph = build_manali_demo_graph()
    summary = graph.propagate_disruption(
        disrupted_booking_id="bk_1",
        delay_minutes=300,
        disruption_type="DELAY",
        disruption_id="dis_001",
    )

    trips_store[trip_id] = {
        "trip": meta,
        "bookings": bookings,
        "graph": graph,
        "last_disruption_id": "dis_001",
        "last_disruption_summary": summary,
    }


def save_trip(trip_id: str, meta: Dict) -> Dict:
    """Create or update trip metadata. Also syncs to Supabase if available."""
    entry = get_or_create_trip(trip_id, meta)
    _supabase_upsert_trip(meta)
    return entry["trip"]


def add_booking_to_trip(trip_id: str, booking: Dict) -> Dict:
    """Add a single booking to a trip and rebuild the graph."""
    entry = get_or_create_trip(trip_id)
    # Assign id if missing
    if "id" not in booking or not booking["id"]:
        booking["id"] = f"bk_{uuid.uuid4().hex[:8]}"
    booking["trip_id"] = trip_id
    booking.setdefault("sequence_index", len(entry["bookings"]))
    entry["bookings"].append(booking)
    _rebuild_graph(trip_id)
    _supabase_upsert_booking(booking)
    return booking


def set_bookings_for_trip(trip_id: str, bookings: List[Dict]) -> List[Dict]:
    """Replace all bookings for a trip (batch set) and rebuild the graph."""
    entry = get_or_create_trip(trip_id)
    enriched = []
    for i, bk in enumerate(bookings):
        bk["id"] = bk.get("id") or f"bk_{uuid.uuid4().hex[:8]}"
        bk["trip_id"] = trip_id
        bk["sequence_index"] = i
        enriched.append(bk)
    entry["bookings"] = enriched
    _rebuild_graph(trip_id)
    for bk in enriched:
        _supabase_upsert_booking(bk)
    return enriched


def get_trip_graph(trip_id: str):
    """Return the live DependencyGraph for a trip, or None."""
    entry = trips_store.get(trip_id)
    return entry["graph"] if entry else None


def set_trip_graph(trip_id: str, graph) -> None:
    entry = get_or_create_trip(trip_id)
    entry["graph"] = graph


def save_disruption(trip_id: str, disruption_id: str, summary) -> None:
    entry = get_or_create_trip(trip_id)
    entry["last_disruption_id"] = disruption_id
    entry["last_disruption_summary"] = summary


def get_disruption_summary(trip_id: str = None, disruption_id: str = None):
    """Return cached disruption summary. Searches by trip_id or disruption_id."""
    for t_id, entry in trips_store.items():
        if trip_id and t_id != trip_id:
            continue
        if entry["last_disruption_summary"] is not None:
            if disruption_id is None or entry["last_disruption_id"] == disruption_id:
                return entry["last_disruption_summary"]
    return None


def _rebuild_graph(trip_id: str) -> None:
    """Rebuild the DependencyGraph from stored bookings."""
    # Import here to avoid circular imports
    from app.engine.graph_builder import build_graph_from_bookings
    entry = trips_store.get(trip_id)
    if entry and entry["bookings"]:
        entry["graph"] = build_graph_from_bookings(trip_id, entry["bookings"])


# ---------------------------------------------------------------------------
# Supabase sync helpers (fire-and-forget — no crash if unavailable)
# ---------------------------------------------------------------------------
def _get_supabase():
    try:
        from supabase import create_client
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        if not url or not key:
            return None
        return create_client(url, key)
    except Exception:
        return None


def _supabase_upsert_trip(trip: Dict):
    try:
        sb = _get_supabase()
        if sb:
            sb.table("trips").upsert(trip).execute()
    except Exception:
        pass  # Never crash the app on DB failure


def _supabase_upsert_booking(booking: Dict):
    try:
        sb = _get_supabase()
        if sb:
            # Only keep serializable keys
            safe = {k: v for k, v in booking.items() if not callable(v)}
            sb.table("bookings").upsert(safe).execute()
    except Exception:
        pass
