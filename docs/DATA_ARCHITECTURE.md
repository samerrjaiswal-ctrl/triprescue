# TripRescue — Data Architecture

## Overview

TripRescue uses a **relational data model** in PostgreSQL. The schema is designed around the core concept: a Trip contains Bookings connected by Dependencies, which can be affected by Disruptions that produce Impact Results and Recovery Plans.

---

## Entity Relationship Flow

```
User
 ↓ (1:N)
Trip
 ↓ (1:N)
Bookings ←→ Dependencies (edges between bookings)
 ↓ (1:N)
Disruption
 ↓ (1:N)
Impact Results (per affected booking)
 ↓ (1:N)
Recovery Plans
 ↓ (1:N)
Recovery Plan Changes (per changed booking)
 ↓
Recovery Application → Updated Itinerary
 ↓
Trip History
```

---

## Core Entities

### User

**Purpose:** Represents a registered traveler.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | User's display name |
| email | VARCHAR(255) | Unique email address |
| home_city | VARCHAR(100) | Home city for default origin |
| preferences_id | UUID (FK) | Link to user preferences |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

**Relationships:** One User → Many Trips
**Lifecycle:** Created on registration → Updated on profile changes

---

### Trip

**Purpose:** A travel plan containing multiple connected bookings.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID (FK) | Owner of the trip |
| name | VARCHAR(255) | Trip name (e.g., "Manali Adventure") |
| destination | VARCHAR(255) | Primary destination |
| start_date | DATE | Trip start date |
| end_date | DATE | Trip end date |
| traveler_count | INTEGER | Number of travelers |
| budget_ceiling | DECIMAL(10,2) | Maximum additional recovery budget (₹) |
| recovery_strategy | ENUM | DEFAULT 'best_overall' — Cheapest / Fastest / Best Overall |
| trip_health_score | INTEGER | 0-100 composite health score |
| status | ENUM | Current trip status |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Status Values:** `DRAFT` → `ACTIVE` → `DISRUPTED` → `RECOVERING` → `RECOVERED` → `STABLE`

**Relationships:** One Trip → Many Bookings, Many Disruptions
**Lifecycle:** Draft (created, no bookings) → Active (bookings added) → Disrupted (disruption reported) → Recovering (recovery in progress) → Recovered/Stable (recovery applied)

---

### Booking

**Purpose:** A single travel booking within a trip (flight, train, hotel, transfer, activity, etc.).

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| trip_id | UUID (FK) | Parent trip |
| type | ENUM | FLIGHT / TRAIN / BUS / HOTEL / TRANSFER / ACTIVITY / TOUR / EVENT |
| origin | VARCHAR(255) | Departure city/location |
| destination | VARCHAR(255) | Arrival city/location |
| start_time | TIMESTAMP | Scheduled start/departure time |
| end_time | TIMESTAMP | Scheduled end/arrival time |
| confirmation_number | VARCHAR(100) | Booking reference number |
| provider | VARCHAR(255) | Service provider name |
| cost | DECIMAL(10,2) | Booking cost |
| status | ENUM | Current booking status |
| source | ENUM | MANUAL / AI_EXTRACTED |
| is_important | BOOLEAN | User-marked as important (protectable) |
| sequence_index | INTEGER | Chronological order in trip |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

**Status Values:** `CONFIRMED` → `SAFE` → `AT_RISK` → `CRITICAL` → `DISRUPTED` → `CANCELLED` → `RECOVERED`

**Relationships:** Belongs to one Trip. Connected to other Bookings via Dependencies.
**Lifecycle:** Confirmed (added) → Safe (normal state) → At Risk/Critical/Disrupted (on disruption) → Recovered (after recovery) or Cancelled (removed)

---

### Dependency

**Purpose:** A directed edge between two bookings representing a real-world temporal dependency.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| trip_id | UUID (FK) | Parent trip |
| from_booking_id | UUID (FK) | Upstream booking |
| to_booking_id | UUID (FK) | Downstream booking |
| min_buffer_minutes | INTEGER | Minimum feasible connection time |
| dependency_type | ENUM | Type of dependency |
| created_at | TIMESTAMP | Creation time |

**Dependency Types:** `TRANSFER_TIME` / `CHECKIN_TIME` / `CONNECTION_TIME` / `REST_TIME`

**Relationships:** Links two Bookings within the same Trip. Forms a directed acyclic graph (DAG).
**Lifecycle:** Created when bookings are added/sequenced → Rebuilt when bookings change

---

### Disruption

**Purpose:** An event that affects a booking (delay, cancellation, etc.).

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| trip_id | UUID (FK) | Affected trip |
| booking_id | UUID (FK) | Directly affected booking |
| type | ENUM | DELAY / CANCELLATION / WEATHER / PLAN_CHANGE / CUSTOM |
| delay_minutes | INTEGER | Delay duration (nullable for non-delay types) |
| original_time | TIMESTAMP | Original scheduled time |
| new_estimated_time | TIMESTAMP | New estimated time after disruption |
| description | TEXT | User-provided description |
| severity | ENUM | MINOR / MODERATE / MAJOR |
| status | ENUM | ACTIVE / RESOLVED / SUPERSEDED |
| reported_at | TIMESTAMP | When disruption was reported |

**Relationships:** Belongs to one Trip, affects one origin Booking. Produces many ImpactResults and RecoveryPlans.
**Lifecycle:** Active (reported) → Resolved (recovery applied) → Superseded (new disruption overrides)

---

### ImpactResult

**Purpose:** The computed impact of a disruption on a specific downstream booking.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| disruption_id | UUID (FK) | Source disruption |
| affected_booking_id | UUID (FK) | The downstream booking affected |
| severity | ENUM | SAFE / AT_RISK / CRITICAL |
| slack_minutes | INTEGER | Remaining time slack (can be negative) |
| reason_code | VARCHAR(50) | Machine-readable reason (MISSED, LATE_ARRIVAL, CONNECTION_MISSED, etc.) |
| reason_text | TEXT | Plain-language explanation (AI-generated) |
| computed_at | TIMESTAMP | When impact was computed |

**Relationships:** Belongs to one Disruption, references one Booking.
**Lifecycle:** Created during impact analysis → Referenced by Recovery Plans → Archived after recovery

---

### RecoveryPlan

**Purpose:** A complete set of recovery actions that restores trip feasibility.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| disruption_id | UUID (FK) | Source disruption being recovered |
| label | ENUM | BEST_OVERALL / CHEAPEST / FASTEST |
| additional_cost | DECIMAL(10,2) | Net additional cost (₹) |
| refund_amount | DECIMAL(10,2) | Expected refunds |
| new_charges | DECIMAL(10,2) | New booking charges |
| time_impact_minutes | INTEGER | Additional travel time |
| itinerary_preserved_pct | DECIMAL(5,2) | % of original itinerary preserved |
| bookings_changed_count | INTEGER | Number of bookings that change |
| convenience_score | DECIMAL(3,1) | Composite convenience score (0-5) |
| is_recommended | BOOLEAN | Whether this is the system recommendation |
| rationale_text | TEXT | AI-generated explanation of recommendation |
| status | ENUM | GENERATED / SELECTED / APPLIED / EXPIRED |
| hotel_preserved | BOOLEAN | Whether hotel booking is kept |
| activity_preserved | BOOLEAN | Whether important activities are kept |
| created_at | TIMESTAMP | When plan was generated |

**Relationships:** Belongs to one Disruption. Contains many RecoveryPlanChanges.
**Lifecycle:** Generated → Selected (user chooses) → Applied (confirmed and executed) → Expired (new disruption supersedes)

---

### RecoveryPlanChange

**Purpose:** A single booking change within a recovery plan.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| recovery_plan_id | UUID (FK) | Parent recovery plan |
| original_booking_id | UUID (FK) | The booking being replaced/modified |
| change_type | ENUM | REBOOKED / CANCELLED / ADDED / MODIFIED |
| new_booking_type | ENUM | Type of new booking (if applicable) |
| new_origin | VARCHAR(255) | New origin |
| new_destination | VARCHAR(255) | New destination |
| new_start_time | TIMESTAMP | New start time |
| new_end_time | TIMESTAMP | New end time |
| new_provider | VARCHAR(255) | New service provider |
| new_cost | DECIMAL(10,2) | Cost of new booking |
| refund_from_original | DECIMAL(10,2) | Refund from cancelling original |
| change_fee | DECIMAL(10,2) | Change/cancellation fee |

**Relationships:** Belongs to one RecoveryPlan, references one original Booking.
**Lifecycle:** Created with plan → Applied when plan is executed

---

### Preferences

**Purpose:** User-configurable recovery and notification preferences.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID (FK) | Owner |
| avoid_changing_hotels | BOOLEAN | Prefer keeping hotel bookings |
| protect_important_activities | BOOLEAN | Prefer keeping important activities |
| avoid_overnight_travel | BOOLEAN | Avoid overnight transport options |
| minimize_booking_changes | BOOLEAN | Prefer fewer total changes |
| notification_connection_risk | BOOLEAN | Alert on connection risk |
| notification_disruption | BOOLEAN | Alert on disruption events |
| notification_weather | BOOLEAN | Alert on weather warnings |
| notification_recovery | BOOLEAN | Alert on recovery recommendations |
| ai_explain_recommendations | BOOLEAN | Show AI explanation text |
| ai_show_cost_breakdown | BOOLEAN | Show detailed cost breakdown |
| ai_show_risk_explanation | BOOLEAN | Show risk reasoning |
| updated_at | TIMESTAMP | Last update time |

**Relationships:** One-to-one with User.
**Lifecycle:** Created with defaults on user registration → Updated via Settings screen

---

## Key Relationships Summary

```
User (1) ──→ (N) Trip
Trip (1) ──→ (N) Booking
Booking (1) ──→ (N) Dependency (as from_booking)
Booking (1) ──→ (N) Dependency (as to_booking)
Trip (1) ──→ (N) Disruption
Disruption (1) ──→ (1) Booking (origin)
Disruption (1) ──→ (N) ImpactResult
ImpactResult (N) ──→ (1) Booking (affected)
Disruption (1) ──→ (N) RecoveryPlan
RecoveryPlan (1) ──→ (N) RecoveryPlanChange
RecoveryPlanChange (N) ──→ (1) Booking (original)
User (1) ──→ (1) Preferences
```

---

## Data Flow Lifecycle

```
1. User creates Trip (DRAFT)
2. User adds Bookings → system infers Dependencies → Trip becomes ACTIVE
3. Disruption is reported → Trip becomes DISRUPTED
4. Impact Analysis runs → ImpactResults created per affected Booking
5. Recovery Plans generated → RecoveryPlans + RecoveryPlanChanges created
6. User selects and applies plan → Bookings updated, Trip → RECOVERED/STABLE
7. History preserved (Disruption, ImpactResults, RecoveryPlan all retained)
```

---

## Indexing Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| Trip | user_id | Fast user trip listing |
| Booking | trip_id, sequence_index | Ordered itinerary retrieval |
| Dependency | trip_id | Graph construction |
| Dependency | from_booking_id, to_booking_id | Edge traversal |
| Disruption | trip_id, status | Active disruption lookup |
| ImpactResult | disruption_id | Impact retrieval |
| RecoveryPlan | disruption_id, status | Plan listing |
