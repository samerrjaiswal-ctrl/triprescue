# TripRescue — System Architecture

## 1. Architecture Overview

TripRescue follows a **three-tier architecture**: a Next.js web frontend communicates with a Python FastAPI backend over REST APIs. The backend orchestrates multiple internal services — Trip Management, Booking Service, Dependency Graph Engine, Impact Analyzer, Recovery Engine, Trip Health Engine — and delegates specific tasks (document extraction, natural-language explanation) to an AI/LLM layer. All persistent state is stored in PostgreSQL. External travel/pricing APIs are accessed through swappable adapter interfaces (mocked for the hackathon).

---

## 2. Frontend Architecture

### Technology
- **Next.js** (App Router) — server-side rendering, routing, API layer
- **React** + **TypeScript** — component model and type safety
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — pre-built accessible component primitives
- **Lucide React** — consistent icon system
- **Zustand** — lightweight client-side state management
- **TanStack Query** — server state, caching, background refetching
- **Recharts** — charts for Trip Health, cost comparison, score visualization

### Responsibilities
- Render all 12 application screens
- Manage local UI state (active trip, selected plan, form state)
- Fetch and cache backend data via REST API
- Render the connected itinerary timeline (custom SVG/React component)
- Render the dependency graph visualization (custom SVG with status propagation)
- Handle file upload for AI booking extraction
- Progressive disclosure of impact details and recommendation reasoning

### State Management Strategy
| State Type | Tool | Example |
|-----------|------|---------|
| UI/local state | Zustand | Active sidebar tab, modal visibility, selected disruption type |
| Server state | TanStack Query | Trip data, booking list, recovery plans, impact results |
| Form state | React Hook Form | Create Trip form, disruption input form |

---

## 3. Backend Architecture

### Technology
- **FastAPI** (Python 3.11+) — async web framework
- **Pydantic** v2 — request/response validation and serialization
- **SQLAlchemy** — ORM for PostgreSQL
- **Python standard library** + networkx-style graph logic

### Service Modules

#### Trip Service
- CRUD operations for trips
- Trip lifecycle management (Draft → Active → Disrupted → Recovered → Stable)
- Trip Health computation and caching

#### Booking Service
- CRUD operations for bookings within a trip
- Chronological sequencing and dependency edge inference
- Booking status management (Safe → At Risk → Critical → Disrupted → Recovered)

#### Disruption Service
- Accept disruption reports (type, affected booking, delay, description)
- Persist disruption records
- Trigger impact analysis pipeline

#### Dependency Graph Engine
- Build adjacency-list graph from trip bookings and dependency edges
- Topological-order traversal for impact propagation
- Time-slack computation: `slack = downstream_start - upstream_effective_end - min_buffer`
- Severity classification: Safe (slack ≥ threshold), At Risk (0 ≤ slack < threshold), Critical (slack < 0)
- Produces structured `ImpactResult` per affected booking

#### Recovery Engine
- Query mock availability adapters for alternative bookings per affected node
- Assemble candidate recovery plans from alternative combinations
- Apply user constraint filters (budget ceiling, hotel preservation, activity protection)
- Score plans on 4 normalized dimensions: Cost, Time, Preservation, Convenience
- Surface 3 plans: Best Overall (weighted composite), Cheapest, Fastest

#### Trip Health Engine
- Compute composite Trip Health score from booking statuses, connection risk levels, recovery state
- Transparent, deterministic formula (not ML)
- Status thresholds: Healthy (≥ 85%), At Risk (50–84%), Critical (< 50%)

#### AI Integration Service
- Handles communication with LLM API
- Booking extraction: PDF/image → structured JSON via prompted extraction
- Impact explanation: structured impact data → plain-language text
- Recommendation rationale: plan attributes → concise explanation sentence
- All AI outputs are validated against Pydantic schemas before use

---

## 4. Intelligence Architecture

### What AI Handles
| Task | Input | Output |
|------|-------|--------|
| Booking Extraction | PDF/image of confirmation | Structured booking JSON (type, origin, destination, times, status) |
| Disruption Interpretation | Unstructured disruption message | Structured disruption data (type, delay, severity hint) |
| Impact Explanation | Structured ImpactResult set | Plain-language explanation per affected booking |
| Recommendation Rationale | Recovery plan attributes | 1-2 sentence explainable recommendation |

### What Deterministic Logic Handles
| Task | Engine |
|------|--------|
| Time calculations | Backend utility |
| Dependency graph construction | Dependency Graph Engine |
| Impact propagation | Dependency Graph Engine (topological traversal) |
| Connection feasibility | Dependency Graph Engine (slack computation) |
| Constraint validation | Recovery Engine |
| Cost/refund calculations | Recovery Engine |
| Scoring and ranking | Recovery Engine (normalized weighted scoring) |
| Trip Health computation | Trip Health Engine |
| Booking state transitions | Booking Service |
| Recovery application | Recovery Engine + Booking Service |

### Critical Design Principle
AI-generated recovery candidates **must pass deterministic validation** before being presented as feasible options. The AI generates candidates; the backend validates, scores, and ranks them.

---

## 5. Database Architecture

### Technology
- **PostgreSQL** — relational, ACID-compliant
- **SQLAlchemy** ORM for Python backend
- Managed instance (Supabase/Neon/Railway) for deployment

### Core Schema
See `DATA_ARCHITECTURE.md` for full entity definitions and relationships.

Key entities: User, Trip, Booking, Dependency, Disruption, ImpactResult, RecoveryPlan, RecoveryPlanChange, Preferences

---

## 6. External Services

| Service | MVP (Hackathon) | Production |
|---------|----------------|------------|
| Flight availability | Mock adapter with pre-seeded data | Live flight API (Amadeus, Duffel) |
| Train availability | Mock adapter | IRCTC / rail APIs |
| Hotel availability | Mock adapter | Hotel API (Booking.com, Expedia) |
| Activity availability | Mock adapter | Activity provider APIs |
| Pricing/fare data | Mock adapter | Live fare APIs |
| Weather data | Not included | Weather API for proactive risk |
| LLM API | Claude/GPT via API | Production LLM with rate limits |
| File storage | Local filesystem or S3 mock | S3-compatible object storage |

All external adapters implement a **stable interface** — swapping mock for real requires no changes to the core graph or recovery engines.

---

## 7. Deployment Architecture

### Hackathon
```
Frontend:  Vercel (Next.js)
Backend:   Render / Railway (FastAPI in Docker container)
Database:  Managed PostgreSQL (Supabase / Neon / Railway)
Storage:   Local or S3-compatible bucket
CI/CD:     GitHub Actions (lint, typecheck, test, auto-deploy)
```

### Production Evolution
- Edge-optimized frontend delivery
- Horizontally scalable backend containers
- Connection pooling for database
- CDN for static assets
- Observability stack (structured logging, metrics, traces)
- Feature flags for live API integration rollout

---

## 8. Security Architecture

| Concern | Implementation |
|---------|---------------|
| Transport | HTTPS/TLS everywhere |
| Authentication | JWT-based session auth |
| Authorization | Per-request trip ownership verification |
| Data at rest | PII encrypted in database |
| File uploads | Size limits, type validation, virus scanning (production) |
| AI data handling | Strip unnecessary PII before LLM calls; don't persist LLM I/O beyond review step |
| Rate limiting | On file upload, disruption analysis, recovery generation endpoints |
| Input validation | Pydantic schemas on all API inputs |
| Recovery application | Idempotent endpoint, explicit confirmation required, audit trail |

---

## 9. Error Handling Strategy

| Scenario | Handling |
|----------|---------|
| AI extraction fails | Show error, offer manual booking entry fallback |
| AI extraction inaccurate | Always show extracted fields for user review/edit before saving |
| LLM unavailable | Impact analysis still works (deterministic); recommendation text falls back to template |
| Recovery plan generation timeout | Show progress indicator; offer partial results or retry |
| Database connection failure | Graceful error page; structured log for debugging |
| Invalid disruption input | Pydantic validation with clear error messages |
| Duplicate recovery application | Idempotent endpoint returns existing result |
| All user-facing errors | Non-technical language; actionable suggestions |
