"""
TripRescue — Comprehensive API Test Suite
Executes and validates every single endpoint in the backend.
"""

import sys
import json
from fastapi.testclient import TestClient
from app.main import app
import app.store as store

client = TestClient(app)

results = []

def record(endpoint: str, method: str, status_code: int, expected: int, details: str, passed: bool):
    results.append({
        "endpoint": endpoint,
        "method": method,
        "status_code": status_code,
        "expected": expected,
        "passed": passed,
        "details": details
    })
    status = "PASS" if passed else "FAIL"
    clean_details = str(details).encode('ascii', errors='replace').decode('ascii')
    print(f"[{status}] [{method}] {endpoint} -> Status: {status_code} (Expected {expected}) | {clean_details}")

def run_tests():
    print("\n" + "="*60)
    print("RUNNING COMPLETE TRIPRESCUE API SUITE")
    print("="*60 + "\n")

    # 1. Health Check
    res = client.get("/api/health")
    passed = res.status_code == 200 and res.json().get("status") == "healthy"
    record("/api/health", "GET", res.status_code, 200, f"body: {res.json()}", passed)

    # 2. Create Trip (Valid)
    trip_payload = {
        "name": "Goa Beach Gateway",
        "destination": "Goa, India",
        "start_date": "2026-10-15",
        "end_date": "2026-10-20",
        "traveler_count": 2,
        "budget_ceiling": 15000.0,
        "recovery_strategy": "best_overall",
        "preferences": {"avoid_changing_hotels": True}
    }
    res = client.post("/api/trips", json=trip_payload)
    created_trip = res.json() if res.status_code == 201 else {}
    trip_id = created_trip.get("id")
    passed = res.status_code == 201 and trip_id is not None
    record("/api/trips", "POST", res.status_code, 201, f"trip_id: {trip_id}", passed)

    # 3. Create Trip (Invalid)
    res = client.post("/api/trips", json={"name": ""})
    passed = res.status_code == 422
    record("/api/trips (invalid)", "POST", res.status_code, 422, "Validation rejected missing fields", passed)

    # 4. List Trips
    res = client.get("/api/trips")
    passed = res.status_code == 200 and isinstance(res.json().get("trips"), list) and res.json().get("total", 0) >= 1
    record("/api/trips", "GET", res.status_code, 200, f"total trips: {res.json().get('total')}", passed)

    # 5. Filter Trips by Search
    res = client.get("/api/trips?search=Goa")
    passed = res.status_code == 200 and len(res.json().get("trips", [])) >= 1
    record("/api/trips?search=Goa", "GET", res.status_code, 200, f"found: {len(res.json().get('trips', []))}", passed)

    # 6. Filter Trips by Status
    res = client.get("/api/trips?status=DRAFT")
    passed = res.status_code == 200 and len(res.json().get("trips", [])) >= 1
    record("/api/trips?status=DRAFT", "GET", res.status_code, 200, f"found: {len(res.json().get('trips', []))}", passed)

    # 7. Get Single Trip
    res = client.get(f"/api/trips/{trip_id}")
    passed = res.status_code == 200 and res.json().get("id") == trip_id
    record(f"/api/trips/{trip_id}", "GET", res.status_code, 200, f"name: {res.json().get('name')}", passed)

    # 8. Trip Health (Empty bookings)
    res = client.get(f"/api/trips/{trip_id}/health")
    passed = res.status_code == 200 and res.json().get("trip_health_score") == 100
    record(f"/api/trips/{trip_id}/health (empty)", "GET", res.status_code, 200, f"score: {res.json().get('trip_health_score')}", passed)

    # 9. Add Single Booking
    single_booking = {
        "type": "FLIGHT",
        "title": "Mumbai to Goa (6E-456)",
        "origin": "BOM",
        "destination": "GOI",
        "start_time": "09:00",
        "end_time": "10:15",
        "day_offset": 0,
        "provider": "IndiGo",
        "confirmation_number": "6E-BOM-GOI",
        "cost": 4500.0,
        "is_important": True,
        "is_refundable": False,
        "notes": "Direct flight"
    }
    res = client.post(f"/api/trips/{trip_id}/bookings", json=single_booking)
    bk_res = res.json() if res.status_code == 201 else {}
    single_bk_id = bk_res.get("id")
    passed = res.status_code == 201 and single_bk_id is not None
    record(f"/api/trips/{trip_id}/bookings", "POST", res.status_code, 201, f"booking_id: {single_bk_id}", passed)

    # 10. Batch Add Bookings (Full 6-Node Itinerary)
    batch_bookings = [
        {
            "type": "FLIGHT",
            "title": "Pune to New Delhi Flight",
            "origin": "PNQ",
            "destination": "DEL",
            "start_time": "10:00",
            "end_time": "12:00",
            "day_offset": 0,
            "provider": "IndiGo",
            "cost": 8400.0,
            "is_important": True,
            "is_refundable": False
        },
        {
            "type": "TRANSFER",
            "title": "Airport Taxi to Hotel",
            "origin": "DEL Airport",
            "destination": "The Imperial",
            "start_time": "12:30",
            "end_time": "13:30",
            "day_offset": 0,
            "provider": "Uber",
            "cost": 1100.0,
            "is_important": False,
            "is_refundable": False
        },
        {
            "type": "HOTEL",
            "title": "The Imperial Day Use",
            "origin": "New Delhi",
            "destination": "New Delhi",
            "start_time": "14:00",
            "end_time": "16:00",
            "day_offset": 0,
            "provider": "The Imperial",
            "cost": 6500.0,
            "is_important": False,
            "is_refundable": False
        },
        {
            "type": "TRAIN",
            "title": "Delhi to Chandigarh Shatabdi",
            "origin": "NDLS",
            "destination": "CDG",
            "start_time": "17:00",
            "end_time": "20:30",
            "day_offset": 0,
            "provider": "IRCTC",
            "cost": 2400.0,
            "is_important": True,
            "is_refundable": False
        },
        {
            "type": "BUS",
            "title": "Chandigarh to Manali Volvo",
            "origin": "Chandigarh Sec 43",
            "destination": "Manali Mall Road",
            "start_time": "23:00",
            "end_time": "07:00",
            "day_offset": 0,
            "provider": "HRTC",
            "cost": 2800.0,
            "is_important": True,
            "is_refundable": False
        },
        {
            "type": "ACTIVITY",
            "title": "Solang Valley Paragliding",
            "origin": "Solang",
            "destination": "Solang",
            "start_time": "10:00",
            "end_time": "16:00",
            "day_offset": 1,
            "provider": "Himalayan Adventures",
            "cost": 3500.0,
            "is_important": True,
            "is_refundable": False
        }
    ]
    res = client.post(f"/api/trips/{trip_id}/bookings/batch", json={"bookings": batch_bookings})
    passed = res.status_code == 201 and res.json().get("bookings_saved") == 6
    record(f"/api/trips/{trip_id}/bookings/batch", "POST", res.status_code, 201, f"saved: {res.json().get('bookings_saved')} bookings, edges: {res.json().get('graph', {}).get('edge_count')}", passed)

    # 11. Batch Add Bookings (Empty list -> expect 400)
    res = client.post(f"/api/trips/{trip_id}/bookings/batch", json={"bookings": []})
    passed = res.status_code == 400
    record(f"/api/trips/{trip_id}/bookings/batch (empty)", "POST", res.status_code, 400, "Rejected empty batch correctly", passed)

    # 12. List Bookings
    res = client.get(f"/api/trips/{trip_id}/bookings")
    all_bks = res.json().get("bookings", [])
    first_bk_id = all_bks[0]["id"] if all_bks else "bk_1"
    passed = res.status_code == 200 and len(all_bks) == 6
    record(f"/api/trips/{trip_id}/bookings", "GET", res.status_code, 200, f"fetched: {len(all_bks)} bookings", passed)

    # 13. Update Booking (Patch)
    res = client.patch(f"/api/bookings/{first_bk_id}", json={"cost": 9000.0, "provider": "Air India"})
    passed = res.status_code == 200 and res.json().get("cost") == 9000.0 and res.json().get("provider") == "Air India"
    record(f"/api/bookings/{first_bk_id}", "PATCH", res.status_code, 200, f"updated provider: {res.json().get('provider')}", passed)

    # 14. Update Invalid Booking (expect 404)
    res = client.patch("/api/bookings/non_existent_bk_id", json={"cost": 100})
    passed = res.status_code == 404
    record("/api/bookings/non_existent", "PATCH", res.status_code, 404, "404 on unknown booking", passed)

    # 15. Trip Health (With Bookings)
    res = client.get(f"/api/trips/{trip_id}/health")
    passed = res.status_code == 200 and res.json().get("trip_health_score") == 100
    record(f"/api/trips/{trip_id}/health (with bookings)", "GET", res.status_code, 200, f"score: {res.json().get('trip_health_score')}, status: {res.json().get('status')}", passed)

    # 16. Report Disruption on Trip without bookings (new trip)
    new_trip_res = client.post("/api/trips", json={
        "name": "Empty Trip", "destination": "Jaipur", "start_date": "2026-11-01", "end_date": "2026-11-05"
    })
    empty_trip_id = new_trip_res.json()["id"]
    res = client.post(f"/api/trips/{empty_trip_id}/disruptions", json={"booking_id": "bk_x", "type": "DELAY", "delay_minutes": 60})
    passed = res.status_code == 400
    record(f"/api/trips/{empty_trip_id}/disruptions (no bookings)", "POST", res.status_code, 400, "400 error caught correctly for no bookings", passed)

    # 17. Report Disruption (300 min delay on first booking)
    res = client.post(f"/api/trips/{trip_id}/disruptions", json={
        "booking_id": first_bk_id,
        "type": "DELAY",
        "delay_minutes": 300,
        "description": "IndiGo flight delayed 5 hours due to ATC congestion"
    })
    dis_data = res.json() if res.status_code == 201 else {}
    disruption_id = dis_data.get("disruption_id")
    passed = res.status_code == 201 and disruption_id is not None
    record(f"/api/trips/{trip_id}/disruptions", "POST", res.status_code, 201, f"disruption_id: {disruption_id}, health: {dis_data.get('trip_health_after')}, critical: {dis_data.get('critical_count')}", passed)

    # 18. Get Impact Analysis
    res = client.get(f"/api/disruptions/{disruption_id}/impact")
    impact_data = res.json() if res.status_code == 200 else {}
    passed = res.status_code == 200 and len(impact_data.get("impact_results", [])) > 0
    record(f"/api/disruptions/{disruption_id}/impact", "GET", res.status_code, 200, f"impact results: {len(impact_data.get('impact_results', []))}, headline: {impact_data.get('headline')}", passed)

    # 19. Get Non-existent Disruption Impact (expect 404)
    res = client.get("/api/disruptions/dis_fake_999/impact")
    passed = res.status_code == 404
    record("/api/disruptions/fake/impact", "GET", res.status_code, 404, "404 on fake disruption ID", passed)

    # 20. Get Recovery Plans
    res = client.get(f"/api/disruptions/{disruption_id}/recovery-plans")
    plans_data = res.json() if res.status_code == 200 else {}
    plans = plans_data.get("plans", [])
    passed = res.status_code == 200 and len(plans) == 3
    record(f"/api/disruptions/{disruption_id}/recovery-plans", "GET", res.status_code, 200, f"generated {len(plans)} plans: {[p['label'] for p in plans]}", passed)

    # 21. Compare Recovery Plans
    res = client.get("/api/recovery-plans/plan_best/compare")
    comp_data = res.json() if res.status_code == 200 else {}
    passed = res.status_code == 200 and len(comp_data.get("plans", [])) == 3
    record("/api/recovery-plans/plan_best/compare", "GET", res.status_code, 200, f"comparison returned {len(comp_data.get('plans', []))} plans", passed)

    # 22. Apply Recovery Plan (plan_best)
    res = client.post("/api/recovery-plans/plan_best/apply", json={"confirmed": True})
    apply_data = res.json() if res.status_code == 200 else {}
    passed = res.status_code == 200 and apply_data.get("applied") is True and apply_data.get("trip_status") == "STABLE"
    record("/api/recovery-plans/plan_best/apply", "POST", res.status_code, 200, f"applied: {apply_data.get('applied')}, new health: {apply_data.get('trip_health_after')}", passed)

    # 23. Apply Non-Existent Recovery Plan (expect 404)
    res = client.post("/api/recovery-plans/plan_ghost/apply", json={"confirmed": True})
    passed = res.status_code == 404
    record("/api/recovery-plans/plan_ghost/apply", "POST", res.status_code, 404, "404 on fake plan id", passed)

    # 24. User Preferences GET
    res = client.get("/api/users/user_123/preferences")
    passed = res.status_code == 200 and res.json().get("user_id") == "user_123"
    record("/api/users/user_123/preferences", "GET", res.status_code, 200, f"strategy: {res.json().get('recovery_strategy')}", passed)

    # 25. User Preferences PATCH
    res = client.patch("/api/users/user_123/preferences", json={"recovery_strategy": "cheapest", "budget_ceiling": 8000.0})
    passed = res.status_code == 200 and res.json().get("updated") is True and res.json().get("preferences", {}).get("recovery_strategy") == "cheapest"
    record("/api/users/user_123/preferences", "PATCH", res.status_code, 200, f"updated: {res.json().get('preferences')}", passed)

    # 26. AI Extraction endpoint (Invalid MIME type -> expect 400)
    res = client.post(
        f"/api/trips/{trip_id}/bookings/extract",
        files={"file": ("test.exe", b"fake binary content", "application/x-msdownload")}
    )
    passed = res.status_code == 400
    record(f"/api/trips/{trip_id}/bookings/extract (invalid mime)", "POST", res.status_code, 400, "Rejected invalid mime type", passed)

    # 27. AI Extraction endpoint (Valid file - sample text PDF)
    import fitz # PyMuPDF
    pdf_doc = fitz.open()
    page = pdf_doc.new_page()
    page.insert_text((50, 72), "IndiGo Flight Confirmation\nFlight: 6E-205 Pune to Delhi\nDeparture: 11:30\nArrival: 13:45\nPNR: WXYZ89\nFare: INR 5200")
    pdf_bytes = pdf_doc.write()
    pdf_doc.close()

    res = client.post(
        f"/api/trips/{trip_id}/bookings/extract",
        files={"file": ("flight_ticket.pdf", pdf_bytes, "application/pdf")}
    )
    extract_data = res.json() if res.status_code == 200 else {}
    passed = res.status_code == 200 and extract_data.get("extracted") is True and extract_data.get("booking") is not None
    record(f"/api/trips/{trip_id}/bookings/extract (PDF extraction)", "POST", res.status_code, 200, f"extracted: {extract_data.get('extracted')}, confidence: {extract_data.get('confidence')}, booking: {extract_data.get('booking')}", passed)

    print("\n" + "="*60)
    passed_cnt = sum(1 for r in results if r["passed"])
    failed_cnt = sum(1 for r in results if not r["passed"])
    print(f"SUMMARY: {passed_cnt}/{len(results)} PASSED ({failed_cnt} FAILED)")
    print("="*60 + "\n")

    return results

if __name__ == "__main__":
    run_tests()
