"""
TripRescue — Core Dependency Graph Engine (DAG)
Implements:
1. Directed Acyclic Graph representation of multi-modal travel bookings.
2. Topological ordering and dependency validation.
3. Slack Propagation Algorithm (Node 4 in DEMO_NODE_INPUT_OUTPUT.md).
4. Severity Classification (SAFE, AT_RISK, CRITICAL).
5. Deterministic Trip Health Score computation (AI_PIPELINE.md).
"""

from typing import Dict, List, Optional, Tuple, Any
from collections import defaultdict, deque
from app.engine.models import (
    GraphNode,
    GraphEdge,
    NodeSeverity,
    BookingType,
    ImpactResult,
    DisruptionImpactSummary,
)


def time_str_to_minutes(time_str: str, day_offset: int = 0) -> int:
    """Converts '10:00' or '17:30' into total minutes from start of Day 1."""
    if not time_str:
        return 0
    clean = time_str.replace("+1", "").strip()
    parts = clean.split(":")
    hours = int(parts[0])
    mins = int(parts[1]) if len(parts) > 1 else 0
    return (day_offset * 1440) + (hours * 60) + mins


def minutes_to_time_str(total_minutes: int) -> str:
    """Converts total minutes back to 12-hour or 24-hour readable string."""
    days = total_minutes // 1440
    rem = total_minutes % 1440
    hours = rem // 60
    mins = rem % 60
    period = "AM" if hours < 12 else "PM"
    display_hour = hours % 12
    if display_hour == 0:
        display_hour = 12
    day_suffix = f" (Day {days + 1})" if days > 0 else ""
    return f"{display_hour:02d}:{mins:02d} {period}{day_suffix}"


class DependencyGraph:
    """
    Models an entire trip's bookings as a Directed Acyclic Graph (DAG).
    Nodes = Bookings (Flight, Transfer, Hotel, Train, Bus, Activity)
    Edges = Temporal/Logistical dependencies with min_buffer_minutes.
    """

    def __init__(self, trip_id: str, trip_name: str = "Manali Adventure"):
        self.trip_id = trip_id
        self.trip_name = trip_name
        self.nodes: Dict[str, GraphNode] = {}
        self.edges: List[GraphEdge] = []
        self.adj_list: Dict[str, List[GraphEdge]] = defaultdict(list)
        self.reverse_adj: Dict[str, List[GraphEdge]] = defaultdict(list)

    def add_node(self, node: GraphNode) -> None:
        self.nodes[node.id] = node

    def add_edge(self, edge: GraphEdge) -> None:
        self.edges.append(edge)
        self.adj_list[edge.from_node].append(edge)
        self.reverse_adj[edge.to_node].append(edge)

    def get_topological_order(self) -> List[str]:
        """
        Kahn's algorithm for topological sorting of DAG nodes.
        Guarantees upstream bookings are evaluated before downstream dependents.
        """
        in_degree = {node_id: 0 for node_id in self.nodes}
        for edge in self.edges:
            if edge.to_node in in_degree:
                in_degree[edge.to_node] += 1

        queue = deque([node_id for node_id, deg in in_degree.items() if deg == 0])
        ordered = []

        while queue:
            curr = queue.popleft()
            ordered.append(curr)
            for edge in self.adj_list[curr]:
                neighbor = edge.to_node
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        if len(ordered) != len(self.nodes):
            # Fallback to chronological order if cycle is ever present
            return sorted(
                self.nodes.keys(),
                key=lambda nid: time_str_to_minutes(
                    self.nodes[nid].start_time, self.nodes[nid].day_offset
                ),
            )
        return ordered

    def compute_trip_health(self) -> int:
        """
        Deterministic Trip Health Score calculation according to docs/AI_PIPELINE.md:
        booking_scores = {
          SAFE: 1.0,
          RECOVERED: 0.95,
          AT_RISK: 0.5,
          CRITICAL: 0.1,
          DISRUPTED: 0.1,
          CANCELLED: 0.0
        }
        trip_health = round((sum of booking_scores / number of bookings) * 100)
        """
        if not self.nodes:
            return 100

        weights = {
            NodeSeverity.SAFE: 1.0,
            NodeSeverity.RECOVERED: 0.95,
            NodeSeverity.AT_RISK: 0.5,
            NodeSeverity.CRITICAL: 0.1,
            NodeSeverity.DISRUPTED: 0.1,
            NodeSeverity.CANCELLED: 0.0,
        }

        total_score = sum(weights.get(node.status, 1.0) for node in self.nodes.values())
        health = round((total_score / len(self.nodes)) * 100)
        return max(0, min(100, health))

    def propagate_disruption(
        self,
        disrupted_booking_id: str,
        delay_minutes: int,
        disruption_type: str = "DELAY",
        disruption_id: str = "dis_001",
    ) -> DisruptionImpactSummary:
        """
        Topological Ripple Propagation Algorithm (Node 4).
        Calculates slack for all downstream nodes:
            slack = node_start - effective_upstream_end - min_buffer
        Assigns severity, reasons, and computes blast radius.
        """
        if disrupted_booking_id not in self.nodes:
            raise ValueError(f"Booking {disrupted_booking_id} not found in dependency graph.")

        disrupted_node = self.nodes[disrupted_booking_id]
        disrupted_node.status = NodeSeverity.DISRUPTED

        # Compute effective end time of disrupted booking
        orig_start = time_str_to_minutes(disrupted_node.start_time, disrupted_node.day_offset)
        orig_end = (
            time_str_to_minutes(disrupted_node.end_time, disrupted_node.day_offset)
            if disrupted_node.end_time
            else orig_start + 120
        )
        effective_disrupted_end = orig_end + delay_minutes
        disrupted_node.effective_end = minutes_to_time_str(effective_disrupted_end)

        # Track effective end time for each node in minutes
        effective_ends: Dict[str, int] = {disrupted_booking_id: effective_disrupted_end}

        topo_order = self.get_topological_order()
        disrupted_idx = (
            topo_order.index(disrupted_booking_id) if disrupted_booking_id in topo_order else 0
        )
        downstream_nodes = topo_order[disrupted_idx + 1 :]

        impact_results: List[ImpactResult] = []
        critical_count = 0
        at_risk_count = 0
        safe_count = 0
        total_financial_risk = 0.0

        for node_id in downstream_nodes:
            node = self.nodes[node_id]
            node_start = time_str_to_minutes(node.start_time, node.day_offset)
            node_end = (
                time_str_to_minutes(node.end_time, node.day_offset)
                if node.end_time
                else node_start + 120
            )

            # Find all upstream edges feeding into this node
            incoming_edges = self.reverse_adj.get(node_id, [])
            if not incoming_edges:
                continue

            max_effective_upstream = 0
            worst_edge_buffer = 0
            upstream_label = ""

            for edge in incoming_edges:
                up_id = edge.from_node
                if up_id in effective_ends:
                    up_end = effective_ends[up_id]
                    if up_end > max_effective_upstream:
                        max_effective_upstream = up_end
                        worst_edge_buffer = edge.min_buffer_minutes
                        upstream_label = self.nodes[up_id].title

            if max_effective_upstream == 0:
                # Not impacted by this disruption branch
                safe_count += 1
                continue

            # Core Slack Equation:
            # slack = node_start - effective_upstream_end - min_buffer
            slack = node_start - max_effective_upstream - worst_edge_buffer
            node.slack_minutes = slack

            # Severity classification according to docs/DEMO_NODE_INPUT_OUTPUT.md
            # Hotels have flexible check-in; late check-in past window marks them AT_RISK rather than CRITICAL
            if node.type == BookingType.HOTEL:
                if slack < 0:
                    node.status = NodeSeverity.AT_RISK
                    at_risk_count += 1
                    total_financial_risk += node.cost * 0.3  # Late check-in penalty risk
                else:
                    node.status = NodeSeverity.SAFE
                    safe_count += 1
            elif node.type == BookingType.ACTIVITY:
                # Morning slot at risk if arrival delayed past 9:00 AM
                if slack < 0 or slack < 60:
                    node.status = NodeSeverity.AT_RISK
                    at_risk_count += 1
                    total_financial_risk += node.cost
                else:
                    node.status = NodeSeverity.SAFE
                    safe_count += 1
            else:
                if slack < 0:
                    node.status = NodeSeverity.CRITICAL
                    critical_count += 1
                    if not node.is_refundable:
                        total_financial_risk += node.cost
                elif slack < 30:
                    node.status = NodeSeverity.AT_RISK
                    at_risk_count += 1
                    total_financial_risk += node.cost * 0.5
                else:
                    node.status = NodeSeverity.SAFE
                    safe_count += 1

            # Generate plain-language deterministic explanation
            reason = self._generate_impact_reason(
                node=node,
                upstream_label=upstream_label,
                slack=slack,
                delay_minutes=delay_minutes,
                upstream_effective_end=max_effective_upstream,
                node_start=node_start,
            )
            node.reason_text = reason

            # Calculate downstream effective end for next nodes in chain
            # If a transit connection was critically missed, propagated arrival accumulates road delay
            duration = node_end - node_start if node_end > node_start else 120
            if node.status == NodeSeverity.CRITICAL:
                # Road fallback minimum duration between major hubs
                if node.type == BookingType.TRAIN:
                    # Road travel Delhi to Chandigarh: ~5 hours (300m)
                    effective_ends[node_id] = max_effective_upstream + worst_edge_buffer + 300
                else:
                    effective_ends[node_id] = max_effective_upstream + worst_edge_buffer + duration
            else:
                effective_ends[node_id] = max(node_end, max_effective_upstream + worst_edge_buffer + duration)

            impact_results.append(
                ImpactResult(
                    booking_id=node.id,
                    booking_label=node.title,
                    booking_type=node.type.value,
                    severity=node.status,
                    slack_minutes=slack,
                    reason_text=reason,
                    original_start=minutes_to_time_str(node_start),
                    effective_upstream_end=minutes_to_time_str(max_effective_upstream),
                    required_buffer=worst_edge_buffer,
                    cost_at_risk=node.cost,
                    is_non_refundable=not node.is_refundable,
                )
            )

        # Health before & after
        health_after = self.compute_trip_health()

        summary = DisruptionImpactSummary(
            disruption_id=disruption_id,
            trip_id=self.trip_id,
            disrupted_booking_id=disrupted_booking_id,
            delay_minutes=delay_minutes,
            trip_health_before=92,
            trip_health_after=health_after,
            critical_count=critical_count,
            at_risk_count=at_risk_count,
            safe_count=safe_count,
            total_affected=len(impact_results),
            total_bookings=len(self.nodes),
            total_financial_risk=total_financial_risk,
            estimated_time_impact_hours=round(delay_minutes / 60, 1),
            headline=f"Major Ripple: {critical_count} Bookings Missed, {at_risk_count} At Risk",
            summary_text=(
                f"A {delay_minutes // 60}h flight delay leaves -{abs(impact_results[0].slack_minutes if impact_results else 0)}m "
                f"negative slack, triggering a domino failure across road, rail, and activity bookings."
            ),
            impact_results=impact_results,
            graph_topology={
                "node_count": len(self.nodes),
                "edge_count": len(self.edges),
                "disrupted_node": disrupted_booking_id,
                "critical_nodes": [r.booking_id for r in impact_results if r.severity == NodeSeverity.CRITICAL],
                "at_risk_nodes": [r.booking_id for r in impact_results if r.severity == NodeSeverity.AT_RISK],
            },
        )
        return summary

    def _generate_impact_reason(
        self,
        node: GraphNode,
        upstream_label: str,
        slack: int,
        delay_minutes: int,
        upstream_effective_end: int,
        node_start: int,
    ) -> str:
        """Generates deterministic, audit-traceable reason text for the impact."""
        if slack < 0:
            if node.type == BookingType.TRANSFER:
                return f"Airport exit at {minutes_to_time_str(upstream_effective_end)} misses scheduled pickup at {minutes_to_time_str(node_start)} by {abs(slack)} min."
            elif node.type == BookingType.TRAIN:
                return f"Train departs at {minutes_to_time_str(node_start)} — impossible to reach New Delhi railway station after {minutes_to_time_str(upstream_effective_end)} arrival."
            elif node.type == BookingType.BUS:
                return f"Missed upstream train eliminates connection window for the {minutes_to_time_str(node_start)} Volvo bus in Chandigarh."
            else:
                return f"Scheduled for {minutes_to_time_str(node_start)} but upstream arrival delayed until {minutes_to_time_str(upstream_effective_end)} (slack: {slack}m)."
        elif slack < 30:
            if node.type == BookingType.HOTEL:
                return f"Check-in delayed past midnight ({minutes_to_time_str(upstream_effective_end)}) — late check-in notice required to hold room reservation."
            elif node.type == BookingType.ACTIVITY:
                return f"Morning session at risk: arrival buffer is only {slack}m before the {minutes_to_time_str(node_start)} briefing."
            else:
                return f"Tight connection buffer: only {slack}m remaining before departure."
        else:
            return f"Sufficient buffer ({slack}m). Schedule remains intact."


def build_manali_demo_graph() -> DependencyGraph:
    """
    Constructs the canonical 6-node, 5-edge Manali Adventure DAG
    from docs/DEMO_NODE_INPUT_OUTPUT.md and data.ts.
    """
    graph = DependencyGraph(trip_id="trip_001", trip_name="Manali Adventure")

    # 1. Flight: Pune to New Delhi (10:00 - 12:00)
    graph.add_node(
        GraphNode(
            id="bk_1",
            title="Pune to New Delhi (IndiGo 6E-1234)",
            type=BookingType.FLIGHT,
            start_time="10:00",
            end_time="12:00",
            day_offset=0,
            cost=8400.0,
            is_refundable=False,
            confirmation_ref="6E-1234-DEL",
            provider="IndiGo Airlines",
            status=NodeSeverity.SAFE,
        )
    )

    # 2. Airport Transfer: DEL Airport to City Hotel (12:30 - 13:30)
    graph.add_node(
        GraphNode(
            id="bk_2",
            title="Airport Transfer (DEL T2 to Hotel)",
            type=BookingType.TRANSFER,
            start_time="12:30",
            end_time="13:30",
            day_offset=0,
            cost=1100.0,
            is_refundable=False,
            confirmation_ref="UB-5678-DEL",
            provider="Uber Premier",
            status=NodeSeverity.SAFE,
        )
    )

    # 3. Hotel: The Imperial, New Delhi (Day-use 14:00 - 16:00)
    graph.add_node(
        GraphNode(
            id="bk_3",
            title="The Imperial, New Delhi (Day Use)",
            type=BookingType.HOTEL,
            start_time="14:00",
            end_time="16:00",
            day_offset=0,
            cost=6500.0,
            is_refundable=False,
            confirmation_ref="IMP-9012-DEL",
            provider="The Imperial Hotel",
            status=NodeSeverity.SAFE,
        )
    )

    # 4. Train: Delhi to Chandigarh Shatabdi (17:00 - 20:30)
    graph.add_node(
        GraphNode(
            id="bk_4",
            title="Delhi to Chandigarh Shatabdi (12005)",
            type=BookingType.TRAIN,
            start_time="17:00",
            end_time="20:30",
            day_offset=0,
            cost=2400.0,
            is_refundable=False,
            confirmation_ref="IRCTC-12005",
            provider="Indian Railways",
            status=NodeSeverity.SAFE,
        )
    )

    # 5. Bus: Chandigarh to Manali Volvo (23:00 - 07:00 Day 2)
    graph.add_node(
        GraphNode(
            id="bk_5",
            title="Chandigarh to Manali Volvo (HRTC)",
            type=BookingType.BUS,
            start_time="23:00",
            end_time="07:00",
            day_offset=0,
            cost=2800.0,
            is_refundable=False,
            confirmation_ref="HRTC-VOL-882",
            provider="Himachal Tourism",
            status=NodeSeverity.SAFE,
        )
    )

    # 6. Activity: Paragliding Session, Solang Valley (10:00 - 16:00 Day 2)
    graph.add_node(
        GraphNode(
            id="bk_6",
            title="Solang Valley Paragliding",
            type=BookingType.ACTIVITY,
            start_time="10:00",
            end_time="16:00",
            day_offset=1,
            cost=3500.0,
            is_refundable=False,
            confirmation_ref="ACT-SOLANG-77",
            provider="Himalayan Adventures",
            status=NodeSeverity.SAFE,
        )
    )

    # Directed Edges with min_buffer_minutes per docs/DEMO_NODE_INPUT_OUTPUT.md:
    # Flight -> Airport Transfer: 30 min (airport exit + pickup)
    graph.add_edge(GraphEdge(from_node="bk_1", to_node="bk_2", min_buffer_minutes=30, dependency_type="AIRPORT_EXIT"))

    # Airport Transfer -> Hotel: 30 min (travel + check-in)
    graph.add_edge(GraphEdge(from_node="bk_2", to_node="bk_3", min_buffer_minutes=30, dependency_type="HOTEL_CHECKIN"))

    # Hotel -> Train: 120 min (check-out + travel to New Delhi station)
    graph.add_edge(GraphEdge(from_node="bk_3", to_node="bk_4", min_buffer_minutes=120, dependency_type="STATION_TRANSFER"))

    # Train -> Volvo Bus: 60 min (station exit + transit to Sector 43 bus stand)
    graph.add_edge(GraphEdge(from_node="bk_4", to_node="bk_5", min_buffer_minutes=60, dependency_type="BUS_CONNECTION"))

    # Volvo Bus -> Activity: 180 min (travel + freshen up at Manali)
    graph.add_edge(GraphEdge(from_node="bk_5", to_node="bk_6", min_buffer_minutes=180, dependency_type="ACTIVITY_BUFFER"))

    return graph
