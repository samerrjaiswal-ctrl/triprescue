"""
TripRescue — Bookings Router
Handles manual booking entry, batch booking submission, and AI document extraction.
All bookings are stored in the in-memory store and immediately build a live DAG.
"""

import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas import BookingCreate
from app import store

router = APIRouter(tags=["Bookings"])


# ─── Schemas ────────────────────────────────────────────────────────────────

class BookingInput(BaseModel):
    """Single booking as entered via manual form."""
    type: str  # FLIGHT, TRAIN, BUS, HOTEL, TRANSFER, ACTIVITY
    title: str = Field(..., description="e.g. 'Pune → Delhi Flight'")
    origin: Optional[str] = None
    destination: Optional[str] = None
    start_time: str = Field(..., description="HH:MM (24-hour)")
    end_time: Optional[str] = None
    day_offset: int = Field(default=0, description="0=Day1, 1=Day2 etc.")
    provider: Optional[str] = None
    confirmation_number: Optional[str] = None
    cost: float = 0.0
    is_important: bool = False
    is_refundable: bool = True
    notes: Optional[str] = ""


class BatchBookingsCreate(BaseModel):
    """Submit all bookings for a trip at once — builds the full DAG."""
    bookings: List[BookingInput]


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/trips/{trip_id}/bookings", status_code=201)
async def add_booking(trip_id: str, booking: BookingInput):
    """
    Add a single booking to a trip manually.
    Rebuilds the dependency graph automatically.
    """
    bk_dict = booking.model_dump()
    bk_dict["id"] = f"bk_{uuid.uuid4().hex[:8]}"
    saved = store.add_booking_to_trip(trip_id, bk_dict)

    graph = store.get_trip_graph(trip_id)
    trip_health = graph.compute_trip_health() if graph else 100

    return {
        **saved,
        "status": "CONFIRMED",
        "trip_health": trip_health,
        "message": f"Booking added. Trip now has {len(store.get_trip(trip_id)['bookings'])} bookings.",
    }


@router.post("/trips/{trip_id}/bookings/batch", status_code=201)
async def batch_add_bookings(trip_id: str, payload: BatchBookingsCreate):
    """
    Submit ALL bookings for a trip at once.
    This is the primary endpoint for the manual booking form.
    Replaces any existing bookings and rebuilds the full dependency graph.
    """
    if not payload.bookings:
        raise HTTPException(status_code=400, detail="At least one booking is required.")

    bookings_list = []
    for i, bk in enumerate(payload.bookings):
        bk_dict = bk.model_dump()
        bk_dict["id"] = f"bk_{uuid.uuid4().hex[:8]}"
        bk_dict["sequence_index"] = i
        bookings_list.append(bk_dict)

    saved = store.set_bookings_for_trip(trip_id, bookings_list)
    graph = store.get_trip_graph(trip_id)
    trip_health = graph.compute_trip_health() if graph else 100

    graph_summary = {}
    if graph:
        graph_summary = {
            "node_count": len(graph.nodes),
            "edge_count": len(graph.edges),
            "nodes": [
                {
                    "id": n.id,
                    "title": n.title,
                    "type": n.type.value,
                    "start_time": n.start_time,
                    "end_time": n.end_time,
                    "day_offset": n.day_offset,
                }
                for n in graph.nodes.values()
            ],
            "edges": [
                {
                    "from": e.from_node,
                    "to": e.to_node,
                    "buffer_minutes": e.min_buffer_minutes,
                    "dependency_type": e.dependency_type,
                }
                for e in graph.edges
            ]
        }

    return {
        "trip_id": trip_id,
        "bookings_saved": len(saved),
        "trip_health": trip_health,
        "graph": graph_summary,
        "message": f"✅ {len(saved)} bookings added. Dependency graph built with {len(graph.edges) if graph else 0} connections.",
    }


@router.post("/trips/{trip_id}/bookings/extract")
async def extract_booking(trip_id: str, file: UploadFile = File(...)):
    """
    Upload a booking confirmation PDF/Image for AI extraction.
    Uses Gemini 1.5 Flash → Groq Llama 3.1 → failure response.
    The extracted booking is NOT auto-saved — user must review and confirm.
    """
    allowed_types = {
        "application/pdf", "image/jpeg", "image/png",
        "image/jpg", "image/webp"
    }
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Supported: PDF, JPG, PNG"
        )

    if file.size and file.size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    file_bytes = await file.read()

    from app.services.ai_extraction import extract_booking_from_file
    result = await extract_booking_from_file(
        file_bytes=file_bytes,
        filename=file.filename or "upload",
        mime_type=file.content_type or "application/pdf"
    )

    return result


@router.get("/trips/{trip_id}/bookings")
async def list_bookings(trip_id: str):
    """Get all bookings for a trip."""
    entry = store.get_trip(trip_id)
    if not entry:
        return {"trip_id": trip_id, "bookings": [], "total": 0}
    return {
        "trip_id": trip_id,
        "bookings": entry["bookings"],
        "total": len(entry["bookings"])
    }


@router.patch("/bookings/{booking_id}")
async def update_booking(booking_id: str, data: Dict[str, Any]):
    """
    Update a booking (e.g. correct AI-extracted fields).
    Rebuilds the graph after update.
    """
    for trip_id, entry in store.trips_store.items():
        for i, bk in enumerate(entry["bookings"]):
            if bk["id"] == booking_id:
                entry["bookings"][i].update(data)
                # Rebuild graph
                from app.engine.graph_builder import build_graph_from_bookings
                entry["graph"] = build_graph_from_bookings(trip_id, entry["bookings"])
                return {"id": booking_id, "status": "UPDATED", **entry["bookings"][i]}

    raise HTTPException(status_code=404, detail=f"Booking {booking_id} not found.")
