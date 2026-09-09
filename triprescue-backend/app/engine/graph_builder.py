"""
TripRescue — Graph Builder
Constructs a DependencyGraph from a list of user-submitted bookings.

Key decisions:
- Sorts bookings chronologically using day_offset + start_time
- Auto-infers dependency edges based on booking type sequences
- Uses booking type pairs to assign appropriate buffer times
- Supports any combination of booking types (not just hardcoded Manali route)
"""

from typing import List, Dict, Any
from app.engine.graph import DependencyGraph, time_str_to_minutes
from app.engine.models import GraphNode, GraphEdge, BookingType, NodeSeverity

# Default buffer times between different booking type transitions (in minutes)
BUFFER_MATRIX: Dict[str, Dict[str, int]] = {
    "FLIGHT":   {"TRANSFER": 30, "HOTEL": 90, "TRAIN": 180, "BUS": 180, "ACTIVITY": 240, "FLIGHT": 120},
    "TRANSFER": {"HOTEL": 30, "TRAIN": 60, "BUS": 60, "ACTIVITY": 60, "TRANSFER": 30},
    "HOTEL":    {"TRANSFER": 30, "TRAIN": 120, "BUS": 90, "ACTIVITY": 60, "FLIGHT": 120},
    "TRAIN":    {"TRANSFER": 30, "BUS": 60, "HOTEL": 60, "ACTIVITY": 60, "TRAIN": 90},
    "BUS":      {"HOTEL": 60, "TRANSFER": 30, "ACTIVITY": 180, "BUS": 60},
    "ACTIVITY": {"TRANSFER": 30, "HOTEL": 60, "BUS": 30, "TRAIN": 60, "FLIGHT": 120},
    "CAB":      {"HOTEL": 30, "TRAIN": 60, "BUS": 60, "ACTIVITY": 60},
}

DEPENDENCY_TYPE_MAP: Dict[str, Dict[str, str]] = {
    "FLIGHT":   {"TRANSFER": "AIRPORT_EXIT", "HOTEL": "DIRECT_HOTEL", "TRAIN": "STATION_TRANSFER", "BUS": "BUS_TRANSFER"},
    "TRANSFER": {"HOTEL": "HOTEL_CHECKIN", "TRAIN": "STATION_ARRIVAL", "BUS": "BUS_ARRIVAL"},
    "HOTEL":    {"TRANSFER": "HOTEL_CHECKOUT", "TRAIN": "STATION_TRANSFER", "BUS": "BUS_CONNECTION", "FLIGHT": "AIRPORT_TRANSFER"},
    "TRAIN":    {"TRANSFER": "STATION_EXIT", "BUS": "BUS_CONNECTION", "HOTEL": "HOTEL_ARRIVAL", "ACTIVITY": "ACTIVITY_BUFFER"},
    "BUS":      {"HOTEL": "HOTEL_ARRIVAL", "TRANSFER": "ARRIVAL_TRANSFER", "ACTIVITY": "ACTIVITY_BUFFER"},
    "ACTIVITY": {"TRANSFER": "RETURN_TRANSFER", "HOTEL": "HOTEL_RETURN"},
}


def _normalize_type(type_str: str) -> str:
    """Normalize booking type string to canonical enum value."""
    t = type_str.upper().strip()
    mapping = {
        "CAB": "TRANSFER",
        "TAXI": "TRANSFER",
        "PICKUP": "TRANSFER",
        "DROP": "TRANSFER",
        "VOLVO": "BUS",
        "SLEEPER": "BUS",
        "OVERNIGHT_BUS": "BUS",
        "STAY": "HOTEL",
        "CHECK_IN": "HOTEL",
        "EXPERIENCE": "ACTIVITY",
        "TOUR": "ACTIVITY",
        "EVENT": "ACTIVITY",
    }
    return mapping.get(t, t)


def _get_buffer(from_type: str, to_type: str) -> int:
    """Get minimum buffer minutes between two booking types."""
    from_t = _normalize_type(from_type)
    to_t = _normalize_type(to_type)
    row = BUFFER_MATRIX.get(from_t, {})
    return row.get(to_t, 30)  # Default 30 min buffer


def _get_dep_type(from_type: str, to_type: str) -> str:
    from_t = _normalize_type(from_type)
    to_t = _normalize_type(to_type)
    row = DEPENDENCY_TYPE_MAP.get(from_t, {})
    return row.get(to_t, "SEQUENTIAL")


def build_graph_from_bookings(trip_id: str, bookings: List[Dict[str, Any]]) -> DependencyGraph:
    """
    Build a live DependencyGraph from a user's list of bookings.

    Args:
        trip_id: Trip identifier
        bookings: List of booking dicts (from manual form or AI extraction).
                  Each must have: id, type, title, start_time, day_offset
                  Optional: end_time, cost, provider, confirmation_number, is_important

    Returns:
        DependencyGraph ready for disruption propagation
    """
    trip_name = f"Trip {trip_id}"
    graph = DependencyGraph(trip_id=trip_id, trip_name=trip_name)

    if not bookings:
        return graph

    # Sort bookings chronologically: day_offset first, then start_time within day
    def sort_key(b: Dict) -> int:
        return time_str_to_minutes(b.get("start_time", "00:00"), b.get("day_offset", 0))

    sorted_bookings = sorted(bookings, key=sort_key)

    # Add nodes
    for bk in sorted_bookings:
        raw_type = bk.get("type", "FLIGHT")
        norm_type = _normalize_type(raw_type)

        # Map to BookingType enum (fallback to ACTIVITY)
        try:
            btype = BookingType(norm_type)
        except ValueError:
            btype = BookingType.ACTIVITY

        node = GraphNode(
            id=bk["id"],
            title=bk.get("title") or bk.get("name") or f"{norm_type} booking",
            type=btype,
            start_time=bk.get("start_time", "00:00"),
            end_time=bk.get("end_time"),
            day_offset=int(bk.get("day_offset", 0)),
            cost=float(bk.get("cost", 0.0)),
            is_refundable=bool(bk.get("is_refundable", True)),
            confirmation_ref=bk.get("confirmation_number") or bk.get("confirmation_ref"),
            provider=bk.get("provider"),
            status=NodeSeverity.SAFE,
        )
        graph.add_node(node)

    # Auto-infer edges: connect sequentially based on chronological order
    # Only add edge if nodes are logically connected (temporal proximity)
    node_ids = [bk["id"] for bk in sorted_bookings]

    for i in range(len(node_ids) - 1):
        from_id = node_ids[i]
        to_id = node_ids[i + 1]

        from_node = graph.nodes[from_id]
        to_node = graph.nodes[to_id]

        from_end_mins = time_str_to_minutes(
            from_node.end_time or from_node.start_time,
            from_node.day_offset
        )
        to_start_mins = time_str_to_minutes(to_node.start_time, to_node.day_offset)

        # Only create edge if the gap is reasonable (within 36 hours = 2160 min)
        gap = to_start_mins - from_end_mins
        if gap <= 2160:
            buffer = _get_buffer(from_node.type.value, to_node.type.value)
            dep_type = _get_dep_type(from_node.type.value, to_node.type.value)
            edge = GraphEdge(
                from_node=from_id,
                to_node=to_id,
                min_buffer_minutes=buffer,
                dependency_type=dep_type,
            )
            graph.add_edge(edge)

    return graph
