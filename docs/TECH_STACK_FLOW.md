# TripRescue — Tech Stack & Flow

## Frontend Layer

### Next.js (App Router)
- **Responsibility:** Application framework — routing, server-side rendering, API routes
- **Input:** User navigation, URL parameters
- **Processing:** Page routing, SSR/ISR for initial page loads, API route proxying
- **Output:** Rendered React pages with hydrated data
- **Why:** Industry-standard React framework with built-in routing, SSR, and deployment optimization
- **Scope:** MVP + Production

### React + TypeScript
- **Responsibility:** Component model and type safety
- **Input:** Props, state, server data
- **Processing:** Reactive UI rendering, component lifecycle, event handling
- **Output:** Interactive DOM with typed component interfaces
- **Why:** TypeScript catches errors at compile time; React's component model enables reusable UI primitives
- **Scope:** MVP + Production

### Tailwind CSS
- **Responsibility:** Utility-first styling system
- **Input:** Design tokens, semantic classes
- **Processing:** JIT compilation of utility classes
- **Output:** Optimized CSS bundle; consistent spacing, typography, colors
- **Why:** Rapid development with consistent design tokens; small production bundle
- **Scope:** MVP + Production

### shadcn/ui
- **Responsibility:** Pre-built accessible component primitives (Button, Card, Dialog, Badge, etc.)
- **Input:** Props for each component
- **Processing:** Renders accessible, styled components built on Radix UI
- **Output:** Production-quality UI components with consistent behavior
- **Why:** Accessible by default, fully customizable, owns the code (not a dependency)
- **Scope:** MVP + Production

### Lucide React
- **Responsibility:** Icon system
- **Input:** Icon name, size, color props
- **Processing:** Renders optimized SVG icons
- **Output:** Consistent iconography across all screens
- **Why:** Clean, comprehensive icon set designed for modern UIs; pairs well with shadcn/ui
- **Scope:** MVP + Production

### Zustand
- **Responsibility:** Client-side state management
- **Input:** State updates from user interactions
- **Processing:** Lightweight reactive store
- **Output:** Shared UI state (active trip, sidebar state, modal state, selected plan)
- **Why:** Minimal boilerplate compared to Redux; small bundle size; perfect for hackathon speed
- **Scope:** MVP + Production

### TanStack Query (React Query)
- **Responsibility:** Server state management, caching, background refetching
- **Input:** API endpoint definitions, query keys
- **Processing:** Fetch, cache, refetch, invalidate server data
- **Output:** Cached server state with loading/error/success states
- **Why:** Eliminates manual loading state management; automatic cache invalidation on mutations
- **Scope:** MVP + Production

### Recharts
- **Responsibility:** Data visualization — Trip Health gauge, cost comparison bars, score indicators
- **Input:** Structured data arrays
- **Processing:** Renders SVG-based charts
- **Output:** Interactive, responsive charts
- **Why:** React-native chart library; simple API; sufficient for dashboard-level visualizations
- **Scope:** MVP + Production

---

## Backend Layer

### FastAPI (Python 3.11+)
- **Responsibility:** REST API server — request handling, routing, orchestration of services
- **Input:** HTTP requests from frontend (JSON payloads, file uploads)
- **Processing:** Request validation, service orchestration, response serialization
- **Output:** JSON API responses with proper status codes
- **Why:** High-performance async Python framework; automatic OpenAPI docs; excellent Pydantic integration
- **Scope:** MVP + Production

### Python
- **Responsibility:** Backend runtime — business logic, graph algorithms, integration glue
- **Input:** Validated request data
- **Processing:** Dependency graph traversal, recovery plan generation, scoring, Trip Health computation
- **Output:** Structured results passed to API response layer
- **Why:** Rich ecosystem for graph algorithms, data processing, AI/LLM integration; rapid prototyping
- **Scope:** MVP + Production

### Pydantic v2
- **Responsibility:** Data validation and serialization
- **Input:** Raw request payloads, AI extraction outputs, database records
- **Processing:** Type validation, coercion, schema enforcement
- **Output:** Validated, typed Python objects
- **Why:** Strict schema validation prevents bad data from entering the pipeline; integrates natively with FastAPI
- **Scope:** MVP + Production

---

## AI Layer

### LLM API (Claude / GPT)
- **Responsibility:** Document extraction, natural-language explanation generation
- **Input:**
  - Booking extraction: PDF/image content + structured-output prompt
  - Explanation: Structured impact/recovery data + prompt template
- **Processing:** LLM inference with structured output parsing
- **Output:**
  - Booking extraction: JSON conforming to Pydantic booking schema
  - Explanations: Plain-language text (1-2 sentences)
- **Why:** LLMs excel at unstructured-to-structured conversion and natural-language generation — tasks that are impractical to hardcode
- **Scope:** MVP + Production

### Key Principle
The LLM **does not** decide severity, feasibility, or ranking. It:
1. Extracts structured data from documents
2. Translates structured results into human-readable text
3. Generates recovery candidates that are then validated deterministically

---

## Database / Storage Layer

### PostgreSQL
- **Responsibility:** Primary data store — trips, bookings, dependencies, disruptions, impact results, recovery plans, user preferences
- **Input:** ORM queries from backend services
- **Processing:** ACID transactions, relational queries, constraint enforcement
- **Output:** Consistent, durable data
- **Why:** Battle-tested relational database; rich query capabilities; excellent tooling ecosystem
- **Scope:** MVP (managed instance on Supabase/Neon/Railway) + Production (scaled managed instance)

### SQLAlchemy
- **Responsibility:** Python ORM for database access
- **Input:** Python model definitions, query builder calls
- **Processing:** SQL generation, connection pooling, transaction management
- **Output:** Mapped Python objects from database rows
- **Why:** Mature Python ORM with excellent async support for FastAPI
- **Scope:** MVP + Production

### S3-Compatible Object Storage
- **Responsibility:** Store uploaded booking confirmations (PDF, JPG, PNG)
- **Input:** File uploads from frontend
- **Processing:** Store with access controls; generate signed URLs for preview
- **Output:** Signed, time-limited URLs for client access
- **Why:** Secure file storage with access control; decouples file handling from API server
- **Scope:** MVP (local filesystem or minimal S3) + Production (full S3-compatible)

---

## Deployment Layer

### Vercel
- **Responsibility:** Frontend hosting and edge delivery
- **Input:** Next.js build output
- **Processing:** Edge caching, serverless function execution, CDN distribution
- **Output:** Globally distributed, fast-loading frontend
- **Why:** Zero-config Next.js deployment; automatic preview deployments; generous free tier
- **Scope:** MVP + Production

### Docker + Render/Railway
- **Responsibility:** Backend containerization and hosting
- **Input:** Dockerfile with FastAPI application
- **Processing:** Container orchestration, health checks, auto-restart
- **Output:** Running backend service with public URL
- **Why:** Simple container deployment; managed infrastructure; good free/hobby tiers for hackathon
- **Scope:** MVP (single container) + Production (horizontally scaled)

### GitHub Actions
- **Responsibility:** CI/CD pipeline
- **Input:** Git push / PR events
- **Processing:** Lint, typecheck, test, build, deploy
- **Output:** Automated quality gates and deployment
- **Why:** Native GitHub integration; free for public repos
- **Scope:** MVP + Production
