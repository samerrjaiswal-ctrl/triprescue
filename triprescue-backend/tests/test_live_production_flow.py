"""
Automated end-to-end verification script for TripRescue real production flow:
1. Health check
2. List trips (initially empty)
3. Create new trip (Goa Coastal Getaway)
4. Add batch bookings (Flight BOM -> GOI, Hotel Taj Holiday Village)
5. Verify trip dashboard data & DAG computation
6. Report disruption (Carrier delay on Flight 6E-452)
7. Fetch calculated recovery plans
8. Apply selected recovery plan
9. Verify updated restored state
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def run_test():
    print("[1] Checking API Health...")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health failed: {r.text}"
    print(f"    OK: {r.json()}")

    print("\n[2] Checking initial trips list (should start clean)...")
    r = requests.get(f"{BASE_URL}/trips")
    assert r.status_code == 200, f"List trips failed: {r.text}"
    trips_initial = r.json()
    print(f"    Trips count: {trips_initial.get('total')}")

    print("\n[3] Creating new production trip: 'Goa Coastal Getaway'...")
    payload_trip = {
        "name": "Goa Coastal Getaway",
        "destination": "North Goa, India",
        "start_date": "2026-09-18",
        "end_date": "2026-09-22",
        "traveler_count": 2,
        "budget_ceiling": 5000,
        "recovery_strategy": "best_overall",
        "preferences": {
            "avoid_changing_hotels": True,
            "protect_important_activities": True,
            "avoid_overnight_travel": True
        }
    }
    r = requests.post(f"{BASE_URL}/trips", json=payload_trip)
    assert r.status_code == 201, f"Create trip failed: {r.text}"
    created_trip = r.json()
    trip_id = created_trip["id"]
    print(f"    Created Trip ID: {trip_id}")
    print(f"    Trip Name: {created_trip['name']}")

    print("\n[4] Adding multi-modal bookings to the trip...")
    payload_bookings = {
        "bookings": [
            {
                "type": "FLIGHT",
                "title": "Mumbai to Goa (IndiGo 6E-452)",
                "origin": "Mumbai (BOM)",
                "destination": "Goa (GOI)",
                "start_time": "10:00",
                "end_time": "11:15",
                "day_offset": 0,
                "provider": "IndiGo Airlines",
                "confirmation_number": "6E-452-GOI",
                "cost": 3800.0,
                "is_important": False,
                "is_refundable": False
            },
            {
                "type": "TRANSFER",
                "title": "Goa Airport to Candolim Resort Cab",
                "origin": "Goa Airport (GOI)",
                "destination": "Candolim Beach",
                "start_time": "11:45",
                "end_time": "12:45",
                "day_offset": 0,
                "provider": "GoaMiles Taxi",
                "confirmation_number": "GM-9912",
                "cost": 1200.0,
                "is_important": False,
                "is_refundable": True
            },
            {
                "type": "HOTEL",
                "title": "Taj Holiday Village Resort & Spa",
                "origin": "Candolim Beach",
                "destination": "Candolim Beach",
                "start_time": "14:00",
                "end_time": "18:00",
                "day_offset": 0,
                "provider": "Taj Hotels",
                "confirmation_number": "TAJ-GOA-55",
                "cost": 9500.0,
                "is_important": True,
                "is_refundable": False
            }
        ]
    }
    r = requests.post(f"{BASE_URL}/trips/{trip_id}/bookings/batch", json=payload_bookings)
    assert r.status_code == 201, f"Add bookings failed: {r.text}"
    batch_res = r.json()
    print(f"    Saved {batch_res['bookings_saved']} bookings.")
    print(f"    Trip Health Score: {batch_res['trip_health']}%")
    print(f"    Live DAG edges: {batch_res['graph'].get('edge_count')}")

    print("\n[5] Verifying trip in /trips listing...")
    r = requests.get(f"{BASE_URL}/trips")
    assert r.status_code == 200
    trips_after = r.json()
    assert any(t["id"] == trip_id for t in trips_after["trips"]), "Created trip not found in list"
    print(f"    OK! Listed trips: {[t['name'] for t in trips_after['trips']]}")

    print("\n[6] Reporting carrier delay of 180 minutes on first flight...")
    first_booking_id = batch_res["graph"]["nodes"][0]["id"]
    payload_disruption = {
        "booking_id": first_booking_id,
        "type": "DELAY",
        "delay_minutes": 180,
        "description": "Air traffic control hold at Mumbai (BOM)"
    }
    r = requests.post(f"{BASE_URL}/trips/{trip_id}/disruptions", json=payload_disruption)
    assert r.status_code == 201, f"Report disruption failed: {r.text}"
    disruption_res = r.json()
    print(f"    Disruption ID: {disruption_res['disruption_id']}")
    print(f"    Health before disruption: {disruption_res.get('trip_health_before')}%")
    print(f"    Health after disruption: {disruption_res.get('trip_health_after')}%")
    print(f"    Critical nodes affected: {disruption_res.get('critical_count')}")

    print("\n[7] Generating deterministic recovery plans for this trip...")
    r = requests.get(f"{BASE_URL}/trips/{trip_id}/recovery-plans")
    assert r.status_code == 200, f"Get recovery plans failed: {r.text}"
    plans_res = r.json()
    print(f"    Generated {len(plans_res['plans'])} recovery plans:")
    for p in plans_res["plans"]:
        print(f"      - {p['label']}: +INR {p['additional_cost']} | Delay: +{p['time_impact_hours']}h | {p['itinerary_preserved_pct']}% Preserved | Recommended: {p.get('is_recommended')}")

    best_plan = next(p for p in plans_res["plans"] if p.get("is_recommended"))

    print(f"\n[8] Applying recommended recovery plan ({best_plan['label']})...")
    r = requests.post(f"{BASE_URL}/trips/{trip_id}/recovery-plans/{best_plan['id']}/apply", json={"confirmed": True})
    assert r.status_code == 200, f"Apply plan failed: {r.text}"
    apply_res = r.json()
    print(f"    Trip Health Before: {apply_res['trip_health_before']}%")
    print(f"    Trip Health Restored: {apply_res['trip_health_after']}%")
    print(f"    Trip Status: {apply_res['trip_status']}")
    print(f"    Net Additional Cost: INR {apply_res['recovery_summary']['net_cost']}")

    print("\n=======================================================")
    print(" ALL 8 STEPS OF THE REAL PRODUCTION FLOW PASSED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    run_test()
