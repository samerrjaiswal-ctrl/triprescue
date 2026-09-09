"""
TripRescue — Graph Engine Data Models
Defines internal representations of DAG Nodes, Edges, Slack, and Severity.
Follows docs/DATA_ARCHITECTURE.md and docs/DEMO_NODE_INPUT_OUTPUT.md.
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class NodeSeverity(str, Enum):
    SAFE = "SAFE"
    AT_RISK = "AT_RISK"
    CRITICAL = "CRITICAL"
    DISRUPTED = "DISRUPTED"
    RECOVERED = "RECOVERED"
    CANCELLED = "CANCELLED"


class BookingType(str, Enum):
    FLIGHT = "FLIGHT"
    TRANSFER = "TRANSFER"
    HOTEL = "HOTEL"
    TRAIN = "TRAIN"
    BUS = "BUS"
    ACTIVITY = "ACTIVITY"


class GraphNode(BaseModel):
    id: str
    title: str
    type: BookingType
    start_time: str  # e.g. "10:00" or ISO
    end_time: Optional[str] = None  # e.g. "12:00"
    day_offset: int = 0  # 0 for Day 1, 1 for Day 2
    cost: float = 0.0
    is_refundable: bool = False
    confirmation_ref: Optional[str] = None
    provider: Optional[str] = None
    status: NodeSeverity = NodeSeverity.SAFE
    
    # Computed during disruption propagation
    slack_minutes: Optional[int] = None
    reason_text: Optional[str] = None
    effective_start: Optional[str] = None
    effective_end: Optional[str] = None


class GraphEdge(BaseModel):
    from_node: str
    to_node: str
    min_buffer_minutes: int  # transit, check-in, or rest buffer required
    dependency_type: str = "SEQUENTIAL"  # e.g. AIRPORT_EXIT, CHECK_IN, STATION_TRANSFER
    description: Optional[str] = None


class DisruptionEvent(BaseModel):
    disruption_id: str
    trip_id: str
    booking_id: str
    type: str = "DELAY"  # DELAY, CANCELLATION, WEATHER
    delay_minutes: int
    new_arrival: Optional[str] = None
    reason: Optional[str] = None


class ImpactResult(BaseModel):
    booking_id: str
    booking_label: str
    booking_type: str
    severity: NodeSeverity
    slack_minutes: int
    reason_text: str
    original_start: str
    effective_upstream_end: str
    required_buffer: int
    cost_at_risk: float
    is_non_refundable: bool


class DisruptionImpactSummary(BaseModel):
    disruption_id: str
    trip_id: str
    disrupted_booking_id: str
    delay_minutes: int
    trip_health_before: int
    trip_health_after: int
    critical_count: int
    at_risk_count: int
    safe_count: int
    total_affected: int
    total_bookings: int
    total_financial_risk: float
    estimated_time_impact_hours: float
    headline: str
    summary_text: str
    impact_results: List[ImpactResult]
    graph_topology: Dict[str, Any]
