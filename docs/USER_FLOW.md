# TripRescue — User Flow

## Screen Flow

```
Landing Page
    ↓
Create Trip
    ↓
Add Bookings
    ↓
Trip Dashboard
    ↓
Disruption Center
    ↓
Impact Analysis
    ↓
Recovery Plans
    ↓
Plan Comparison
    ↓
Recovery Confirmation
    ↓
Updated Trip
    ↓
My Trips
    ↓
Settings
```

---

## 01 — Landing Page

**Purpose:** Communicate TripRescue's value proposition in under 5 seconds.

**User Action:** Reads hero headline, understands the product, clicks "Create My Trip" or "See How It Works."

**System Response:** Displays hero visual of connected journey (Pune → Delhi → Chandigarh → Manali) with disruption propagation, feature sections (Detect / Understand / Recover), and product dashboard preview.

**Next State:** → Create Trip (primary) or scroll to learn more (secondary)

---

## 02 — Create Trip

**Purpose:** Collect minimum information needed to create a connected travel plan.

**User Action:** Enters trip name, primary destination, start/end dates, traveler count, maximum recovery budget, recovery strategy (Cheapest / Fastest / Best Balance), and protection preferences (avoid changing hotels, protect activities, etc.).

**System Response:** Validates form inputs, shows progress indicator (Step 1 of 3), persists trip as draft.

**Next State:** → Add Bookings

---

## 03 — Add Bookings

**Purpose:** Build the connected itinerary through booking ingestion.

**User Action:** Either uploads booking confirmation (PDF/JPG/PNG) for AI extraction, or manually selects booking type (flight, train, hotel, transfer, activity) and fills details. Reviews AI-extracted fields and corrects if needed.

**System Response:** AI extracts structured booking data with "AI extracted" badge. Displays bookings in chronological order with connection indicators. Shows progress (Step 2 of 3).

**Next State:** → Trip Dashboard (via "Build My Itinerary")

---

## 04 — Trip Dashboard

**Purpose:** Primary application view — the connected itinerary and overall trip status.

**User Action:** Views the connected itinerary timeline, monitors Trip Health score, reviews connection statuses. Can click "Simulate Disruption" or "Add Booking."

**System Response:** Displays polished connected timeline (Flight → Transfer → Hotel → Train → Transfer → Activity) with dependency indicators. Right panel shows Trip Health (92%), connection counts (Safe/At Risk), next event countdown, risk level.

**Next State:** → Disruption Center (via "Simulate Disruption") or Add Booking

---

## 05 — Disruption Center

**Purpose:** Report or simulate a disruption event.

**User Action:** Selects disruption type (Flight delayed, cancelled, etc.), selects affected booking, enters delay duration, optionally adds a free-text message. Sees live preview of how many bookings will be analyzed.

**System Response:** Shows disruption type cards, reveals affected booking details with original vs. new estimated arrival. Displays "5 connected bookings will be analyzed."

**Next State:** → Impact Analysis (via "Analyze Impact")

---

## 06 — Impact Analysis

**Purpose:** Show the ripple effect — the "wow moment" for judges.

**User Action:** Views the dependency graph with Red/Amber/Green status propagation. Reads plain-language explanations of why each booking is affected. Can expand "Why are these bookings affected?" for detailed reasoning.

**System Response:** Renders large connected dependency graph showing disruption origin and propagation path. Right panel shows Impact Summary (3 Critical, 2 At Risk, 1 Safe), estimated cost range (₹1,800–₹4,500), estimated time impact (1–5 hours), affected bookings count (5/6).

**Next State:** → Recovery Plans (via "Generate Recovery Plans")

---

## 07 — Recovery Plans

**Purpose:** Present ranked recovery options as intelligent decision support.

**User Action:** Reviews 3 plan cards (Best Overall, Cheapest, Fastest). Reads recommendation explanation. Can sort/filter by cost, time, convenience, preservation. Expands "How we decide" for transparency.

**System Response:** Displays 3 large recovery plan cards with badges, costs, time impacts, preservation %, changed bookings, convenience scores, and preserved-item checkmarks. Highlights recommended plan. Shows recommendation rationale.

**Next State:** → Plan Comparison (via "View Plan" or compare) or → Recovery Confirmation (direct select)

---

## 08 — Plan Comparison

**Purpose:** Side-by-side comparison across all key dimensions.

**User Action:** Reviews comparison table across Cheapest / Best Overall / Fastest on cost, time, bookings changed, hotel/activity preservation, convenience, itinerary preservation. Reads "Why we recommend Best Overall" rationale. Views mini timeline per plan.

**System Response:** Renders clear comparison table with visual score bars. Highlights Best Overall with recommended indicator. Shows trade-off analysis ("It costs ₹1,200 more but saves ~2.3 hours and preserves your activity").

**Next State:** → Recovery Confirmation (via "Choose Best Overall" or "Choose Another Plan")

---

## 09 — Recovery Confirmation

**Purpose:** Review exact changes before applying recovery — the trust-building step.

**User Action:** Reviews selected plan summary, examines Before → After itinerary visualization, checks "Bookings that will change" vs. "Bookings that remain unchanged," verifies cost breakdown (refunds, new charges, net cost). Confirms via "Confirm & Apply Recovery."

**System Response:** Shows before/after itinerary with changed bookings highlighted. Displays transparent cost breakdown (Expected refunds: ₹500, Additional payments: ₹2,600, Net additional cost: ₹2,100). Requires explicit confirmation dialog.

**Next State:** → Updated Trip (after confirmation)

---

## 10 — Updated Trip (Success)

**Purpose:** The payoff — show the trip is back on track.

**User Action:** Views the recovered itinerary and Trip Health improvement. Can download recovery summary. Clicks "View Full Itinerary" to return to dashboard.

**System Response:** Top success state "Your trip is back on track." Trip Health transformation (92% → 98%) with visual improvement indicator. Updated connected itinerary with Confirmed/Preserved marks. Recovery Summary (2 changed, 4 preserved, ₹2,100, +1.2h). "Trip Stable" status.

**Next State:** → Trip Dashboard (via "View Full Itinerary") or → My Trips

---

## 11 — My Trips

**Purpose:** Manage all trips and view recovery history.

**User Action:** Views trip cards, searches and filters by Upcoming/Past/Disrupted/Recovered. Clicks a trip to view its dashboard. Clicks "+ Create New Trip" to start a new trip.

**System Response:** Displays trip cards with name, destination, dates, Trip Health, booking count, status. Search and filter controls.

**Next State:** → Trip Dashboard (select trip) or → Create Trip (new trip)

---

## 12 — Settings

**Purpose:** Configure recovery preferences and personal settings.

**User Action:** Adjusts recovery strategy, budget ceiling, protection toggles, notification preferences, traveler profile, AI explanation preferences. Saves changes.

**System Response:** Form sections with current settings. Validation on save. Confirmation of saved preferences.

**Next State:** → Previous screen (navigation)
