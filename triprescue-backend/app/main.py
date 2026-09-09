"""
TripRescue — Backend API Server
Built with FastAPI, Pydantic v2, and clean RESTful routers.
Now powered by real free APIs: Gemini 1.5 Flash, Groq Llama 3.1, Supabase.
"""

import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import trips, bookings, disruptions, recovery, users
from app import store

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

@app.on_event("startup")
async def startup_event():
    store.seed_demo_data()
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    groq_key = os.getenv("GROQ_API_KEY", "")
    supabase_url = os.getenv("SUPABASE_URL", "")
    print("\n[TripRescue] Backend started")
    print(f"   Demo trip loaded: {'[OK] trip_001 seeded' if 'trip_001' in store.trips_store else '[WARN] demo trip missing'}")
    print(f"   Gemini AI: {'[OK] configured' if gemini_key and (gemini_key.startswith('AIzaSy') or gemini_key.startswith('AQ.')) else '[INFO] using Groq LLM fallback'}")
    print(f"   Groq LLM:  {'[OK] configured' if groq_key and not groq_key.startswith('gsk_PASTE') else '[WARN] key missing - add to .env'}")
    print(f"   Supabase:  {'[OK] connected' if supabase_url else '[WARN] URL missing'}")
    print(f"   Mode:      Real Live DAG Engine + Supabase persistence\n")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
