# TripRescue — AI Pipeline

## Overview

TripRescue uses AI (LLM) for **specific, bounded tasks** where AI excels: unstructured-to-structured conversion and natural-language generation. All critical business logic — time calculations, dependency traversal, feasibility checks, scoring, ranking — is handled by **deterministic backend engines**.

---

## AI vs. Deterministic Responsibility Map

```
┌─────────────────────────────────────────────────────────────┐
│                        AI (LLM)                             │
│                                                             │
│  ✦ Document Extraction (PDF/image → structured booking)     │
│  ✦ Disruption Interpretation (text → structured event)      │
│  ✦ Impact Explanation (structured data → plain language)    │
│  ✦ Recommendation Rationale (plan attributes → text)        │
│  ✦ Recovery Candidate Suggestion (optional, validated)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  DETERMINISTIC LOGIC                        │
│                                                             │
│  ✦ Time/date normalization and calculations                 │
│  ✦ Dependency graph construction                            │
│  ✦ Topological traversal and impact propagation             │
│  ✦ Time-slack computation                                   │
│  ✦ Severity classification (Safe/At Risk/Critical)          │
│  ✦ Minimum connection time enforcement                      │
│  ✦ Constraint validation (budget, preferences)              │
│  ✦ Cost calculations (refunds, charges, net cost)           │
│  ✦ Normalized scoring (cost, time, preservation, convenience)│
│  ✦ Weighted ranking                                         │
│  ✦ Trip Health computation                                  │
│  ✦ Booking state transitions                                │
│  ✦ Recovery feasibility verification                        │
│  ✦ Idempotent recovery application                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## AI Pipeline Stages

### Stage 1: Booking Extraction

**Trigger:** User uploads a booking confirmation (PDF, JPG, PNG)

**Input:**
- Raw file content (parsed PDF text or image)
- Structured-output prompt requesting specific JSON schema

**AI Processing:**
1. Parse document content
2. Extract booking fields: type, origin, destination, start_time, end_time, confirmation_number, provider, status
3. Return structured JSON conforming to Pydantic schema

**Output:** Structured booking data with confidence indicators

**Deterministic Validation:**
- Pydantic schema validation on AI output
- Date/time format normalization
- Required field presence check
- **User review required** — extracted fields shown for editing before persistence

**Key Principle:** AI extraction is NEVER auto-persisted. The user must review and confirm.

---

### Stage 2: Disruption Interpretation (Optional)

**Trigger:** User provides unstructured disruption description

**Input:**
- Free-text disruption message (e.g., "Airline says flight is delayed by 5 hours, may get worse")
- Context: affected booking details

**AI Processing:**
1. Classify disruption type (delay, cancellation, weather, etc.)
2. Extract delay duration if mentioned
3. Assess severity hint from language

**Output:** Structured disruption parameters

**Deterministic Validation:**
- Validate extracted parameters against booking data
- User confirms or corrects before analysis proceeds

---

### Stage 3: Impact Explanation Generation

**Trigger:** After deterministic impact analysis completes

**Input:**
- Structured ImpactResult array (booking_id, severity, slack_minutes, reason_code)
- Trip context (name, route, booking details)

**AI Processing:**
1. Convert each structured impact result into a plain-language explanation
2. Generate headline summary
3. Ensure explanations reference specific times and booking names

**Output:**
```
Headline: "Your trip is at risk"
Summary: "A 5-hour flight delay creates multiple downstream impacts."
Per-booking explanations:
  - "Your airport transfer at 12:30 PM will be missed..."
  - "Your train departs before the delayed flight arrives..."
```

**Deterministic Validation:**
- Verify explanation references match actual booking data
- Truncate overly long explanations
- Fall back to template-based explanations if LLM is unavailable

---

### Stage 4: Recovery Candidate Suggestion (Optional)

**Trigger:** During recovery plan generation

**Input:**
- Affected bookings and their constraints
- Available time windows
- User preferences

**AI Processing:**
1. Suggest creative recovery approaches (e.g., "consider combining transfer and train into a direct bus")
2. Propose alternative routing

**Output:** Candidate suggestions for deterministic validation

**Deterministic Validation (CRITICAL):**
- Every AI-suggested candidate is validated for:
  - Temporal feasibility (no negative slack)
  - Budget compliance
  - Preference alignment
  - Connection time minimums
- AI suggestions that fail validation are **discarded**
- The deterministic engine is the final arbiter of feasibility

---

### Stage 5: Recommendation Rationale Generation

**Trigger:** After deterministic scoring and ranking

**Input:**
- Recommended plan attributes (cost, time, preservation %, changes, preferences satisfied)
- Alternative plan attributes for comparison

**AI Processing:**
1. Generate 1-2 sentence recommendation explanation
2. Reference specific trade-offs ("₹1,200 more than cheapest but saves 2.3 hours")
3. Mention specific preserved items (hotel, activity)

**Output:**
```
"Best Overall is recommended because it preserves your hotel and
important Rohtang activity while keeping additional cost moderate
at ₹2,100."
```

**Key Principle:** The recommendation is based on deterministic scoring. The AI only explains the reasoning — it does not change the recommendation.

---

## Communication Flow: AI ↔ Backend

```
Frontend → API Layer → Service Router
                          │
                          ├── Booking Upload ──→ AI Extraction Service
                          │                          │
                          │                     LLM API Call
                          │                          │
                          │                     Pydantic Validation
                          │                          │
                          │                     Return to Frontend
                          │                     (User reviews/edits)
                          │
                          ├── Disruption Report ──→ Disruption Service
                          │                              │
                          │                     Dependency Graph Engine
                          │                     (DETERMINISTIC)
                          │                              │
                          │                     Impact Results
                          │                              │
                          │                     AI Explanation Service
                          │                     (plain language)
                          │                              │
                          │                     Return to Frontend
                          │
                          ├── Recovery Request ──→ Recovery Engine
                          │                          (DETERMINISTIC)
                          │                              │
                          │                     Candidate Generation
                          │                     Constraint Validation
                          │                     Scoring & Ranking
                          │                              │
                          │                     AI Rationale Service
                          │                     (explain recommendation)
                          │                              │
                          │                     Return to Frontend
                          │
                          └── Apply Recovery ──→ Recovery Applier
                                                 (DETERMINISTIC)
                                                      │
                                                 Update Bookings
                                                 Recompute Health
                                                 Return to Frontend
```

---

## LLM Configuration

### Model Selection
- **Primary:** Claude API (structured output, good at following schemas)
- **Fallback:** GPT-4 API
- **MVP:** Single LLM provider, no complex routing

### Prompt Engineering
- **Booking extraction:** Strict JSON schema with field descriptions and examples
- **Explanations:** Template-guided with trip context injection
- **Rationale:** Comparison-focused with specific attribute references

### Error Handling
| Scenario | Handling |
|----------|---------|
| LLM timeout | Retry once, then fall back to template |
| Invalid JSON output | Pydantic validation catches → retry with tighter prompt |
| LLM unavailable | Booking extraction: offer manual entry only. Explanations: use template-based text. Rationale: display attributes without narrative. |
| Hallucinated data | Pydantic schema validation + user review catches inaccuracies |

### Data Privacy
- Strip unnecessary PII before LLM calls
- Don't persist raw LLM inputs/outputs beyond the review step
- Use signed, time-limited URLs for file access (don't send raw file data when avoidable)

---

## Trip Health — Deterministic Calculation

### Inputs
- Number of bookings in trip
- Status of each booking (Safe, At Risk, Critical, Disrupted, Recovered)
- Number of dependencies with positive slack
- Recovery feasibility (are recovery options available?)

### Formula (MVP — transparent, explainable)
```
booking_scores = {
  SAFE: 1.0,
  RECOVERED: 0.95,
  AT_RISK: 0.5,
  CRITICAL: 0.1,
  DISRUPTED: 0.1,
  CANCELLED: 0.0
}

trip_health = (sum of booking_scores / number of bookings) × 100
```

### Status Thresholds
| Trip Health | Status | Visual |
|------------|--------|--------|
| ≥ 85% | Healthy / Stable | 🟢 |
| 50% – 84% | At Risk | 🟡 |
| < 50% | Critical | 🔴 |

### Before/After Example
- **Before disruption:** 6 bookings × 1.0 = 6.0 / 6 = 100% → but with 1 At Risk connection = 92%
- **After disruption:** Flight Disrupted (0.1) + Transfer Critical (0.1) + Hotel At Risk (0.5) + Train Critical (0.1) + Transfer Critical (0.1) + Activity At Risk (0.5) = 1.4 / 6 = 23% → Critical
- **After recovery:** Flight Recovered (0.95) + Transfer New (1.0) + Hotel Safe (1.0) + Train New (1.0) + Transfer Updated (1.0) + Activity Safe (1.0) = 5.95 / 6 = 98% → Healthy

---

## Recovery Ranking — Deterministic Scoring

### Dimensions (0–1 normalized)

| Dimension | Formula | Weight |
|-----------|---------|--------|
| Cost Score | `1 - (plan_cost / max_plan_cost)` | 0.30 |
| Time Score | `1 - (plan_time / max_plan_time)` | 0.25 |
| Preservation Score | `preserved_pct / 100` | 0.25 |
| Convenience Score | Composite of changes count + preference alignment | 0.20 |

### Weighted Composite
```
overall_score = (0.30 × cost) + (0.25 × time) + (0.25 × preservation) + (0.20 × convenience)
```

### Plan Labels
- **Best Overall:** Highest weighted composite score
- **Cheapest:** Lowest `additional_cost` among feasible plans
- **Fastest:** Lowest `time_impact_minutes` among feasible plans

### Why the Recommended Plan Wins (Demo Example)
> Best Overall (₹2,100, +1.2h, 92% preserved) wins because:
> - It costs ₹1,200 more than Cheapest but saves 2.3 hours
> - It costs ₹2,400 less than Fastest with only 1.2 additional hours
> - It preserves the hotel and important activity (both user preferences)
> - It requires only 2 booking changes vs. 3 for Cheapest

This explanation is **traceable to specific, auditable attributes** — not an opaque AI score.
