# TripRescue — Demo Input → Processing → Output Flow

## Demo Scenario: Manali Adventure

**Route:** Pune → Delhi → Chandigarh → Manali
**Trip:** "Manali Adventure" | 12 Sep – 17 Sep | 2 Travelers
**Disruption:** Pune → Delhi flight delayed by 5 hours

---

## Connected Itinerary (Pre-Disruption)

```
✈️  Flight:     Pune → Delhi         10:00 AM → 12:00 PM
                    ↓ (30 min buffer)
🚕  Transfer:   Airport → Hotel      12:30 PM → 1:30 PM
                    ↓ (30 min buffer)
🏨  Hotel:      Delhi Hotel          2:00 PM check-in
                    ↓ (2h buffer)
🚆  Train:      Delhi → Chandigarh   5:00 PM → 10:00 PM
                    ↓ (60 min buffer)
🚕  Transfer:   Chandigarh → Manali  11:00 PM → 7:00 AM (+1)
                    ↓ (3h buffer)
🏔️  Activity:   Rohtang Pass         10:00 AM (next day)
```

**Trip Health:** 92% Healthy | **Status:** All bookings Confirmed/Safe

---

## INPUT

### What enters the system

| Data | Value |
|------|-------|
| Trip ID | `trip_manali_001` |
| Disrupted Booking | Pune → Delhi Flight (booking_id: `bk_flight_001`) |
| Disruption Type | `DELAY` |
| Delay Duration | 300 minutes (5 hours) |
| Original Departure | 10:00 AM |
| Original Arrival | 12:00 PM |
| New Estimated Departure | 3:00 PM |
| New Estimated Arrival | 5:00 PM |
| User Message | "Airline says there may be additional delays" |

---

## PROCESSING

### Stage 1: Disruption Detection

**Input:** Disruption report (booking_id, type, delay_minutes)

**Processing:**
- Validate disruption against existing booking
- Compute new estimated times
- Persist disruption record
- Mark origin booking as DISRUPTED

**Output:**
```json
{
  "disruption_id": "dis_001",
  "trip_id": "trip_manali_001",
  "booking_id": "bk_flight_001",
  "type": "DELAY",
  "delay_minutes": 300,
  "original_arrival": "12:00 PM",
  "new_arrival": "5:00 PM",
  "status": "DISRUPTED"
}
```

---

### Stage 2: Dependency Graph Construction

**Input:** All bookings for trip + dependency edges

**Processing:**
- Load trip bookings as graph nodes
- Load dependency edges with min_buffer_minutes
- Build adjacency list

**Output:**
```
Graph Nodes: [Flight, Transfer, Hotel, Train, Transfer, Activity]
Graph Edges:
  Flight → Airport Transfer (min_buffer: 30 min)
  Airport Transfer → Hotel (min_buffer: 30 min)
  Hotel → Train (min_buffer: 120 min)
  Train → Local Transfer (min_buffer: 60 min)
  Local Transfer → Activity (min_buffer: 180 min)
```

---

### Stage 3: Impact Propagation (Topological Traversal)

**Input:** Disruption event + dependency graph

**Processing:**
For each downstream node in topological order, compute:
```
available_slack = downstream_start_time - upstream_effective_end_time - min_buffer_minutes
```

| Node | Upstream End | Node Start | Buffer | Slack | Status |
|------|-------------|------------|--------|-------|--------|
| ✈️ Flight | — | — | — | — | 🔴 DISRUPTED (+5h) |
| 🚕 Airport Transfer | 5:00 PM (new arrival) | 12:30 PM (original) | 30 min | -270 min | 🔴 CRITICAL (missed) |
| 🏨 Hotel | 5:30 PM (propagated) | 2:00 PM (original) | 30 min | -210 min | 🟡 AT RISK (late arrival, but hotel still available) |
| 🚆 Train | 6:00 PM (propagated) | 5:00 PM (original) | 120 min | -180 min | 🔴 CRITICAL (missed) |
| 🚕 Local Transfer | N/A (train missed) | 11:00 PM (original) | 60 min | N/A | 🔴 CRITICAL (depends on missed train) |
| 🏔️ Activity | N/A (transfer missed) | 10:00 AM +1 (original) | 180 min | Undetermined | 🟡 AT RISK (depends on recovery) |

**Output:**
```json
{
  "disruption_id": "dis_001",
  "impact_results": [
    { "booking": "Airport Transfer", "severity": "CRITICAL", "reason": "Flight arrives 4.5h after transfer was scheduled" },
    { "booking": "Hotel Check-in", "severity": "AT_RISK", "reason": "Late arrival but room still available" },
    { "booking": "Train", "severity": "CRITICAL", "reason": "Train departs before delayed flight arrives" },
    { "booking": "Local Transfer", "severity": "CRITICAL", "reason": "Depends on missed train connection" },
    { "booking": "Activity", "severity": "AT_RISK", "reason": "Reachability depends on recovery" }
  ],
  "summary": {
    "critical": 3,
    "at_risk": 2,
    "safe": 0,
    "affected_bookings": "5 / 6"
  }
}
```

---

### Stage 4: AI-Generated Impact Explanation

**Input:** Structured impact results

**Processing:** LLM converts structured data into plain-language explanations

**Output:**
- "Your Pune → Delhi flight now arrives at 5:00 PM — 5 hours later than planned."
- "The airport transfer at 12:30 PM will be missed because you won't have landed yet."
- "Your Delhi hotel check-in will be delayed but the room remains available."
- "The 5:00 PM train to Chandigarh departs before your delayed flight can reach the station."
- "The Chandigarh → Manali transfer depends on the train you'll miss."
- "The Rohtang Pass activity is at risk depending on how the trip is recovered."

---

### Stage 5: Recovery Candidate Generation

**Input:** Impact results + user preferences + mock availability data

**Processing:**
- For each CRITICAL/AT_RISK booking, query mock adapters for alternatives
- Apply user constraints: budget ceiling, hotel preference, activity protection
- Assemble complete alternative itineraries from candidate combinations

**Candidates found (demo values):**
- Alternative trains: 7:00 PM Delhi → Chandigarh, 9:00 PM Delhi → Chandigarh
- Alternative transfers: Taxi Chandigarh → Manali (various times)
- Bus alternative: Delhi → Manali direct overnight
- Hotel: Keep existing vs. reschedule

---

### Stage 6: Constraint Validation

**Input:** Candidate recovery plans + user preferences

**Processing:**
- Verify each plan satisfies budget ceiling
- Verify temporal feasibility (no negative slack in recovered itinerary)
- Check user preferences: hotel preserved? activity preserved? no overnight travel?
- Filter infeasible or preference-violating plans

**Output:** 3 feasible, validated plans

---

### Stage 7: Scoring & Ranking

**Input:** 3 validated plans

**Processing:**
Score each plan on 4 normalized dimensions (0–1):
- **Cost Score** = 1 - (additional_cost / max_additional_cost)
- **Time Score** = 1 - (additional_time / max_additional_time)
- **Preservation Score** = itinerary_preserved_percentage / 100
- **Convenience Score** = composite of booking_changes, preference_alignment

Weighted composite for "Best Overall":
```
overall = 0.3 × cost + 0.25 × time + 0.25 × preservation + 0.2 × convenience
```

**Output:**

| Plan | Additional Cost | Time Impact | Preserved | Changed | Convenience |
|------|----------------|-------------|-----------|---------|-------------|
| 🏆 **Best Overall** | ₹2,100 | +1.2h | 92% | 2 | 4.5/5 |
| 💰 **Cheapest** | ₹900 | +3.5h | 78% | 3 | 3.0/5 |
| ⚡ **Fastest** | ₹4,500 | +0h | 100% | 1 | 5.0/5 |

*All values are demo values for hackathon presentation.*

---

### Stage 8: Recommendation Explanation

**Input:** Ranked plan attributes

**Processing:** LLM generates plain-language rationale

**Output:**
> "Best Overall is recommended because it preserves your hotel and important activity while keeping additional cost moderate. It costs ₹1,200 more than the cheapest option but saves approximately 2.3 hours and preserves your Rohtang Pass activity."

---

### Stage 9: User Approval & Apply Recovery

**Input:** User selects "Best Overall" plan

**Processing:**
- Display before/after itinerary visualization
- Show cost breakdown:
  - New bookings: ₹2,600
  - Expected refunds: -₹500
  - Net additional cost: ₹2,100
- User confirms via explicit "Confirm & Apply Recovery" action
- Update bookings: cancel old train + transfer, create new train + transfer
- Recompute dependency graph with updated bookings
- Recalculate Trip Health

**Output:**
```json
{
  "recovery_applied": true,
  "plan": "Best Overall",
  "bookings_changed": 2,
  "bookings_preserved": 4,
  "additional_cost": 2100,
  "additional_time_hours": 1.2,
  "trip_health_before": 92,
  "trip_health_after": 98,
  "trip_status": "RECOVERED"
}
```

---

## OUTPUT

### Updated Connected Itinerary (Post-Recovery)

```
✈️  Flight:     Pune → Delhi         3:00 PM → 5:00 PM  (Delayed but recovered)
                    ↓
🚕  Transfer:   Airport → Hotel      5:30 PM → 6:30 PM  (NEW ✓)
                    ↓
🏨  Hotel:      Delhi Hotel          7:00 PM check-in    (Preserved ✓)
                    ↓
🚆  Train:      Delhi → Chandigarh   9:00 PM → 2:00 AM  (NEW ✓)
                    ↓
🚕  Transfer:   Chandigarh → Manali  3:00 AM → 9:00 AM  (Updated ✓)
                    ↓
🏔️  Activity:   Rohtang Pass         10:00 AM            (Preserved ✓)
```

### Trip Health Transformation
- **Before:** 92% → **After:** 98%
- **Status:** Trip Stable ✅

### Recovery Summary
- 2 bookings changed (train, airport transfer)
- 4 bookings preserved (flight, hotel, local transfer concept, activity)
- ₹2,100 additional cost
- +1.2 hours additional travel time

### Demo Story Complete
```
Normal Trip → Flight Delay → Ripple Effect → 3 Critical, 2 At Risk
→ 3 Recovery Plans → Explainable Recommendation → User Approval
→ Recovery Applied → Trip Health 92% → 98% → Trip Back on Track ✅
```
