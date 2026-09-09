"""
TripRescue — AI Extraction Service
Extracts structured booking data from PDF/image files using:
1. PyMuPDF (fitz) — extracts raw text from PDFs
2. Pillow — handles image preprocessing
3. Google Gemini 1.5 Flash — primary LLM (free, multimodal)
4. Groq Llama 3.1 — fallback LLM if Gemini unavailable

Schema-grounded: LLM is given the exact BookingCreate JSON schema
to ensure structured, parseable output. LLM does NOT decide severity
or ranking — only extracts facts from documents.
"""

import os
import json
import base64
import logging
from typing import Optional, Dict, Any, Tuple

from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Target extraction schema (matches BookingCreate)
BOOKING_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "type": {"type": "string", "enum": ["FLIGHT", "TRAIN", "BUS", "HOTEL", "TRANSFER", "ACTIVITY", "TOUR", "EVENT"]},
        "title": {"type": "string", "description": "Short descriptive title e.g. 'Pune → Delhi Flight'"},
        "origin": {"type": "string"},
        "destination": {"type": "string"},
        "start_time": {"type": "string", "description": "HH:MM 24-hour format"},
        "end_time": {"type": "string", "description": "HH:MM 24-hour format"},
        "day_offset": {"type": "integer", "description": "0 = day 1, 1 = day 2, etc."},
        "provider": {"type": "string", "description": "Airline, hotel name, train operator etc."},
        "confirmation_number": {"type": "string"},
        "cost": {"type": "number"},
        "is_refundable": {"type": "boolean"},
        "notes": {"type": "string"}
    },
    "required": ["type", "title", "start_time"]
}

EXTRACTION_PROMPT = """You are a travel booking data extractor. Your ONLY job is to extract structured booking information from the provided travel confirmation document.

Extract EXACTLY ONE booking from this document and return it as a JSON object matching this schema:
{schema}

Rules:
- Convert all times to HH:MM 24-hour format (e.g. "10:30", "22:00")
- day_offset: 0 for first day of travel, 1 for second day, etc. Default to 0 if unclear.
- If a field is not found in the document, omit it (do not guess)
- type must be one of: FLIGHT, TRAIN, BUS, HOTEL, TRANSFER, ACTIVITY, TOUR, EVENT
- Return ONLY the JSON object, no explanation, no markdown, no extra text

Document content:
{content}""".format(schema=json.dumps(BOOKING_JSON_SCHEMA, indent=2), content="{content}")


def _extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF using PyMuPDF (fitz). Free, local, no API needed."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text())
        doc.close()
        return "\n".join(text_parts).strip()
    except ImportError:
        logger.warning("PyMuPDF not installed. Install with: pip install PyMuPDF")
        return ""
    except Exception as e:
        logger.error(f"PDF text extraction failed: {e}")
        return ""


def _image_to_base64(file_bytes: bytes, mime_type: str) -> str:
    """Convert image bytes to base64 string for Gemini multimodal input."""
    return base64.b64encode(file_bytes).decode("utf-8")


async def _extract_with_gemini(content: str, file_bytes: Optional[bytes] = None, mime_type: str = "image/jpeg") -> Tuple[Optional[Dict], float]:
    """
    Use Gemini 1.5/2.5/3.6 Flash to extract booking data.
    Runs non-blocking in thread pool with timeout.
    """
    if not GEMINI_API_KEY or (not GEMINI_API_KEY.startswith("AIzaSy") and not GEMINI_API_KEY.startswith("AQ.")):
        logger.info("Gemini key missing or invalid format, using Groq directly.")
        return None, 0.0

    import asyncio

    def _call_gemini():
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY, transport="rest")
        model = genai.GenerativeModel("gemini-3.6-flash")
        prompt = EXTRACTION_PROMPT.replace("{content}", content or "See attached image")

        if file_bytes and not content:
            image_part = {"mime_type": mime_type, "data": file_bytes}
            response = model.generate_content(
                [prompt, image_part],
                generation_config={"temperature": 0.1, "response_mime_type": "application/json"},
                request_options={"timeout": 15}
            )
        else:
            response = model.generate_content(
                prompt,
                generation_config={"temperature": 0.1, "response_mime_type": "application/json"},
                request_options={"timeout": 15}
            )

        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        booking = json.loads(raw)
        return booking

    try:
        booking = await asyncio.wait_for(asyncio.to_thread(_call_gemini), timeout=15.0)
        logger.info(f"Gemini extraction successful: {booking.get('type', 'unknown')}")
        return booking, 0.92
    except Exception as e:
        logger.warning(f"Gemini extraction skipped/failed (will try Groq): {e}")
        return None, 0.0


async def _extract_with_groq(content: str) -> Tuple[Optional[Dict], float]:
    """
    Use Groq as fast fallback for text-only extraction.
    Runs in thread pool with timeout.
    """
    if not GROQ_API_KEY or GROQ_API_KEY.startswith("gsk_PASTE"):
        return None, 0.0

    import asyncio

    def _call_groq():
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        prompt = EXTRACTION_PROMPT.replace("{content}", content)

        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {"role": "system", "content": "You are a travel booking data extractor. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )

        raw = response.choices[0].message.content.strip()
        return json.loads(raw)

    try:
        booking = await asyncio.wait_for(asyncio.to_thread(_call_groq), timeout=10.0)
        logger.info(f"Groq extraction successful: {booking.get('type', 'unknown')}")
        return booking, 0.85
    except Exception as e:
        logger.error(f"Groq extraction failed: {e}")
        return None, 0.0


async def extract_booking_from_file(
    file_bytes: bytes,
    filename: str,
    mime_type: str
) -> Dict[str, Any]:
    """
    Main entry point for AI booking extraction.

    Flow:
    1. If PDF → extract text with PyMuPDF → send text to Gemini/Groq
    2. If image → send directly to Gemini multimodal
    3. Gemini first → Groq fallback → hardcoded failure response

    Returns dict with: extracted, confidence, booking, requires_review, source
    """
    is_pdf = mime_type == "application/pdf" or filename.lower().endswith(".pdf")
    is_image = mime_type in ("image/jpeg", "image/png", "image/webp") or \
               any(filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"])

    text_content = ""
    if is_pdf:
        text_content = _extract_text_from_pdf(file_bytes)
        if not text_content:
            return {
                "extracted": False,
                "confidence": 0.0,
                "booking": None,
                "requires_review": True,
                "source": "ERROR",
                "error": "Could not extract text from PDF. Try a clearer scan."
            }

    # Try Gemini first
    booking, confidence = await _extract_with_gemini(
        content=text_content,
        file_bytes=file_bytes if is_image else None,
        mime_type=mime_type
    )

    if not booking and text_content:
        # Groq fallback (text only)
        booking, confidence = await _extract_with_groq(text_content)

    if not booking:
        return {
            "extracted": False,
            "confidence": 0.0,
            "booking": None,
            "requires_review": True,
            "source": "FAILED",
            "error": "AI extraction failed. Please add booking manually or check your API keys."
        }

    # Ensure required fields
    booking.setdefault("day_offset", 0)
    booking.setdefault("cost", 0.0)
    booking.setdefault("is_refundable", True)

    return {
        "extracted": True,
        "confidence": round(confidence, 2),
        "booking": booking,
        "requires_review": True,  # Always ask user to confirm AI output
        "source": "AI_EXTRACTED"
    }
