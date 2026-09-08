# TripRescue Backend API Server

FastAPI-powered intelligent disruption recovery engine for connected multi-modal travel itineraries.

## Getting Started

### 1. Create Virtual Environment & Install Dependencies
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Run the Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API Base**: `http://localhost:8000/api`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints Implemented

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/trips` | Create a new trip |
| `GET` | `/api/trips` | List all trips |
| `GET` | `/api/trips/{trip_id}` | Get full trip detail & dependencies |
| `GET` | `/api/trips/{trip_id}/health` | Recalculate Trip Health Score |
| `POST` | `/api/trips/{trip_id}/bookings` | Add booking manually |
| `POST` | `/api/trips/{trip_id}/bookings/extract` | AI ticket document extraction (PDF/Images) |
| `PATCH` | `/api/bookings/{booking_id}` | Update booking details |
| `POST` | `/api/trips/{trip_id}/disruptions` | Report or simulate travel disruption |
| `GET` | `/api/disruptions/{disruption_id}/impact` | Get dependency graph cascade & impact analysis |
| `GET` | `/api/disruptions/{disruption_id}/recovery-plans` | Retrieve ranked recovery plans (Cheapest, Best Overall, Fastest) |
| `GET` | `/api/recovery-plans/{plan_id}/compare` | Plan comparison matrix |
| `POST` | `/api/recovery-plans/{plan_id}/apply` | Execute & apply recovery plan |
| `GET` | `/api/users/{user_id}/preferences` | Get user preferences |
| `PATCH` | `/api/users/{user_id}/preferences` | Update recovery preferences |
