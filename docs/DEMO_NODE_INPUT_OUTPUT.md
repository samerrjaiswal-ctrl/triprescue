# TripRescue — Demo Node Input / Output

Each major processing node in the TripRescue pipeline is documented below with exact demo data.

---

## Node 1: Trip Data Loader

### Purpose
Load the complete trip and all associated bookings from the database.

### Input
```
trip_id: "trip_manali_001"
```

### Processing
- Query database for trip record
- Load all bookings ordered by sequence_index
- Load user preferences (recovery strategy, protection toggles)

### Output
```json
{
  "trip_id": "trip_manali_001",
  "name": "Manali Adventure",
  "destination": "Manali",
  "start_date": "2026-09-12",
  "end_date": "2026-09-17",
  "traveler_count": 2,
  "budget_ceiling": 5000,
  "recovery_strategy": "best_overall",
  "trip_health": 92,
  "status": "ACTIVE"
}
```

### Data Passed to Next Node
Full trip object + booking list + user preferences

---

## Node 2: Disruption Detector

### Purpose
Receive and validate a disruption report, compute updated timing for the affected booking.

### Input
```
trip_id: "trip_manali_001"
booking_id: "bk_flight_001"
disruption_type: "DELAY"
delay_minutes: 300
user_message: "Airline says there may be additional delays"
```

### Processing
1. Validate booking exists and belongs to trip
2. Compute new times:
   - Original departure: 10:00 AM → New departure: 3:00 PM
   - Original arrival: 12:00 PM → New arrival: 5:00 PM
3. Determine disruption severity: MAJOR (delay > 120 min)
4. Mark booking status: DISRUPTED
5. Persist disruption record

### Output
```json
{
  "disruption_id": "dis_001",
  "trip_id": "trip_manali_001",
  "booking_id": "bk_flight_001",
  "type": "DELAY",
  "delay_minutes": 300,
  "severity": "MAJOR",
  "original_arrival": "12:00",
  "new_arrival": "17:00",
  "status": "DISRUPTED",
  "reported_at": "2026-09-12T10:30:00"
}
```

### Data Passed to Next Node
`disruption_id`, `trip_id`, `booking_id`, `delay_minutes`, `new_arrival`

---

## Node 3: Dependency Graph Builder

### Purpose
Construct the directed dependency graph for the trip's bookings.

### Input
```
trip_id: "trip_manali_001"
bookings: [Flight, Transfer, Hotel, Train, Transfer, Activity]
```

### Processing
1. Create graph nodes for each booking
2. Create directed edges based on chronological sequence and logical dependency
3. Assign `min_buffer_minutes` per edge based on dependency type:
   - Flight → Transfer: 30 min (airport exit + pickup)
   - Transfer → Hotel: 30 min (travel + check-in)
   - Hotel → Train: 120 min (check-out + travel to station)
   - Train → Transfer: 60 min (station exit + vehicle pickup)
   - Transfer → Activity: 180 min (travel + rest)

### Output
```json
{
  "nodes": [
    { "id": "bk_flight_001", "type": "FLIGHT", "start": "10:00", "end": "12:00", "status": "DISRUPTED" },
    { "id": "bk_transfer_001", "type": "TRANSFER", "start": "12:30", "end": "13:30", "status": "SAFE" },
    { "id": "bk_hotel_001", "type": "HOTEL", "start": "14:00", "end": null, "status": "SAFE" },
    { "id": "bk_train_001", "type": "TRAIN", "start": "17:00", "end": "22:00", "status": "SAFE" },
    { "id": "bk_transfer_002", "type": "TRANSFER", "start": "23:00", "end": "07:00+1", "status": "SAFE" },
    { "id": "bk_activity_001", "type": "ACTIVITY", "start": "10:00+1", "end": "16:00+1", "status": "SAFE" }
  ],
  "edges": [
    { "from": "bk_flight_001", "to": "bk_transfer_001", "min_buffer": 30 },
    { "from": "bk_transfer_001", "to": "bk_hotel_001", "min_buffer": 30 },
    { "from": "bk_hotel_001", "to": "bk_train_001", "min_buffer": 120 },
    { "from": "bk_train_001", "to": "bk_transfer_002", "min_buffer": 60 },
    { "from": "bk_transfer_002", "to": "bk_activity_001", "min_buffer": 180 }
  ]
}
```

### Data Passed to Next Node
Complete graph structure with nodes, edges, and disruption start point

---

## Node 4: Impact Propagation Engine

### Purpose
Traverse the dependency graph from the disrupted node and compute the ripple effect on every downstream booking.

### Input
```
disruption: { booking_id: "bk_flight_001", new_arrival: "17:00", delay: 300 }
graph: { nodes: [...], edges: [...] }
```

### Processing
For each downstream node in topological order:
1. Compute `effective_upstream_end` = max(original_end + delay, propagated_end)
2. Compute `slack = node_start - effective_upstream_end - min_buffer`
3. Classify severity:
   - slack ≥ 30 min → SAFE
   - 0 ≤ slack < 30 min → AT_RISK
   - slack < 0 → CRITICAL

**Computation trace:**

| Step | Node | Upstream Effective End | Node Start | Buffer | Slack | Severity |
|------|------|----------------------|------------|--------|-------|----------|
| 1 | Airport Transfer | 17:00 (flight new arrival) | 12:30 | 30 | -270 min | CRITICAL |
| 2 | Hotel Check-in | 17:30 (propagated) | 14:00 | 30 | -210 min | AT_RISK* |
| 3 | Train | 18:00 (propagated) | 17:00 | 120 | -180 min | CRITICAL |
| 4 | Local Transfer | N/A (train missed) | 23:00 | 60 | N/A | CRITICAL |
| 5 | Activity | N/A (chain broken) | 10:00+1 | 180 | Undetermined | AT_RISK |

*Hotel is AT_RISK rather than CRITICAL because hotel rooms allow late check-in — the booking is still valid, just late.

### Output
```json
{
  "disruption_id": "dis_001",
  "impact_results": [
    {
      "booking_id": "bk_transfer_001",
      "booking_label": "Airport Transfer",
      "severity": "CRITICAL",
      "slack_minutes": -270,
      "reason_code": "MISSED",
      "reason": "Transfer scheduled at 12:30 PM but flight won't arrive until 5:00 PM"
    },
    {
      "booking_id": "bk_hotel_001",
      "booking_label": "Delhi Hotel",
      "severity": "AT_RISK",
      "slack_minutes": -210,
      "reason_code": "LATE_ARRIVAL",
      "reason": "Check-in will be delayed to approximately 7:00 PM"
    },
    {
      "booking_id": "bk_train_001",
      "booking_label": "Delhi → Chandigarh Train",
      "severity": "CRITICAL",
      "slack_minutes": -180,
      "reason_code": "CONNECTION_MISSED",
      "reason": "Train departs at 5:00 PM but flight arrives at 5:00 PM — impossible to reach station"
    },
    {
      "booking_id": "bk_transfer_002",
      "booking_label": "Chandigarh → Manali Transfer",
      "severity": "CRITICAL",
      "slack_minutes": null,
      "reason_code": "UPSTREAM_BROKEN",
      "reason": "Depends on the train connection that will be missed"
    },
    {
      "booking_id": "bk_activity_001",
      "booking_label": "Rohtang Pass Activity",
      "severity": "AT_RISK",
      "slack_minutes": null,
      "reason_code": "CHAIN_DEPENDENT",
      "reason": "Reachability depends on how the trip is recovered"
    }
  ],
  "summary": {
    "critical_count": 3,
    "at_risk_count": 2,
    "safe_count": 0,
    "total_affected": 5,
    "total_bookings": 6,
    "estimated_cost_range": { "min": 1800, "max": 4500 },
    "estimated_time_impact_range": { "min_hours": 1, "max_hours": 5 }
  }
}
```

### Data Passed to Next Node
Complete `impact_results` array + `summary` + original disruption data

---

## Node 5: Impact Explanation Generator (AI)

### Purpose
Convert structured impact results into plain-language explanations for the user.

### Input
```
impact_results: [structured array from Node 4]
trip_context: { name: "Manali Adventure", route: "Pune → Delhi → Chandigarh → Manali" }
```

### Processing
- Send structured data to LLM with explanation prompt template
- LLM generates human-readable text per affected booking
- Validate output format and length

### Output
```json
{
  "headline": "Your trip is at risk",
  "summary_text": "A 5-hour flight delay creates multiple downstream impacts across your Manali Adventure.",
  "explanations": [
    "Your airport transfer at 12:30 PM will be missed because your flight won't land until 5:00 PM.",
    "Your Delhi hotel check-in will be delayed but your room is still available.",
    "Your 5:00 PM train to Chandigarh departs before your delayed flight can reach the station.",
    "The Chandigarh → Manali transfer depends on the train you'll miss.",
    "Your Rohtang Pass activity is at risk depending on how the trip is recovered."
  ]
}
```

### Data Passed to Next Node
All impact data + explanations (sent to frontend for Impact Analysis screen and to Recovery Engine)

---

## Node 6: Recovery Candidate Generator

### Purpose
Find alternative bookings for each CRITICAL or AT_RISK booking.

### Input
```
critical_bookings: [Airport Transfer, Train, Local Transfer]
at_risk_bookings: [Hotel, Activity]
user_preferences: { strategy: "best_overall", avoid_hotel_change: true, protect_activities: true }
budget_ceiling: 5000
```

### Processing
1. Query mock availability adapters for alternatives:
   - Airport Transfer: New taxi at 5:30 PM (₹600)
   - Train alternatives: 7:00 PM (₹1,200), 9:00 PM (₹800)
   - Bus alternative: Delhi → Manali direct overnight (₹1,500)
   - Local Transfer: Various times based on train choice
2. Filter by budget and preferences
3. Assemble complete itinerary combinations

### Output
```json
{
  "candidates": [
    {
      "id": "cand_001",
      "changes": [
        { "original": "Airport Transfer 12:30", "new": "New Taxi 5:30 PM", "cost": 600 },
        { "original": "Train 5:00 PM", "new": "Train 9:00 PM", "cost": 800 },
        { "original": "Transfer 11:00 PM", "new": "Transfer 3:00 AM", "cost": 700 }
      ],
      "total_additional_cost": 2100,
      "hotel_preserved": true,
      "activity_preserved": true
    },
    {
      "id": "cand_002",
      "changes": [
        { "original": "Airport Transfer 12:30", "new": "Metro + Auto 5:15 PM", "cost": 200 },
        { "original": "Train 5:00 PM", "new": "Bus overnight", "cost": 500 },
        { "original": "Transfer 11:00 PM", "new": "Not needed (bus direct)", "cost": 0 },
        { "original": "Hotel Delhi", "new": "Cancelled (overnight bus)", "refund": -200 }
      ],
      "total_additional_cost": 900,
      "hotel_preserved": false,
      "activity_preserved": false
    },
    {
      "id": "cand_003",
      "changes": [
        { "original": "Flight delayed", "new": "Alternative flight 12:00 PM", "cost": 4500 }
      ],
      "total_additional_cost": 4500,
      "hotel_preserved": true,
      "activity_preserved": true
    }
  ]
}
```

### Data Passed to Next Node
All candidate plans for validation and scoring

---

## Node 7: Constraint Validator

### Purpose
Verify each candidate plan satisfies all hard constraints.

### Input
```
candidates: [3 candidate plans]
constraints: {
  budget_ceiling: 5000,
  temporal_feasibility: true,
  user_preferences: { avoid_hotel_change: true, protect_activities: true, avoid_overnight: true }
}
```

### Processing
1. Budget check: All 3 candidates within ₹5,000 ceiling ✓
2. Temporal feasibility: Verify no negative slack in recovered itinerary
   - Candidate 1: All connections feasible ✓
   - Candidate 2: All connections feasible ✓
   - Candidate 3: Original timing restored ✓
3. Preference alignment scoring (soft constraints — don't filter, but affect score)

### Output
```json
{
  "validated_plans": [
    { "id": "cand_001", "feasible": true, "preference_violations": [] },
    { "id": "cand_002", "feasible": true, "preference_violations": ["hotel_changed", "overnight_travel"] },
    { "id": "cand_003", "feasible": true, "preference_violations": [] }
  ]
}
```

### Data Passed to Next Node
Validated plans with preference alignment data

---

## Node 8: Scoring & Ranking Engine

### Purpose
Score each validated plan on multiple dimensions and select the top 3 labeled plans.

### Input
```
validated_plans: [3 plans with costs, times, changes, preference data]
user_strategy: "best_overall"
```

### Processing
Normalize scores (0-1 range):

| Dimension | Candidate 1 | Candidate 2 | Candidate 3 | Weight |
|-----------|-------------|-------------|-------------|--------|
| Cost (lower=better) | 0.58 | 0.85 | 0.00 | 0.30 |
| Time (lower=better) | 0.76 | 0.30 | 1.00 | 0.25 |
| Preservation | 0.92 | 0.78 | 1.00 | 0.25 |
| Convenience | 0.85 | 0.55 | 1.00 | 0.20 |
| **Weighted Total** | **0.78** | **0.62** | **0.75** | |

Label assignment:
- Best Overall: Candidate 1 (highest weighted score) → ₹2,100
- Cheapest: Candidate 2 (lowest cost) → ₹900
- Fastest: Candidate 3 (lowest time impact) → ₹4,500

### Output
```json
{
  "ranked_plans": [
    {
      "id": "plan_best",
      "label": "BEST_OVERALL",
      "is_recommended": true,
      "additional_cost": 2100,
      "time_impact_hours": 1.2,
      "itinerary_preserved_pct": 92,
      "bookings_changed": 2,
      "convenience_score": 4.5,
      "hotel_preserved": true,
      "activity_preserved": true
    },
    {
      "id": "plan_cheap",
      "label": "CHEAPEST",
      "is_recommended": false,
      "additional_cost": 900,
      "time_impact_hours": 3.5,
      "itinerary_preserved_pct": 78,
      "bookings_changed": 3,
      "convenience_score": 3.0,
      "hotel_preserved": false,
      "activity_preserved": false
    },
    {
      "id": "plan_fast",
      "label": "FASTEST",
      "is_recommended": false,
      "additional_cost": 4500,
      "time_impact_hours": 0,
      "itinerary_preserved_pct": 100,
      "bookings_changed": 1,
      "convenience_score": 5.0,
      "hotel_preserved": true,
      "activity_preserved": true
    }
  ]
}
```

*All values are DEMO VALUES for hackathon presentation.*

### Data Passed to Next Node
Ranked plans array → Recommendation Explainer + Frontend

---

## Node 9: Recommendation Explainer (AI)

### Purpose
Generate plain-language explanation for why the recommended plan is best.

### Input
```
recommended_plan: { label: "BEST_OVERALL", cost: 2100, time: 1.2h, preserved: 92%, changed: 2 }
alternative_plans: [CHEAPEST, FASTEST]
```

### Processing
- LLM converts plan attributes into human-readable rationale
- Reference specific trade-offs against alternatives

### Output
```json
{
  "recommendation_text": "Best Overall is recommended because it preserves your hotel and important Rohtang activity while keeping additional cost moderate at ₹2,100.",
  "comparison_insight": "It costs ₹1,200 more than the cheapest option but saves approximately 2.3 hours and preserves your important activity.",
  "how_we_decide": "Plans are ranked using cost, time impact, itinerary preservation, booking changes, and your stated preferences (protect hotel, protect activities)."
}
```

### Data Passed to Next Node
Recommendation text → Frontend for display on Recovery Plans and Comparison screens

---

## Node 10: Recovery Applier

### Purpose
Apply the user's chosen recovery plan to the trip, updating bookings and recomputing Trip Health.

### Input
```
plan_id: "plan_best"
trip_id: "trip_manali_001"
user_confirmation: true
```

### Processing
1. Verify user has explicitly confirmed
2. Check idempotency (prevent duplicate application)
3. Cancel/update old bookings:
   - Airport Transfer: cancel original, create new (5:30 PM)
   - Train: cancel 5:00 PM, book 9:00 PM
   - Local Transfer: update to 3:00 AM
4. Update booking statuses to RECOVERED
5. Rebuild dependency graph with new bookings
6. Recompute Trip Health:
   - Before: 92% → After: 98%
7. Mark trip status: RECOVERED → STABLE
8. Persist recovery history

### Output
```json
{
  "recovery_applied": true,
  "plan_id": "plan_best",
  "trip_status": "STABLE",
  "trip_health_before": 92,
  "trip_health_after": 98,
  "recovery_summary": {
    "bookings_changed": 2,
    "bookings_preserved": 4,
    "additional_cost": 2100,
    "refunds": 500,
    "new_charges": 2600,
    "net_cost": 2100,
    "additional_time_hours": 1.2
  },
  "updated_itinerary": [
    { "type": "FLIGHT", "label": "Pune → Delhi", "time": "3:00 PM - 5:00 PM", "status": "DELAYED_RECOVERED" },
    { "type": "TRANSFER", "label": "Airport → Hotel", "time": "5:30 PM - 6:30 PM", "status": "NEW" },
    { "type": "HOTEL", "label": "Delhi Hotel", "time": "7:00 PM", "status": "PRESERVED" },
    { "type": "TRAIN", "label": "Delhi → Chandigarh", "time": "9:00 PM - 2:00 AM", "status": "NEW" },
    { "type": "TRANSFER", "label": "Chandigarh → Manali", "time": "3:00 AM - 9:00 AM", "status": "UPDATED" },
    { "type": "ACTIVITY", "label": "Rohtang Pass", "time": "10:00 AM", "status": "PRESERVED" }
  ]
}
```

### Data Passed to Next Node
Updated trip state → Frontend for Updated Trip / Success screen
