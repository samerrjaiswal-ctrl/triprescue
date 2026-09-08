from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional, Dict, Any
from app.schemas import BookingCreate

router = APIRouter(tags=["Bookings"])

# POST /api/trips/{trip_id}/bookings - Add booking
@router.post("/trips/{trip_id}/bookings", status_code=201)
async def add_booking(trip_id: str, booking: BookingCreate):
    """
    Add a booking manually to a trip.
    TODO: Insert into DB, auto-infer dependencies in the graph.
    """
    return {
        "id": "bk_manual_001",
        "trip_id": trip_id,
        "type": booking.type,
        "origin": booking.origin,
        "destination": booking.destination,
        "start_time": booking.start_time,
        "end_time": booking.end_time,
        "provider": booking.provider,
        "confirmation_number": booking.confirmation_number,
        "cost": booking.cost,
        "is_important": booking.is_important,
        "notes": booking.notes,
        "sequence_index": 1,
        "status": "CONFIRMED",
    }

# POST /api/trips/{trip_id}/bookings/extract - AI Document Extraction
@router.post("/trips/{trip_id}/bookings/extract")
async def extract_booking(trip_id: str, file: UploadFile = File(...)):
    """
    Upload a ticket/booking confirmation (PDF/Image) for LLM extraction.
    TODO: Send file content to Gemini / Claude Vision for schema-grounded extraction.
    """
    return {
        "extracted": True,
        "confidence": 0.94,
        "booking": {
            "type": "FLIGHT",
            "origin": "Pune",
            "destination": "Delhi",
            "start_time": "2026-09-12T10:00:00",
            "end_time": "2026-09-12T12:00:00",
            "provider": "IndiGo",
            "confirmation_number": "6E-1234",
            "cost": 4500.0,
            "source": "AI_EXTRACTED",
        },
        "requires_review": True,
    }

# PATCH /api/bookings/{booking_id} - Update booking
@router.patch("/bookings/{booking_id}")
async def update_booking(booking_id: str, data: Dict[str, Any]):
    """
    Update booking details or correct AI extraction fields.
    TODO: Update PostgreSQL record and re-evaluate dependent connections.
    """
    return {
        "id": booking_id,
        "status": "UPDATED",
        **data,
    }
