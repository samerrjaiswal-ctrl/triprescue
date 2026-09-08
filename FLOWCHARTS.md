# TripRescue — Complete System Flowcharts

This document provides a clean, sequence-wise visual representation of all existing TripRescue architecture and workflow diagrams. The source of truth for these flowcharts is the system's Draw.io diagrams located in the `/diagrams` workspace directory.

---

## 1. System Architecture Flow

The System Architecture represents the end-to-end operational pipeline of TripRescue. User interactions flow from the Next.js frontend across a REST API into the FastAPI backend, where trip data, dependency graphs, and disruptions converge into the Impact Analysis engine. Supported asynchronously by PostgreSQL, LLM services, and external travel APIs, the recovery engine generates, ranks, and recommends actionable rescue plans for user approval.

```mermaid
flowchart TD
    User["User"] --> Frontend["Next.js Frontend"]
    Frontend --> API["API Layer (REST)"]
    API --> Backend["FastAPI Backend"]

    Backend --> SvcTrip["Trip & Booking Management"]
    Backend --> SvcGraph["Dependency Graph Engine"]
    Backend --> SvcDisrupt["Disruption Service"]

    SvcTrip --> Impact["Impact Analysis"]
    SvcGraph --> Impact
    SvcDisrupt --> Impact

    Impact --> Recovery["Recovery Engine"]
    Recovery --> Scoring["Scoring & Ranking"]
    Scoring --> Rec["Recommendation"]
    Rec --> Approval["User Approval & Apply Recovery"]
    Approval --> Stable(["Trip Health<br/>Trip Stable ✓"])

    subgraph SupportingServices["Supporting Services"]
        DB[("PostgreSQL")]
        AI["AI Services (LLM)"]
        ExtAPI["External APIs (mocked)"]
    end

    DB -.-> SvcTrip
    DB -.-> Impact
    AI -.-> Impact
    AI -.-> Recovery
    AI -.-> Rec
    ExtAPI -.-> Recovery
```

### Sequence
- **Step 1 — User Request Ingestion**: The user initiates actions via the Next.js Frontend, which dispatches requests through the REST API layer to the FastAPI backend.
- **Step 2 — Core Domain Processing**: The backend delegates workloads across three specialized micro-modules: Trip & Booking Management (persisted via PostgreSQL), Dependency Graph Engine (DAG construction), and Disruption Service.
- **Step 3 — Impact Analysis**: Data from all three services converges into Impact Analysis, augmented by PostgreSQL state queries and LLM-assisted context parsing to evaluate delay propagation and slack times.
- **Step 4 — Recovery Engine & Candidate Generation**: The Recovery Engine consults external travel APIs (mocked) and LLM candidate generation to generate feasible re-booking options that resolve itinerary conflicts.
- **Step 5 — Scoring, Ranking & Recommendation**: Deterministic scoring algorithms rank recovery options across cost, duration, and convenience, producing a prioritized recommendation with AI-generated plain-language rationale.
- **Step 6 — User Approval & State Stabilization**: The user reviews and approves the optimal recovery plan; the system commits modifications to the itinerary and recalculates Trip Health to achieve a stable state (`Trip Stable ✓`).

---

## 2. Tech Stack Flow

The Tech Stack Flow depicts the layered technology architecture powering TripRescue. The stack enforces strict separation of concerns, transitioning from a reactive TypeScript/Next.js frontend styled with Tailwind CSS and shadcn/ui down through a strongly-typed FastAPI/Pydantic backend to the Trip Intelligence engine, AI recovery services, and PostgreSQL persistence.

```mermaid
flowchart TD
    User["User"] --> Frontend["Next.js / React<br/>TypeScript"]
    Frontend --> UI["Tailwind CSS<br/>shadcn/ui"]
    UI --> API["REST API"]
    API --> Backend["FastAPI / Python<br/>Pydantic v2"]
    Backend --> Graph["Trip Intelligence<br/>(Graph Engine)"]
    Graph --> Recovery["Recovery Engine<br/>+ AI (LLM)"]
    Recovery --> DB[("PostgreSQL<br/>SQLAlchemy")]

    subgraph FrontendEcosystem["Frontend Supporting Libraries"]
        Frontend -.-> State["Zustand +<br/>TanStack Query"]
        Frontend -.-> Vis["Recharts<br/>Lucide Icons"]
    end

    subgraph ExternalAndInfra["Integrations & Infrastructure"]
        ExtAPIs["External APIs<br/>(mocked for MVP)"] -.-> Recovery
        Infra["Vercel + Docker<br/>GitHub Actions"]
    end
```

### Sequence
- **Step 1 — Client Layer**: The user interacts with Next.js / React / TypeScript web application, with client state managed by Zustand and TanStack Query, and data visualisations rendered via Recharts and Lucide Icons.
- **Step 2 — Design System & Interface Components**: User actions route through UI components built using Tailwind CSS and shadcn/ui primitives.
- **Step 3 — API Boundary**: Frontend requests are serialized into JSON payloads transmitted over REST API endpoints.
- **Step 4 — Backend Service Layer**: FastAPI parses and strictly validates incoming payloads using Pydantic v2 schemas in Python.
- **Step 5 — Graph Intelligence Execution**: The validated data feeds into the Trip Intelligence Graph Engine for topological sorting and slack time calculation.
- **Step 6 — Recovery & LLM Synthesis**: Candidate solutions are evaluated by the Recovery Engine combined with LLM prompting, pulling mock data from External APIs.
- **Step 7 — Persistence & Delivery**: Results are persisted in PostgreSQL via SQLAlchemy ORM, and the application lifecycle is managed via Docker containers, Vercel deployments, and GitHub Actions CI/CD.

---

## 3. Demo Input → Output Flow

The Demo Input → Output Flow traces the step-by-step hackathon journey from importing a complex travel itinerary to resolving a major flight delay. It demonstrates how a 5-hour flight delay ripples across downstream bookings, triggers automated impact analysis, evaluates candidate recovery plans, and restores the trip to 98% Trip Health.

```mermaid
flowchart TD
    D1(["INPUT<br/>Manali Adventure Trip"]) --> D2["Trip Data<br/>6 Bookings Loaded"]
    D2 --> D3["Connected Itinerary<br/>Dependency Graph Built"]
    D3 --> D4["✈️ Disruption<br/>Flight Delayed 5h"]
    D4 --> D5["Impact Analysis<br/>Propagate through Graph"]
    D5 --> D6["Dependency Ripple<br/>3 Critical · 2 At Risk"]
    D6 --> D7["Recovery Generation<br/>3 Plans Created"]
    D7 --> D8["Constraint Validation<br/>Budget + Preferences"]
    D8 --> D9["Recovery Ranking<br/>Score + Label Plans"]
    D9 --> D10["🏆 Recommended Plan<br/>Best Overall ₹2,100"]
    D10 --> D11["User Approval<br/>Before → After Review"]
    D11 --> D12["Recovery Applied<br/>2 Changed · 4 Preserved"]
    D12 --> D13["Updated Itinerary<br/>Trip Health: 98%"]
    D13 --> D14(["OUTPUT<br/>Trip Back on Track ✓"])
```

### Sequence
- **Step 1 — Input Initiation**: The demo starts with the "Manali Adventure Trip" itinerary.
- **Step 2 — Data Ingestion**: The system loads 6 diverse bookings (flights, cab transfers, hotel check-ins, adventure activities).
- **Step 3 — Graph Construction**: Bookings are assembled into a connected itinerary DAG with calculated time buffers and dependencies.
- **Step 4 — Disruption Injection**: A simulated disruption event occurs: the outbound flight experiences a 5-hour delay.
- **Step 5 — Impact Propagation**: The Impact Analysis engine traverses the dependency graph to evaluate negative slack across consecutive events.
- **Step 6 — Ripple Detection**: The system identifies 3 critically broken bookings and 2 at-risk downstream connections.
- **Step 7 — Candidate Generation**: The Recovery Engine synthesizes 3 distinct recovery plan strategies.
- **Step 8 — Constraint Validation**: Candidate plans are checked against user budget ceilings and personal travel preferences.
- **Step 9 — Ranking & Scoring**: Multi-factor scoring evaluates and labels the alternatives (e.g., Best Overall, Lowest Cost, Fastest).
- **Step 10 — Recommendation Selection**: The top plan is presented ("🏆 Recommended Plan: Best Overall ₹2,100").
- **Step 11 — User Review**: The traveler inspects the interactive side-by-side Before → After comparison.
- **Step 12 — Plan Application**: Upon user confirmation, changes are applied: 2 bookings updated and 4 non-conflicting bookings preserved.
- **Step 13 — Itinerary Update**: The itinerary graph refreshes, updating the Trip Health score to 98%.
- **Step 14 — Output Resolution**: The trip is successfully stabilized ("Trip Back on Track ✓").

---

## 4. User Flow

The User Flow maps the comprehensive journey of a traveler through all 12 interface screens of the TripRescue web application. It highlights the core interactive "Demo Loop" (Screens 04 through 10), which represents the primary problem-detection, impact-assessment, and automated-recovery experience.

```mermaid
flowchart TD
    U1["01 Landing Page"] --> U2["02 Create Trip"]
    U2 --> U3["03 Add Bookings"]

    subgraph DemoLoop["Demo Loop (Screens 04–10)"]
        U4["04 Trip Dashboard"] --> U5["05 Disruption Center"]
        U5 --> U6["06 Impact Analysis"]
        U6 --> U7["07 Recovery Plans"]
        U7 --> U8["08 Plan Comparison"]
        U8 --> U9["09 Recovery Confirm"]
        U9 --> U10["10 Updated Trip ✓"]
    end

    U3 --> U4
    U10 --> U11["11 My Trips"]
    U11 -.-> U12["12 Settings"]
```

### Sequence
- **Step 1 — Entry & Onboarding (Screen 01)**: The user accesses the Landing Page, discovering platform capabilities and call-to-actions.
- **Step 2 — Trip Creation (Screen 02)**: The user defines trip metadata (destination, start/end dates, recovery strategy, budget ceiling).
- **Step 3 — Booking Addition (Screen 03)**: Travel segments (flights, trains, hotels, activities) are added via form inputs or mock ticket upload.
- **Step 4 — Dashboard Monitoring (Screen 04)**: The user lands on the Trip Dashboard, viewing the chronological timeline, Trip Health score, and connected itinerary.
- **Step 5 — Disruption Simulation (Screen 05)**: In the Disruption Center, delay or cancellation events are triggered or received.
- **Step 6 — Impact Inspection (Screen 06)**: The user navigates to Impact Analysis to see the affected nodes, broken buffers, and cascade severities.
- **Step 7 — Plan Exploration (Screen 07)**: The system displays generated recovery options with cost, time delta, and preservation badges.
- **Step 8 — Comparison (Screen 08)**: The user evaluates plans side-by-side in Plan Comparison, reviewing trade-offs.
- **Step 9 — Confirmation (Screen 09)**: In Recovery Confirm, the user reviews a detailed diff of modifications before final execution.
- **Step 10 — Resolution (Screen 10)**: The Updated Trip screen displays the re-stabilized itinerary and restored Trip Health.
- **Step 11 — Portfolio & Configuration (Screens 11 & 12)**: The user can navigate back to My Trips for an overview of all active/past trips or manage preferences in Settings.

---

## 5. Data Architecture Flow

The Data Architecture represents the entity-relationship schema powering TripRescue. It maps how users, trips, bookings, and dependency constraints interact with disruptions, impact records, recovery plans, and granular plan changes, ensuring full referential integrity and auditability.

```mermaid
flowchart TD
    User["User<br/>─────────<br/>id (PK)<br/>name<br/>email<br/>home_city<br/>preferences_id (FK)"]
    Trip["Trip<br/>─────────<br/>id (PK)<br/>user_id (FK)<br/>name, destination<br/>start_date, end_date<br/>budget_ceiling<br/>recovery_strategy<br/>trip_health_score<br/>status"]
    Booking["Booking<br/>─────────<br/>id (PK)<br/>trip_id (FK)<br/>type (flight/train/...)<br/>origin, destination<br/>start_time, end_time<br/>status<br/>source (manual/ai)<br/>is_important<br/>sequence_index"]
    Dependency["Dependency<br/>─────────<br/>id (PK)<br/>trip_id (FK)<br/>from_booking_id (FK)<br/>to_booking_id (FK)<br/>min_buffer_minutes<br/>dependency_type"]
    Disruption["Disruption<br/>─────────<br/>id (PK)<br/>trip_id (FK)<br/>booking_id (FK)<br/>type (delay/cancel/...)<br/>delay_minutes<br/>severity<br/>status"]
    ImpactResult["ImpactResult<br/>─────────<br/>id (PK)<br/>disruption_id (FK)<br/>affected_booking_id (FK)<br/>severity<br/>slack_minutes<br/>reason_code<br/>reason_text"]
    RecoveryPlan["RecoveryPlan<br/>─────────<br/>id (PK)<br/>disruption_id (FK)<br/>label (best/cheap/fast)<br/>additional_cost<br/>time_impact_minutes<br/>itinerary_preserved_pct<br/>is_recommended<br/>rationale_text<br/>status"]
    RecoveryPlanChange["RecoveryPlanChange<br/>─────────<br/>id (PK)<br/>recovery_plan_id (FK)<br/>original_booking_id (FK)<br/>change_type<br/>new_start_time<br/>new_end_time<br/>new_cost<br/>refund_from_original"]
    Preferences["Preferences<br/>─────────<br/>id (PK)<br/>user_id (FK)<br/>avoid_changing_hotels<br/>protect_activities<br/>avoid_overnight<br/>minimize_changes<br/>notification_flags"]

    User -->|1:N| Trip
    Trip -->|1:N| Booking
    Booking -->|N:N| Dependency
    Trip -->|1:N| Disruption
    Disruption -->|1:N| ImpactResult
    Disruption -->|1:N| RecoveryPlan
    RecoveryPlan -->|1:N| RecoveryPlanChange
    User -.->|1:1| Preferences
    ImpactResult -.->|N:1| Booking
```

### Sequence
- **Step 1 — User & Preferences Setup**: A `User` record is created, linking via a 1:1 relationship to user-level travel constraints and policies in `Preferences`.
- **Step 2 — Trip Creation**: A `User` owns one or more `Trip` records (1:N) containing destination dates, budget ceiling, recovery strategy, and composite `trip_health_score`.
- **Step 3 — Booking Items**: Each `Trip` aggregates multiple `Booking` items (1:N) storing modality, origin, destination, timings, and importance flags.
- **Step 4 — Graph Dependencies**: Adjoining bookings are linked through `Dependency` records (N:N relationship between `from_booking_id` and `to_booking_id`), capturing required minimum transfer buffers and constraint types.
- **Step 5 — Disruption Logging**: When an unexpected change occurs, a `Disruption` record links to the specific parent `Trip` and initial trigger `Booking` (1:N).
- **Step 6 — Impact Quantification**: The engine records one or more `ImpactResult` rows per disruption (1:N), cross-referencing each affected downstream booking (N:1) with slack times and severity codes.
- **Step 7 — Plan & Delta Generation**: For each disruption, multiple `RecoveryPlan` records are generated (1:N). Each plan contains one or more atomic `RecoveryPlanChange` entries (1:N) tracking modifications, costs, and refunds.

---

## 6. AI Pipeline Flow

The AI Pipeline Flow defines the strict demarcation between non-deterministic AI capabilities and deterministic backend computation. Generative AI is deployed exclusively for unstructured text extraction and plain-language reasoning explanations, while graph traversals, slack time calculations, feasibility checking, and composite scoring remain 100% deterministic and mathematically reproducible.

```mermaid
flowchart TD
    A1(["Input<br/>(Documents / Disruption)"]) --> A2["Booking / Disruption<br/>Raw Data"]
    A2 --> A3["🤖 AI: Extraction & Understanding<br/>[AI]"]
    A3 --> A4["Structured Data<br/>(Pydantic validated)"]
    A4 --> A5["Dependency Analysis<br/>(Graph Traversal)<br/>[DET]"]
    A5 --> A6["Impact Analysis<br/>(Slack Computation)<br/>[DET]"]
    A6 --> A7["Recovery Candidate Generation<br/>[AI + DET]"]
    A7 --> A8["Constraint Validation<br/>(Budget, Preferences)<br/>[DET]"]
    A8 --> A9["Scoring & Ranking<br/>(Weighted Composite)<br/>[DET]"]
    A9 --> A10["Recommendation"]
    A10 --> A11["🤖 AI: Explanation<br/>(Plain Language)<br/>[AI]"]
    A11 --> A12(["Output<br/>Ranked Plans + Rationale"])

    subgraph Legend["Execution Model Legend"]
        L1["🟣 AI Stage — Probabilistic / LLM Inference"]
        L2["🟡 DET Stage — Deterministic Graph Algorithms & Business Logic"]
        L3["🟣+🟡 Hybrid Stage — AI Suggestions Filtered by Deterministic Rules"]
    end
```

### Sequence
- **Step 1 — Input Ingestion**: Unstructured travel documents, raw ticket text, or carrier disruption announcements enter the pipeline.
- **Step 2 — Raw Data Normalization**: Input text and files are packaged as raw input data payloads.
- **Step 3 — AI Extraction & Understanding `[AI]`**: An LLM processes raw unstructured text to identify entities (PNR, origin, destination, timestamps, transport types).
- **Step 4 — Schema Validation**: Extracted parameters are validated and coerced into typed Python schemas using Pydantic v2.
- **Step 5 — Dependency Analysis `[DET]`**: A deterministic graph algorithm builds the Directed Acyclic Graph (DAG) and executes topological sort to sequence itinerary connections.
- **Step 6 — Impact Analysis `[DET]`**: The deterministic engine computes slack minutes across connection buffers (`slack = arrival_time + buffer - next_departure_time`) to isolate broken nodes.
- **Step 7 — Recovery Candidate Generation `[AI + DET]`**: A hybrid phase queries available travel alternatives; AI proposes creative candidate shifts while deterministic rules ensure structural feasibility.
- **Step 8 — Constraint Validation `[DET]`**: Proposed plans undergo hard deterministic validation against budget limits, minimum connection buffers, and user travel preferences.
- **Step 9 — Scoring & Ranking `[DET]`**: A weighted mathematical composite scoring function calculates overall plan scores based on cost, time saved, and itinerary preservation percentage.
- **Step 10 — Top Recommendation Selection**: The highest-scoring candidate is chosen as the primary recommended recovery plan.
- **Step 11 — AI Explanation Synthesis `[AI]`**: An LLM translates the mathematical score trade-offs, changes, and cost deltas into clear, empathetic, human-readable rationale.
- **Step 12 — Output Generation**: The ranked recovery plans paired with clear contextual justifications are returned to the user interface.
