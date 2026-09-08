# TripRescue — Master Architecture Document

**Intelligent Travel Disruption Recovery Engine**
*"When your trip breaks, we rebuild it."*

---

## 1. Product Architecture

TripRescue is an intelligent platform that models a traveler's entire trip as a **connected dependency graph**. When any booking is disrupted, it automatically detects every downstream impact, generates ranked recovery plans, and lets the traveler restore their trip with a single confirmation.

### Core Product Loop
```
Detect → Understand Impact → Generate Recovery → Compare Options → Apply Recovery → Continue Trip
```

### Fundamental Concept
A travel itinerary is a **connected dependency system**, not just a list of bookings. One disruption can cascade through multiple downstream bookings. TripRescue is the only product that models, detects, and resolves this ripple effect end-to-end.

### Key Differentiators
- **Dependency-aware:** Graph-based trip model, not flat booking list
- **Deterministic intelligence:** Impact analysis uses graph traversal, not AI guesswork
- **Explainable recommendations:** Every recommendation has traceable reasoning
- **Constraint-aware recovery:** Respects user budget, hotel/activity preferences
- **Calm UX:** "Reduce panic, increase clarity" under travel stress

---

## 2. Frontend Architecture

### Stack
| Technology | Purpose |
|-----------|---------|
| Next.js (App Router) | Framework — routing, SSR, API routes |
| React + TypeScript | Component model, type safety |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible component primitives |
| Lucide React | Icon system |
| Zustand | Client-side state (UI, modal, active trip) |
| TanStack Query | Server state, caching, background refetching |
| Recharts | Charts for Trip Health, cost visualization |

### Screen Architecture (12 screens)
1. Landing Page — Value proposition in 5 seconds
2. Create Trip — Trip details, budget, recovery preferences
3. Add Bookings — AI extraction + manual entry
4. **Trip Dashboard** — Connected itinerary timeline + Trip Health
5. **Disruption Center** — Report/simulate disruption
6. **Impact Analysis** — Dependency graph ripple visualization (wow moment)
7. **Recovery Plans** — 3 ranked plans with recommendation
8. **Plan Comparison** — Side-by-side comparison table
9. **Recovery Confirmation** — Before/after + cost breakdown + confirm
10. **Updated Trip** — Trip Health restored, "Trip Stable" (payoff)
11. My Trips — Trip management and history
12. Settings — Preferences and configuration

**Demo priority:** Screens 04–10 form the core 7-screen hackathon loop.

### Shared Component Library
All screens built from reusable components: AppShell, TripTimeline, BookingCard, DependencyGraph, TripHealth, StatusBadge, RecoveryPlanCard, PlanComparison, etc. See `FRONTEND_COMPONENT_ARCHITECTURE.md` for full details.

---

## 3. Backend Architecture

### Stack
| Technology | Purpose |
|-----------|---------|
| FastAPI (Python 3.11+) | Async REST API framework |
| Pydantic v2 | Request/response validation |
| SQLAlchemy | ORM for PostgreSQL |
| Python graph logic | Dependency graph engine |

### Service Modules

| Service | Responsibility |
|---------|---------------|
| **Trip Service** | CRUD, lifecycle management, Trip Health caching |
| **Booking Service** | CRUD, sequencing, dependency inference, status management |
| **Disruption Service** | Accept disruption reports, trigger impact pipeline |
| **Dependency Graph Engine** | Build graph, topological traversal, slack computation, severity classification |
| **Recovery Engine** | Candidate generation, constraint validation, scoring, ranking |
| **Trip Health Engine** | Deterministic health score computation |
| **AI Integration Service** | LLM communication for extraction and explanation |

### Request Flow
```
Frontend → API Layer (FastAPI)
             ↓
    Request Validation (Pydantic)
             ↓
    Service Router → Appropriate Service Module
             ↓
    Database (SQLAlchemy → PostgreSQL)
             ↓
    Response Serialization
             ↓
    Frontend
```

---

## 4. AI Architecture

### AI Responsibilities (Bounded)
| Task | Input | Output |
|------|-------|--------|
| Booking Extraction | PDF/image of confirmation | Structured booking JSON |
| Disruption Interpretation | Unstructured text | Structured disruption data |
| Impact Explanation | Structured ImpactResult | Plain-language text |
| Recommendation Rationale | Plan attributes | 1-2 sentence explanation |

### Deterministic Responsibilities (Core Logic)
- Time/date calculations and normalization
- Dependency graph construction and traversal
- Impact propagation (topological order, slack computation)
- Severity classification (Safe/At Risk/Critical)
- Constraint validation (budget, preferences)
- Cost/refund calculations
- Normalized scoring and weighted ranking
- Trip Health computation
- Recovery feasibility verification
- Booking state transitions

### Critical Design Rule
> AI generates candidates and explanations. The deterministic engine validates, scores, and ranks. AI-generated recovery candidates **must pass deterministic validation** before being presented.

### LLM Configuration
- Primary: Claude API (structured output)
- Fallback: Template-based text if LLM unavailable
- All AI outputs validated against Pydantic schemas
- User review required before any AI extraction is persisted

---

## 5. Dependency Engine

### Graph Model
Each Booking is a **node**. A Dependency is a **directed edge** with `min_buffer_minutes`. The graph forms a DAG (directed acyclic graph) per trip.

### Impact Propagation Algorithm
```
1. On disruption: update origin booking's effective end time
2. Traverse downstream edges in topological order
3. For each downstream node:
   slack = node_start - upstream_effective_end - min_buffer
4. Classify:
   slack ≥ threshold → SAFE
   0 ≤ slack < threshold → AT_RISK
   slack < 0 → CRITICAL
5. Propagate effective time forward through further downstream nodes
6. Persist ImpactResult per affected node
```

### Demo Trace
```
Flight delayed 5h → new arrival 5:00 PM
  → Transfer (12:30 PM): slack = -270 min → CRITICAL (missed)
  → Hotel (2:00 PM): slack = -210 min → AT_RISK (late arrival)
  → Train (5:00 PM): slack = -180 min → CRITICAL (connection missed)
  → Local Transfer (11:00 PM): upstream broken → CRITICAL
  → Activity (10:00 AM +1): chain dependent → AT_RISK
```

---

## 6. Impact Analysis

### Computation
- Graph traversal produces structured `ImpactResult` per affected booking
- Each result includes: severity, slack_minutes, reason_code
- Summary aggregates: critical count, at-risk count, safe count, cost/time estimates

### Explanation
- Structured results sent to LLM for plain-language conversion
- Fallback: template-based text using reason_code
- User sees: what happened, what's affected, why it's affected, how serious

---

## 7. Recovery Engine

### Pipeline
```
1. Identify CRITICAL and AT_RISK bookings
2. Query mock adapters for alternative bookings per affected node
3. Assemble candidate combinations into complete recovery plans
4. Filter by hard constraints (budget ceiling, temporal feasibility)
5. Score on 4 dimensions: Cost, Time, Preservation, Convenience
6. Label: Best Overall (highest weighted composite), Cheapest, Fastest
7. Generate AI explanation for recommended plan
```

### Scoring Formula
```
Cost Score      = 1 - (plan_cost / max_cost)           × 0.30
Time Score      = 1 - (plan_time / max_time)           × 0.25
Preservation    = preserved_pct / 100                   × 0.25
Convenience     = composite(changes, pref_alignment)    × 0.20
─────────────────────────────────────────────────────────────
Overall Score   = weighted sum of above
```

### Explainability
> "Best Overall is recommended because it preserves your hotel and important activity while keeping additional cost moderate. It costs ₹1,200 more than the cheapest but saves ~2.3 hours."

All reasoning is traceable to specific, auditable plan attributes.

---

## 8. Database Architecture

### Technology
PostgreSQL with SQLAlchemy ORM. Managed instance (Supabase/Neon/Railway).

### Core Entities
```
User (1) ──→ (N) Trip
Trip (1) ──→ (N) Booking
Booking ←──→ Dependency (edges between bookings)
Trip (1) ──→ (N) Disruption
Disruption (1) ──→ (1) Booking (origin)
Disruption (1) ──→ (N) ImpactResult
Disruption (1) ──→ (N) RecoveryPlan
RecoveryPlan (1) ──→ (N) RecoveryPlanChange
User (1) ──→ (1) Preferences
```

Full schema in `DATA_ARCHITECTURE.md`.

---

## 9. API Architecture

REST API served by FastAPI. Key endpoints:

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/trips | Create trip |
| GET | /api/trips | List trips |
| GET | /api/trips/{id} | Get trip detail |
| POST | /api/trips/{id}/bookings | Add booking |
| POST | /api/trips/{id}/bookings/extract | AI-extract from upload |
| POST | /api/trips/{id}/disruptions | Report disruption |
| GET | /api/disruptions/{id}/impact | Get impact analysis |
| GET | /api/disruptions/{id}/recovery-plans | Get recovery plans |
| GET | /api/recovery-plans/{id}/compare | Get comparison data |
| POST | /api/recovery-plans/{id}/apply | Apply recovery |
| GET | /api/trips/{id}/health | Get Trip Health |

Full API specification in `API_PLAN.md`.

---

## 10. Data Flow

```
User Input (trip, bookings, disruption)
       ↓
  API Layer (validation, routing)
       ↓
  Service Layer (Trip, Booking, Disruption services)
       ↓
  ┌────┴────┐
  ↓         ↓
Graph    AI Service
Engine   (extraction,
  ↓       explanation)
Impact    ↓
Results  Text
  ↓      ↓
  └──┬───┘
     ↓
Recovery Engine (candidates, validation, scoring)
     ↓
Ranked Plans → Frontend (display, comparison)
     ↓
User Approval
     ↓
Recovery Application → Updated Bookings → Recomputed Trip Health
     ↓
Trip Stable
```

---

## 11. User Flow

```
Landing → Create Trip → Add Bookings → Trip Dashboard
→ Disruption → Impact Analysis → Recovery Plans
→ Comparison → Confirmation → Updated Trip → My Trips
```

Full flow with purpose, actions, and transitions in `USER_FLOW.md`.

---

## 12. Demo Flow

**Scenario:** Manali Adventure — Pune → Delhi → Chandigarh → Manali
**Disruption:** 5-hour flight delay
**Result:** 3 Critical, 2 At Risk → 3 recovery plans → Best Overall applied → Trip restored (92% → 98%)

Full demo data, processing, and outputs in `DEMO_INPUT_OUTPUT_FLOW.md` and `DEMO_NODE_INPUT_OUTPUT.md`.

---

## 13. Security

| Concern | Implementation |
|---------|---------------|
| Transport | HTTPS/TLS |
| Authentication | JWT-based sessions |
| Authorization | Per-request trip ownership check |
| Input validation | Pydantic schemas on all inputs |
| File uploads | Size/type validation (10MB, PDF/JPG/PNG only) |
| AI data handling | Strip PII, don't persist LLM I/O unnecessarily |
| Recovery application | Idempotent, explicit confirmation required |
| Data at rest | PII encrypted |
| Rate limiting | On upload, analysis, recovery endpoints |

---

## 14. Error Handling

| Scenario | Strategy |
|----------|----------|
| AI extraction fails | Offer manual entry fallback |
| AI extraction inaccurate | User review/edit before save (never auto-persist) |
| LLM unavailable | Deterministic engines still work; explanations use templates |
| Recovery generation timeout | Progress indicator; partial results or retry |
| Duplicate recovery application | Idempotent endpoint returns existing result |
| All user-facing errors | Non-technical language, actionable suggestions |

---

## 15. MVP Architecture

**Built:**
- Full 12-screen frontend
- FastAPI backend with all core services
- Dependency graph engine with impact propagation
- Recovery engine with scoring and ranking
- AI extraction and explanation (LLM API)
- PostgreSQL database
- Pre-seeded demo data

**Mocked:**
- Flight/train/hotel availability (pre-seeded data)
- Pricing (hardcoded demo values)
- Payment processing (not implemented)
- Real-time carrier feeds (user-triggered disruption)
- Authentication (simplified single-user)

---

## 16. Production Evolution

1. **Phase 1 (1-3mo):** Real auth, carrier APIs, hotel APIs, observability
2. **Phase 2 (3-6mo):** Proactive risk prediction, real-time disruption detection, push notifications
3. **Phase 3 (6-12mo):** Multi-traveler, mobile apps, payments, insurance
4. **Phase 4 (12+mo):** Predictive ML, global coverage, partner ecosystem

Full roadmap in `MVP_VS_PRODUCTION.md`.

---

## 17. Scalability

| Layer | MVP | Production Path |
|-------|-----|----------------|
| Frontend | Vercel (free) | Vercel Pro, CDN, edge |
| Backend | Single container | Kubernetes/ECS, horizontal scaling |
| Database | Managed PostgreSQL | Read replicas, connection pooling |
| Cache | TanStack Query | Redis + TanStack Query |
| AI calls | Direct LLM API | Queue-based with rate limiting |
| File storage | Local/minimal S3 | Full S3 with lifecycle |
| Graph engine | In-process Python | Separate service, async for large trips |

---

## 18. Major Assumptions

1. **Hackathon uses mock data** — all flight/train/hotel availability and pricing is pre-seeded, not live API data. Demo values are clearly labeled.
2. **Single-user trips** — multi-traveler collaboration is out of scope for MVP.
3. **Currency is INR (₹)** — multi-currency support deferred.
4. **AI extraction is demo-quality** — production would require confidence scoring and verification layer.
5. **Disruption is user-triggered** — real-time carrier feed integration is post-hackathon.
6. **PostgreSQL is sufficient** — no need for NoSQL, graph database, or distributed data store for MVP scale.
7. **LLM API is available** — fallback to template-based text if unavailable.
8. **Dependency graph is a DAG** — no circular dependencies between bookings.
9. **Recovery search space is bounded** — capped at 3-5 candidates per booking type to ensure sub-5-second response.
10. **Demo scenario is deterministic** — "Manali Adventure" with 5-hour flight delay produces consistent, reproducible results.
