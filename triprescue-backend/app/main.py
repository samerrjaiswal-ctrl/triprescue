"""
TripRescue — Backend API Server
Built with FastAPI, Pydantic v2, and clean RESTful routers.
Follows the architecture defined in docs/API_PLAN.md & docs/SYSTEM_ARCHITECTURE.md.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import trips, bookings, disruptions, recovery, users

app = FastAPI(
    title="TripRescue API",
    description="Intelligent Travel Disruption Recovery Engine & Dependency Graph API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration to allow local Next.js frontend and deployed clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Health Check
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "TripRescue Recovery Engine",
        "version": "1.0.0",
        "timestamp": "2026-09-09T00:00:00Z",
    }

# Include all routers under /api
app.include_router(trips.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(disruptions.router, prefix="/api")
app.include_router(recovery.router, prefix="/api")
app.include_router(users.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
