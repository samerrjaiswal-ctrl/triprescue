# TripRescue — Hackathon Project Plan

## Project Overview

### What is TripRescue?

**TripRescue** is an Intelligent Travel Disruption Recovery Engine. When a traveler's trip breaks — a flight is delayed, a train is cancelled, a connection is missed — TripRescue automatically detects the ripple effect across the entire connected itinerary and generates ranked, ready-to-apply recovery plans that get the traveler back on track in seconds.

**Tagline:** *"When your trip breaks, we rebuild it."*

### The Problem

A modern multi-leg trip is not a list of independent bookings — it is a **chain of dependent events**:

```
Flight → Airport Transfer → Hotel → Train → Local Transfer → Activity
```

When one booking is disrupted (e.g., a 5-hour flight delay), the consequences silently cascade through downstream bookings:
- The airport transfer is missed
- The hotel check-in timing shifts
- The train connection becomes infeasible
- The local transfer must be rescheduled
- The activity may no longer be reachable

Today, travelers discover these impacts **one at a time**, usually too late, and must manually research and rebook everything under time pressure and stress.

### Why Existing Solutions Fail

| Solution | Limitation |
|----------|-----------|
| Airline/train apps | Only manage their own leg — zero visibility into hotels, transfers, activities |
| Itinerary apps (TripIt-style) | Passive display — no dependency reasoning, no recovery actions |
| Generic AI chatbots | Conversational but can't model structured dependency graphs or generate constraint-aware recovery plans |
| Manual recovery | Slow, stressful, error-prone — travelers miss downstream impacts entirely |

### The Solution

TripRescue models the entire trip as a **connected dependency graph**. When any node (booking) is disrupted, the system:

1. **Detects** the disruption
2. **Propagates** the impact through the dependency graph
3. **Identifies** every downstream booking that is affected
4. **Generates** ranked recovery plans (Best Overall, Cheapest, Fastest)
5. **Validates** each plan against constraints and preferences
6. **Explains** the recommendation in plain language
7. **Applies** the chosen recovery with one confirmation
8. **Restores** trip health

### Unique Value Proposition

- **Dependency-aware:** Treats a trip as a system, not a list
- **Deterministic intelligence:** Graph-based impact analysis, not AI guesswork
- **Explainable recommendations:** "Here is why we recommend this," not "AI says this is best"
- **Constraint-aware recovery:** Respects budget, hotel preferences, activity priorities
- **Calm UX under stress:** "Reduce panic, increase clarity"

### Hackathon Value Proposition

The demo delivers a visually compelling "wow moment" when judges see a single flight delay ripple through 5 connected bookings, followed by intelligent recovery plans that restore the trip — demonstrating technical depth (dependency graph, constraint optimization, AI extraction) wrapped in a premium, calm UX.

---

## End-to-End Product Flow

```
User
 → Landing Page (understand product in 5 seconds)
 → Create Trip (name, dates, budget, recovery preferences)
 → Add Bookings (upload confirmations for AI extraction or add manually)
 → Trip Dashboard (connected itinerary timeline + Trip Health)
 → Disruption Detected (flight delayed 5 hours)
 → Impact Analysis (dependency graph shows ripple across 5 bookings)
 → Recovery Generation (3 ranked plans generated in seconds)
 → Recovery Validation (constraint checks, feasibility verification)
 → Recovery Ranking (cost × time × preservation × convenience × preferences)
 → Plan Comparison (side-by-side with explainable recommendation)
 → User Approval (before/after view, cost breakdown, explicit confirmation)
 → Apply Recovery (bookings updated, itinerary modified)
 → Updated Trip (Trip Health restored, "Trip Stable" status)
 → My Trips (recovery history retained)
```

---

## Core Intelligence

### Direct Impact
The booking directly affected by the disruption event (e.g., the delayed flight itself).

### Downstream Impact
Other bookings in the dependency chain that become infeasible or at-risk because of time propagation from the original disruption.

### Dependency
A directed edge between two bookings representing a real-world relationship: "you must arrive at point A before the next booking departs/starts at point B." Each dependency carries a `min_buffer_minutes` representing minimum feasible connection time.

### Connection Risk Classification

| Status | Meaning | Visual |
|--------|---------|--------|
| **Safe** | Sufficient time slack — booking remains feasible | 🟢 Green |
| **At Risk** | Time slack is reduced — booking may become infeasible | 🟡 Amber |
| **Critical** | Time slack is negative — booking is infeasible without intervention | 🔴 Red |
| **Disrupted** | Original booking is directly affected | 🔴 Red |
| **Recovered** | A recovery action has restored feasibility | 🟢 Green/Teal |

### Recovery Plan
A complete combination of alternative bookings that restores trip feasibility. Each plan specifies which bookings change, which are preserved, and the total impact.

### Recovery Ranking Dimensions
- **Cost** — lower additional cost scores higher
- **Time** — lower total time lost scores higher
- **Itinerary Preservation** — higher % of original bookings retained scores higher
- **Convenience** — fewer booking changes, better preference alignment scores higher
- **Specific Preferences** — hotel preserved, activity preserved, no overnight travel

---

## Technical Execution

### Frontend
- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** for component library
- **Lucide React** for icons
- **Zustand** for local/UI state
- **TanStack Query** for server state and caching
- **Recharts** for data visualization
- Custom SVG for dependency graph and timeline

### Backend
- **FastAPI** (Python 3.11+) with **Pydantic** v2 validation
- REST API consumed by the frontend
- Service-oriented modules: Trip Management, Booking Service, Disruption Handler, Impact Engine, Recovery Engine, Trip Health
- Mock adapters for external travel/pricing APIs

### AI / LLM
- **Booking Extraction** — structured data from uploaded PDF/image confirmations
- **Disruption Interpretation** — understanding unstructured disruption messages
- **Recommendation Explanations** — plain-language rationale for recovery plans
- AI does NOT decide severity, feasibility, or ranking — those are deterministic

### Dependency Engine
- Python adjacency-list graph model
- Topological-order traversal for impact propagation
- Time-slack computation per edge
- Severity classification per downstream node

### Database
- **PostgreSQL** — relational model for trips, bookings, dependencies, disruptions, impact results, recovery plans
- **SQLAlchemy** ORM

### External Services
- **MVP:** Mocked flight/train/hotel availability adapters behind stable interfaces
- **Production:** Real carrier APIs, hotel APIs, pricing APIs, weather APIs
- External adapters are swappable without changing core engine

### Storage
- S3-compatible object storage for uploaded booking confirmations
- Signed, time-limited URLs for client-side preview

### Security
- HTTPS/TLS for all traffic
- JWT-based authentication
- Per-request authorization (trip ownership verification)
- PII encryption at rest
- Rate limiting on file upload and analysis endpoints
- AI extraction requests strip unnecessary PII

### Error Handling
- Graceful degradation if AI service is unavailable
- User-editable AI extraction results (never silently auto-apply)
- Explicit confirmation before recovery application
- Idempotent recovery application to prevent duplicates
- Non-technical error messages to users

### MVP Scope
- Trip creation, booking ingestion (manual + AI extraction)
- Connected itinerary with dependency graph
- Disruption simulation
- Full impact analysis with ripple visualization
- 3 ranked recovery plans with explainable recommendation
- Before/after recovery application
- Trip Health score

### Demo Strategy
- Pre-seeded "Manali Adventure" trip: Pune → Delhi → Chandigarh → Manali
- 6 connected bookings: Flight, Airport Transfer, Hotel, Train, Local Transfer, Activity
- Disruption: Pune → Delhi flight delayed 5 hours
- Show ripple effect → 3 recovery plans → compare → apply → trip recovered
- Target duration: 3–5 minutes
- All data is demo/mock — clearly documented
