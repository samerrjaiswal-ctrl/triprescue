"""
TripRescue — Dependency Graph Engine Test Suite
Validates the DAG topological traversal, slack propagation, and health score calculations.
"""

from app.engine.graph import build_manali_demo_graph, DependencyGraph
from app.engine.models import NodeSeverity, BookingType


def test_scenario_healthy():
    """Initial state should have 100% health score and 0 critical nodes."""
    graph = build_manali_demo_graph()
    health = graph.compute_trip_health()
    print(f"[TEST 1] Healthy Trip Health: {health}/100")
    assert health == 100
    print("  -> Passed: Initial itinerary is 100% healthy.")


def test_scenario_minor_delay():
    """A 20-minute delay on train (bk_4) is absorbed by the 90-minute slack before Volvo bus (SAFE)."""
    graph = build_manali_demo_graph()
    summary = graph.propagate_disruption(disrupted_booking_id="bk_4", delay_minutes=20)
    print(f"[TEST 2] Minor Delay (20m on Train): Health = {summary.trip_health_after}/100, Critical = {summary.critical_count}")
    # Train to Bus gap is 150m, buffer is 60m -> leaves +70m slack after 20m delay (fully absorbed)
    assert summary.critical_count == 0
    print("  -> Passed: 20-minute delay successfully absorbed by buffer.")


def test_scenario_major_disruption():
    """A 300-minute (5 hour) delay causes a 3-critical domino cascade."""
    graph = build_manali_demo_graph()
    summary = graph.propagate_disruption(disrupted_booking_id="bk_1", delay_minutes=300)
    print(f"[TEST 3] Major Disruption (300m): Health = {summary.trip_health_after}/100")
    print(f"  Critical Nodes ({summary.critical_count}): {[r.booking_label for r in summary.impact_results if r.severity == NodeSeverity.CRITICAL]}")
    print(f"  At-Risk Nodes ({summary.at_risk_count}): {[r.booking_label for r in summary.impact_results if r.severity == NodeSeverity.AT_RISK]}")
    print(f"  Total Financial Risk: Rs. {summary.total_financial_risk}")
    
    assert summary.trip_health_after == 23
    assert summary.critical_count == 3
    assert summary.at_risk_count == 2
    print("  -> Passed: Exact match with docs/AI_PIPELINE.md (Health: 23, Critical: 3, At Risk: 2).")


if __name__ == "__main__":
    print("=== Running TripRescue Graph Engine Test Suite ===")
    test_scenario_healthy()
    test_scenario_minor_delay()
    test_scenario_major_disruption()
    print("=== All 3 Scenarios Passed Deterministically! ===")
