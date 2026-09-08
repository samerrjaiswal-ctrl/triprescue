# TripRescue — Frontend Component Architecture

## Overview

All 12 screens are built from a shared, reusable component library. Changing one component keeps the entire application consistent. Components are organized into layout, data display, visualization, interaction, and feedback categories.

---

## Layout Components

### AppShell
- **Responsibility:** Global application shell with sidebar navigation and header
- **Props:** `children`, `currentPage`, `user`
- **State:** Sidebar collapsed/expanded
- **Reuse:** Wraps every authenticated screen (Screens 04–12)
- **Data Source:** User session, navigation state (Zustand)
- **Related:** Sidebar, Header

### Sidebar
- **Responsibility:** Primary navigation — Dashboard, My Trips, Alerts, Settings
- **Props:** `currentPage`, `collapsed`, `onToggle`
- **State:** Active navigation item, collapse state
- **Reuse:** Inside AppShell on every authenticated screen
- **Data Source:** Route state
- **Related:** AppShell, Header

### Header
- **Responsibility:** Top bar with trip name, dates, traveler count, status, and settings access
- **Props:** `tripName`, `tripDates`, `travelerCount`, `tripStatus`, `onSettings`
- **State:** None (presentational)
- **Reuse:** Trip Dashboard, Impact Analysis, Recovery Plans, Updated Trip
- **Data Source:** Trip data (TanStack Query)
- **Related:** AppShell

---

## Data Display Components

### BookingCard
- **Responsibility:** Display a single booking with type icon, timing, location, status, and actions
- **Props:** `booking`, `showDependency`, `showActions`, `variant` (compact/expanded)
- **State:** Expanded/collapsed detail view
- **Reuse:** Add Bookings list, Trip Dashboard timeline, Impact Analysis graph, Recovery Plan changes
- **Data Source:** Booking object from API
- **Related:** StatusBadge, RiskIndicator, ItineraryNode

### StatusBadge
- **Responsibility:** Consistent status label with semantic color, icon, and text
- **Props:** `status` (Safe/At Risk/Critical/Disrupted/Recovered/Cancelled/Pending)
- **State:** None (presentational)
- **Reuse:** Every screen that displays booking or trip status
- **Data Source:** Status enum from booking/trip data
- **Related:** BookingCard, TripTimeline, ImpactNode

### RiskIndicator
- **Responsibility:** Visual risk level indicator (dot, bar, or ring with color)
- **Props:** `level` (safe/at_risk/critical), `showLabel`, `size`
- **State:** None (presentational)
- **Reuse:** Trip Dashboard connections panel, Impact Summary, BookingCard
- **Data Source:** Severity from impact results
- **Related:** StatusBadge, TripHealth

### ImpactSummary
- **Responsibility:** Right-panel summary on Impact Analysis — critical/at-risk/safe counts, cost range, time impact, affected bookings fraction
- **Props:** `summary` (counts, cost range, time range, affected/total)
- **State:** Expanded "Why affected?" section
- **Reuse:** Impact Analysis screen (Screen 06)
- **Data Source:** Impact analysis API response
- **Related:** RiskIndicator, StatusBadge

### RecoveryPlanCard
- **Responsibility:** Display a recovery plan with badge, cost, time, preservation %, changes, convenience, preserved items, and CTA
- **Props:** `plan`, `isRecommended`, `onViewPlan`, `onSelectPlan`
- **State:** None (presentational with action callbacks)
- **Reuse:** Recovery Plans screen (Screen 07), Plan Comparison (Screen 08)
- **Data Source:** Recovery plan API response
- **Related:** StatusBadge, PlanComparison

---

## Visualization Components

### TripTimeline
- **Responsibility:** Connected itinerary rendering — vertical timeline with dependency indicators, status colors, and connection lines
- **Props:** `bookings`, `dependencies`, `showStatus`, `highlightChanges`
- **State:** Scroll position, animation state
- **Reuse:** Trip Dashboard (Screen 04), Updated Trip (Screen 10), Before/After in Recovery Confirmation (Screen 09)
- **Data Source:** Trip bookings + dependencies from API
- **Related:** ItineraryNode, BookingCard, StatusBadge

### ItineraryNode
- **Responsibility:** A single node in the TripTimeline — type icon, booking details, time, connection line to next node
- **Props:** `booking`, `isFirst`, `isLast`, `connectionStatus`, `isChanged`
- **State:** Hover/selected state
- **Reuse:** Inside TripTimeline
- **Data Source:** Individual booking object
- **Related:** TripTimeline, BookingCard

### DependencyGraph
- **Responsibility:** Visual dependency graph showing disruption origin and ripple propagation across connected nodes
- **Props:** `nodes`, `edges`, `disruption`, `impactResults`
- **State:** Zoom level, pan position, animation state
- **Reuse:** Impact Analysis screen (Screen 06)
- **Data Source:** Graph nodes (bookings), edges (dependencies), impact results from API
- **Related:** ImpactNode, StatusBadge, RiskIndicator

### ImpactNode
- **Responsibility:** A single node within the DependencyGraph — type icon, booking label, status color, severity badge
- **Props:** `booking`, `severity`, `slackMinutes`, `reasonText`
- **State:** Hover/selected for tooltip
- **Reuse:** Inside DependencyGraph
- **Data Source:** ImpactResult for the specific booking
- **Related:** DependencyGraph, StatusBadge

### TripHealth
- **Responsibility:** Composite health score display — circular gauge or progress ring with percentage, status label, and optional before/after comparison
- **Props:** `score`, `status`, `previousScore`, `showComparison`
- **State:** Animation state for score transitions
- **Reuse:** Trip Dashboard (Screen 04), Updated Trip (Screen 10)
- **Data Source:** Trip Health API response
- **Related:** RiskIndicator

### PlanComparison
- **Responsibility:** Side-by-side comparison table across recovery plans with visual score bars
- **Props:** `plans`, `recommendedPlanId`, `onSelectPlan`
- **State:** Sort/highlight state
- **Reuse:** Plan Comparison screen (Screen 08)
- **Data Source:** Recovery plans comparison API response
- **Related:** RecoveryPlanCard, ComparisonTable

### ComparisonTable
- **Responsibility:** Structured comparison table with dimension rows, visual score bars per plan
- **Props:** `plans`, `dimensions` (cost, time, preservation, convenience, etc.)
- **State:** None (presentational)
- **Reuse:** Inside PlanComparison
- **Data Source:** Computed from plan attributes
- **Related:** PlanComparison

---

## Interaction Components

### DisruptionAlert
- **Responsibility:** Top-of-page alert bar when a disruption is active
- **Props:** `disruption`, `onViewImpact`, `onDismiss`
- **State:** Visible/dismissed
- **Reuse:** Trip Dashboard (when disruption is active)
- **Data Source:** Active disruption from API
- **Related:** DisruptionModal

### DisruptionModal
- **Responsibility:** Disruption type selection interface — card grid of disruption types, detail form for selected type
- **Props:** `bookings`, `onSubmitDisruption`
- **State:** Selected type, form values, live preview count
- **Reuse:** Disruption Center (Screen 05)
- **Data Source:** Trip bookings for selection
- **Related:** DisruptionAlert

### ConfirmationDialog
- **Responsibility:** Explicit confirmation modal before destructive or important actions (especially recovery application)
- **Props:** `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `variant` (info/warning/danger)
- **State:** Open/closed
- **Reuse:** Recovery Confirmation (Screen 09), any destructive action
- **Data Source:** Context-specific message
- **Related:** RecoveryPlanCard

### RecoveryConfirmation
- **Responsibility:** Before → After itinerary visualization with cost breakdown and change lists
- **Props:** `selectedPlan`, `beforeItinerary`, `afterItinerary`, `costBreakdown`, `onConfirm`, `onGoBack`
- **State:** Confirmation dialog visibility
- **Reuse:** Recovery Confirmation screen (Screen 09)
- **Data Source:** Selected recovery plan + current itinerary from API
- **Related:** TripTimeline, ConfirmationDialog

---

## Feedback Components

### LoadingState
- **Responsibility:** Consistent loading indicator for data-dependent screens
- **Props:** `message` (e.g., "Analyzing impact...", "Generating recovery plans...")
- **State:** Animation state
- **Reuse:** Every screen during data loading
- **Data Source:** TanStack Query loading states
- **Related:** EmptyState

### EmptyState
- **Responsibility:** Consistent empty state display when no data exists
- **Props:** `icon`, `title`, `message`, `actionLabel`, `onAction`
- **State:** None (presentational)
- **Reuse:** My Trips (no trips), Add Bookings (no bookings), Trip Dashboard (no disruptions)
- **Data Source:** Empty data arrays from API
- **Related:** LoadingState

---

## Component Hierarchy

```
AppShell
├── Sidebar
├── Header
└── Page Content
    ├── Trip Dashboard
    │   ├── TripTimeline
    │   │   └── ItineraryNode (×N)
    │   │       ├── BookingCard
    │   │       └── StatusBadge
    │   ├── TripHealth
    │   ├── RiskIndicator (×N)
    │   └── DisruptionAlert (conditional)
    │
    ├── Impact Analysis
    │   ├── DependencyGraph
    │   │   └── ImpactNode (×N)
    │   │       └── StatusBadge
    │   └── ImpactSummary
    │       └── RiskIndicator (×N)
    │
    ├── Recovery Plans
    │   └── RecoveryPlanCard (×3)
    │       └── StatusBadge
    │
    ├── Plan Comparison
    │   └── PlanComparison
    │       └── ComparisonTable
    │
    ├── Recovery Confirmation
    │   ├── RecoveryConfirmation
    │   │   ├── TripTimeline (before)
    │   │   └── TripTimeline (after)
    │   └── ConfirmationDialog
    │
    └── Updated Trip
        ├── TripHealth (with comparison)
        └── TripTimeline (recovered)
```
