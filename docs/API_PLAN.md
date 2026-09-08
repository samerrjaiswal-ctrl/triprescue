# TripRescue — API Plan

## Base URL
```
MVP:        http://localhost:8000/api
Production: https://api.triprescue.app/api
```

## Authentication
All endpoints (except health check) require JWT Bearer token.
```
Authorization: Bearer <jwt_token>
```

---

## Trip Management

### POST /api/trips
**Purpose:** Create a new trip.
**Connected Frontend:** Create Trip screen (Screen 02)
**Connected Service:** Trip Service

**Input:**
```json
{
  "name": "Manali Adventure",
  "destination": "Manali",
  "start_date": "2026-09-12",
  "end_date": "2026-09-17",
  "traveler_count": 2,
  "budget_ceiling": 5000.00,
  "recovery_strategy": "best_overall",
  "preferences": {
    "avoid_changing_hotels": true,
    "protect_important_activities": true,
    "avoid_overnight_travel": true,
    "minimize_booking_changes": false
  }
}
```

**Validation:**
- name: required, max 255 chars
- destination: required
- start_date < end_date
- traveler_count ≥ 1
- budget_ceiling ≥ 0
- recovery_strategy ∈ {best_overall, cheapest, fastest}

**Output:** `201 Created`
```json
{
  "id": "trip_001",
  "name": "Manali Adventure",
  "status": "DRAFT",
  "trip_health_score": null,
  "created_at": "2026-09-08T18:00:00Z"
}
```

---

### GET /api/trips
**Purpose:** List all trips for the authenticated user.
**Connected Frontend:** My Trips screen (Screen 11)
**Connected Service:** Trip Service

**Input (Query Params):**
- `status` (optional): DRAFT, ACTIVE, DISRUPTED, RECOVERED, STABLE
- `search` (optional): text search on trip name
- `sort` (optional): created_at, start_date, trip_health_score

**Output:** `200 OK`
```json
{
  "trips": [
    {
      "id": "trip_001",
      "name": "Manali Adventure",
      "destination": "Manali",
      "start_date": "2026-09-12",
      "end_date": "2026-09-17",
      "traveler_count": 2,
      "trip_health_score": 92,
      "status": "ACTIVE",
      "booking_count": 6
    }
  ],
  "total": 1
}
```

---

### GET /api/trips/{trip_id}
**Purpose:** Get full trip detail including itinerary, dependencies, and Trip Health.
**Connected Frontend:** Trip Dashboard (Screen 04)
**Connected Service:** Trip Service, Booking Service, Trip Health Engine

**Output:** `200 OK`
```json
{
  "id": "trip_001",
  "name": "Manali Adventure",
  "destination": "Manali",
  "start_date": "2026-09-12",
  "end_date": "2026-09-17",
  "traveler_count": 2,
  "budget_ceiling": 5000.00,
  "recovery_strategy": "best_overall",
  "trip_health_score": 92,
  "status": "ACTIVE",
  "bookings": [...],
  "dependencies": [...],
  "active_disruptions": [],
  "preferences": {...}
}
```

---

## Booking Management

### POST /api/trips/{trip_id}/bookings
**Purpose:** Add a booking manually.
**Connected Frontend:** Add Bookings screen (Screen 03)
**Connected Service:** Booking Service

**Input:**
```json
{
  "type": "FLIGHT",
  "origin": "Pune",
  "destination": "Delhi",
  "start_time": "2026-09-12T10:00:00",
  "end_time": "2026-09-12T12:00:00",
  "provider": "IndiGo",
  "confirmation_number": "6E-1234",
  "cost": 4500.00,
  "is_important": false,
  "notes": ""
}
```

**Validation:**
- type ∈ {FLIGHT, TRAIN, BUS, HOTEL, TRANSFER, ACTIVITY, TOUR, EVENT}
- start_time < end_time (except HOTEL where end_time is check-out)
- trip_id must exist and belong to authenticated user

**Output:** `201 Created` — booking object with auto-assigned sequence_index and inferred dependencies

---

### POST /api/trips/{trip_id}/bookings/extract
**Purpose:** Upload a booking confirmation for AI extraction.
**Connected Frontend:** Add Bookings screen (Screen 03) — Upload area
**Connected Service:** AI Integration Service

**Input:** `multipart/form-data`
- `file`: PDF, JPG, or PNG (max 10MB)

**Validation:**
- File type ∈ {application/pdf, image/jpeg, image/png}
- File size ≤ 10MB
- trip_id must exist and belong to authenticated user

**Output:** `200 OK`
```json
{
  "extracted": true,
  "confidence": 0.92,
  "booking": {
    "type": "FLIGHT",
    "origin": "Pune",
    "destination": "Delhi",
    "start_time": "2026-09-12T10:00:00",
    "end_time": "2026-09-12T12:00:00",
    "provider": "IndiGo",
    "confirmation_number": "6E-1234",
    "source": "AI_EXTRACTED"
  },
  "requires_review": true
}
```

**Note:** Extracted booking is NOT auto-saved. Frontend must present for user review, then POST to `/bookings` to persist.

---

### PATCH /api/bookings/{booking_id}
**Purpose:** Edit a booking (including correcting AI-extracted fields).
**Connected Frontend:** Add Bookings screen (edit mode)
**Connected Service:** Booking Service

**Input:** Partial booking object with only changed fields.
**Output:** `200 OK` — updated booking object

---

## Disruption & Impact

### POST /api/trips/{trip_id}/disruptions
**Purpose:** Report or simulate a disruption.
**Connected Frontend:** Disruption Center (Screen 05)
**Connected Service:** Disruption Service → Dependency Graph Engine → AI Explanation Service

**Input:**
```json
{
  "booking_id": "bk_flight_001",
  "type": "DELAY",
  "delay_minutes": 300,
  "description": "Airline says there may be additional delays"
}
```

**Validation:**
- booking_id must belong to trip
- type ∈ {DELAY, CANCELLATION, WEATHER, PLAN_CHANGE, CUSTOM}
- delay_minutes required for DELAY type, must be > 0

**Output:** `201 Created`
```json
{
  "disruption_id": "dis_001",
  "booking_id": "bk_flight_001",
  "type": "DELAY",
  "delay_minutes": 300,
  "severity": "MAJOR",
  "status": "ACTIVE"
}
```

---

### GET /api/disruptions/{disruption_id}/impact
**Purpose:** Retrieve or trigger impact analysis.
**Connected Frontend:** Impact Analysis screen (Screen 06)
**Connected Service:** Dependency Graph Engine, AI Explanation Service

**Output:** `200 OK`
```json
{
  "disruption_id": "dis_001",
  "impact_results": [
    {
      "booking_id": "bk_transfer_001",
      "booking_label": "Airport Transfer",
      "booking_type": "TRANSFER",
      "severity": "CRITICAL",
      "slack_minutes": -270,
      "reason_text": "Transfer at 12:30 PM missed — flight arrives at 5:00 PM"
    }
  ],
  "summary": {
    "critical_count": 3,
    "at_risk_count": 2,
    "safe_count": 0,
    "total_affected": 5,
    "total_bookings": 6,
    "estimated_cost_range": { "min": 1800, "max": 4500 },
    "estimated_time_impact_hours": { "min": 1, "max": 5 }
  },
  "headline": "Your trip is at risk",
  "summary_text": "A 5-hour flight delay creates multiple downstream impacts."
}
```

---

## Recovery Plans

### GET /api/disruptions/{disruption_id}/recovery-plans
**Purpose:** Generate or retrieve ranked recovery plans.
**Connected Frontend:** Recovery Plans screen (Screen 07)
**Connected Service:** Recovery Engine, AI Rationale Service

**Output:** `200 OK`
```json
{
  "disruption_id": "dis_001",
  "plans": [
    {
      "id": "plan_best",
      "label": "BEST_OVERALL",
      "is_recommended": true,
      "additional_cost": 2100,
      "time_impact_hours": 1.2,
      "itinerary_preserved_pct": 92,
      "bookings_changed_count": 2,
      "convenience_score": 4.5,
      "hotel_preserved": true,
      "activity_preserved": true,
      "rationale_text": "Best Overall preserves your hotel and important activity...",
      "changes": [
        {
          "original_booking": "Delhi → Chandigarh Train (5:00 PM)",
          "new_booking": "Delhi → Chandigarh Train (9:00 PM)",
          "change_type": "REBOOKED"
        }
      ]
    }
  ],
  "recommendation_explanation": "Best Overall is recommended because...",
  "how_we_decide": "Plans are ranked using cost, time impact, itinerary preservation..."
}
```

---

### GET /api/recovery-plans/{plan_id}/compare
**Purpose:** Get structured comparison data for all plans related to a disruption.
**Connected Frontend:** Plan Comparison screen (Screen 08)
**Connected Service:** Recovery Engine

**Output:** `200 OK`
```json
{
  "plans": [
    { "label": "CHEAPEST", "additional_cost": 900, "time_impact_hours": 3.5, "itinerary_preserved_pct": 78, "bookings_changed": 3, "hotel_preserved": false, "activity_preserved": false, "convenience_score": 3.0 },
    { "label": "BEST_OVERALL", "additional_cost": 2100, "time_impact_hours": 1.2, "itinerary_preserved_pct": 92, "bookings_changed": 2, "hotel_preserved": true, "activity_preserved": true, "convenience_score": 4.5, "is_recommended": true },
    { "label": "FASTEST", "additional_cost": 4500, "time_impact_hours": 0, "itinerary_preserved_pct": 100, "bookings_changed": 1, "hotel_preserved": true, "activity_preserved": true, "convenience_score": 5.0 }
  ],
  "recommendation_rationale": "It costs ₹1,200 more than the cheapest but saves ~2.3 hours..."
}
```

---

### POST /api/recovery-plans/{plan_id}/apply
**Purpose:** Apply a recovery plan after user confirmation.
**Connected Frontend:** Recovery Confirmation screen (Screen 09) → Updated Trip (Screen 10)
**Connected Service:** Recovery Engine, Booking Service, Trip Health Engine

**Input:**
```json
{
  "confirmed": true
}
```

**Validation:**
- Plan must exist and be in GENERATED or SELECTED status
- User must be the trip owner
- Idempotent: re-applying an already-applied plan returns the existing result

**Output:** `200 OK`
```json
{
  "applied": true,
  "plan_id": "plan_best",
  "trip_health_before": 23,
  "trip_health_after": 98,
  "trip_status": "STABLE",
  "recovery_summary": {
    "bookings_changed": 2,
    "bookings_preserved": 4,
    "additional_cost": 2100,
    "refunds": 500,
    "new_charges": 2600,
    "net_cost": 2100,
    "additional_time_hours": 1.2
  },
  "updated_itinerary": [...]
}
```

---

## Trip Health

### GET /api/trips/{trip_id}/health
**Purpose:** Recompute and retrieve current Trip Health score.
**Connected Frontend:** Trip Dashboard (Screen 04), Updated Trip (Screen 10)
**Connected Service:** Trip Health Engine

**Output:** `200 OK`
```json
{
  "trip_id": "trip_001",
  "trip_health_score": 98,
  "status": "STABLE",
  "connections": {
    "safe": 5,
    "at_risk": 0,
    "critical": 0
  }
}
```

---

## User Preferences

### GET /api/users/{user_id}/preferences
**Purpose:** Get user preferences.
**Connected Frontend:** Settings screen (Screen 12)
**Connected Service:** User Service

### PATCH /api/users/{user_id}/preferences
**Purpose:** Update user preferences.
**Connected Frontend:** Settings screen (Screen 12)
**Connected Service:** User Service

**Input:** Partial preferences object.
**Output:** `200 OK` — updated preferences.

---

## Health Check

### GET /api/health
**Purpose:** System health check (no auth required).
**Output:** `200 OK` — `{ "status": "healthy", "version": "1.0.0" }`
