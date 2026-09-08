# TripRescue — MVP vs. Production

## Hackathon MVP

### Goal
Convincingly demonstrate the complete TripRescue loop: Trip → Disruption → Ripple → Recovery → Compare → Apply → Restored.

### What is Built

| Feature | Implementation | Demo Behavior |
|---------|---------------|---------------|
| **Trip Creation** | Full form with preferences and budget | User creates "Manali Adventure" |
| **Booking Ingestion** | Manual entry + AI extraction from uploaded PDF/image | Add 6 bookings to build connected itinerary |
| **Connected Itinerary** | Chronological timeline with dependency indicators | Visual dependency chain shown on Dashboard |
| **Dependency Graph** | Adjacency-list graph built from booking sequence | Edges inferred automatically when bookings are added |
| **Trip Health** | Deterministic score computation | 92% before, 98% after recovery |
| **Disruption Simulation** | User-triggered via Disruption Center | Select "Flight delayed," enter 5 hours |
| **Impact Analysis** | Full graph traversal with slack computation | Ripple visualization across 5 affected bookings |
| **Impact Explanation** | LLM-generated plain-language text | "Your train departs before the delayed flight arrives" |
| **Recovery Generation** | 3 ranked plans from mock availability data | Best Overall, Cheapest, Fastest with demo values |
| **Constraint Validation** | Budget + preference checks | Plans filtered and scored against user prefs |
| **Recovery Ranking** | Weighted composite scoring on 4 dimensions | Explainable "why this plan wins" |
| **Plan Comparison** | Side-by-side table with score bars | Compare cost, time, preservation, convenience |
| **Recovery Application** | Before/after view, cost breakdown, confirmation | 2 bookings changed, 4 preserved, ₹2,100 net |
| **Updated Trip** | Trip Health transformation, recovered timeline | 92% → 98%, "Trip Stable" |
| **My Trips** | Trip listing with filters | View and manage trips |
| **Settings** | Recovery preferences, notifications, AI prefs | Configure defaults |

### What is Mocked

| Component | Mock Approach |
|-----------|--------------|
| Flight availability | Pre-seeded alternative flight data in database |
| Train availability | Pre-seeded alternative train schedules |
| Hotel availability | Static mock returning "available" for demo hotel |
| Activity availability | Static mock returning existing activity |
| Pricing/fares | Hardcoded demo prices (clearly labeled) |
| Real booking modifications | Simulated — no actual external API calls |
| Payment processing | Not implemented — cost shown for comparison only |
| Authentication | Simplified (single user, basic JWT or session) |
| Real-time carrier feeds | Not implemented — disruption is user-triggered |
| Weather data | Not included |

### What is NOT Built for MVP

- Real-time push notifications
- Multi-user/group trips
- Multi-currency support
- Native mobile apps
- Live carrier API integration
- Payment/refund processing
- Advanced security (MFA, audit logs)
- Observability/monitoring stack
- Load testing / horizontal scaling
- Automated disruption detection
- Weather-based proactive risk prediction

---

## Production Evolution

### Phase 1: Core Platform (Post-Hackathon, 1-3 months)

| Feature | Description |
|---------|-------------|
| **Authentication & Authorization** | Full JWT auth with NextAuth.js, email/social login, MFA |
| **Real Carrier API Integration** | Flight status APIs (Amadeus, Duffel, FlightAware) |
| **Real Train API Integration** | IRCTC / rail APIs for Indian railways |
| **Real Hotel API Integration** | Booking.com, Expedia, or similar hotel availability |
| **Real Pricing Data** | Live fare lookup for recovery candidates |
| **User Accounts** | Registration, profiles, trip history persistence |
| **Improved AI Extraction** | Higher accuracy with confidence scoring, multi-language support |
| **Error Recovery** | Robust retry logic, circuit breakers for external APIs |
| **Observability** | Structured logging, metrics, distributed tracing |

### Phase 2: Intelligence Enhancement (3-6 months)

| Feature | Description |
|---------|-------------|
| **Proactive Risk Prediction** | Weather API integration, historical delay analysis |
| **Real-Time Disruption Detection** | Monitor carrier feeds for automatic disruption alerts |
| **Advanced Recovery Search** | Broader candidate search across more providers |
| **Learning from User Choices** | Adapt scoring weights based on which plans users actually choose |
| **Cost Optimization** | Factor in change fees, cancellation policies, loyalty benefits |
| **Push Notifications** | Real-time alerts for disruptions and connection risks |
| **Email/SMS Recovery Summaries** | Send recovery details to travelers |

### Phase 3: Platform Scale (6-12 months)

| Feature | Description |
|---------|-------------|
| **Multi-Traveler/Group Trips** | Shared trip management, group recovery decisions |
| **Native Mobile Apps** | iOS and Android with offline capability |
| **Multi-Currency Support** | International pricing with currency conversion |
| **Payment Processing** | In-app rebooking with payment integration |
| **Insurance Partnerships** | Travel insurance integration for disruption coverage |
| **Loyalty Program Integration** | Factor in airline/hotel loyalty status |
| **Enterprise/TMC Integration** | Corporate travel management company partnerships |
| **International Regulations** | EU261, Montreal Convention, regional refund rules |

### Phase 4: Advanced Intelligence (12+ months)

| Feature | Description |
|---------|-------------|
| **Predictive Trip Health** | ML model predicting disruption probability before trip starts |
| **Dynamic Repricing** | Real-time fare optimization for recovery bookings |
| **Travel Pattern Learning** | Personalized preferences based on travel history |
| **Multi-Modal Transport** | Integrate ride-share, ferry, charter services |
| **Partner Ecosystem** | API for travel agencies, OTAs, and TMCs |
| **Global Coverage** | International flight/rail/hotel networks |

---

## Technical Evolution

### Infrastructure

| Aspect | MVP | Production |
|--------|-----|------------|
| Frontend hosting | Vercel (free tier) | Vercel Pro with custom domain |
| Backend hosting | Single Docker container (Render/Railway) | Horizontally scaled containers (Kubernetes/ECS) |
| Database | Managed PostgreSQL (free tier) | Production PostgreSQL with read replicas |
| Object storage | Local filesystem / minimal S3 | Full S3 with lifecycle policies |
| CDN | Vercel default | CloudFront/Cloudflare for static assets |
| CI/CD | GitHub Actions (basic) | Full CI/CD with staging, canary deployments |
| Monitoring | Console logs | DataDog/New Relic/Grafana stack |
| Secrets | Environment variables | Secrets manager (AWS/GCP/Vault) |

### Security

| Aspect | MVP | Production |
|--------|-----|------------|
| Authentication | Basic JWT | Full auth with MFA, session management |
| Authorization | Trip ownership check | RBAC with role-based permissions |
| Data encryption | HTTPS only | At-rest encryption + HTTPS |
| Rate limiting | Basic | Advanced with per-user quotas |
| Input validation | Pydantic schemas | Pydantic + WAF + input sanitization |
| Audit trail | Not implemented | Full audit log of all recovery actions |
| PII handling | Basic | GDPR/CCPA compliant data handling |
| Vulnerability scanning | Not implemented | Automated dependency scanning, SAST |

### Performance

| Aspect | MVP | Production |
|--------|-----|------------|
| Impact analysis | Synchronous (<5s for 15 bookings) | Async with WebSocket progress updates |
| Recovery generation | Synchronous (<5s) | Background job with real-time updates |
| Caching | TanStack Query only | Redis cache for hot data + TanStack Query |
| Database queries | Direct ORM queries | Optimized queries with connection pooling |
| API response time | <500ms for reads | <200ms for reads, SLA targets |
