/**
 * TripRescue — Frontend API Client
 * Connects to FastAPI Backend.
 * Falls back gracefully to local demo data if backend is offline.
 */

import { demoTrip, demoImpactNodes, demoRecoveryPlans, demoBookings } from './data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ── Health ────────────────────────────────────────────────────────────────────
export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'mock_fallback', error: String(err) };
  }
}

// ── Trips ─────────────────────────────────────────────────────────────────────
export async function createTrip(data: {
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  traveler_count?: number;
  budget_ceiling?: number;
  recovery_strategy?: string;
  preferences?: Record<string, boolean>;
}) {
  try {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create trip');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] createTrip fallback:', err);
    return { id: `trip_${Date.now()}`, ...data, status: 'DRAFT' };
  }
}

export async function fetchTrips(params?: { status?: string; search?: string }) {
  try {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/trips${query ? `?${query}` : ''}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch trips');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] fetchTrips fallback:', err);
    return { trips: [demoTrip], total: 1 };
  }
}

export async function fetchTrip(tripId: string) {
  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Trip ${tripId} not found`);
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] fetchTrip fallback:', err);
    if (tripId === demoTrip.id) {
      return { trip: demoTrip };
    }
    return null;
  }
}

export async function fetchTripHealth(tripId: string) {
  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Health fetch failed');
    return await res.json();
  } catch (err) {
    return { trip_id: tripId, trip_health_score: demoTrip.trip_health_score, status: 'ACTIVE' };
  }
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export interface BookingInput {
  type: string;
  title: string;
  origin?: string;
  destination?: string;
  start_time: string;
  end_time?: string;
  day_offset?: number;
  provider?: string;
  confirmation_number?: string;
  cost?: number;
  is_important?: boolean;
  is_refundable?: boolean;
  notes?: string;
}

export async function addBooking(tripId: string, booking: BookingInput) {
  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    if (!res.ok) throw new Error('Failed to add booking');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] addBooking fallback:', err);
    return { id: `bk_${Date.now()}`, trip_id: tripId, ...booking, status: 'CONFIRMED' };
  }
}

export async function batchAddBookings(tripId: string, bookings: BookingInput[]) {
  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}/bookings/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookings }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to batch add bookings');
    }
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] batchAddBookings fallback:', err);
    throw err; // Don't silently fail — surface the error to the user
  }
}

export async function extractBookingFromFile(tripId: string, file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/trips/${tripId}/bookings/extract`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Extraction failed');
    }
    return await res.json();
  } catch (err) {
    throw err; // Surface AI errors to the user
  }
}

export async function fetchBookings(tripId: string) {
  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}/bookings`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] fetchBookings fallback:', err);
    if (tripId === demoTrip.id) {
      return { bookings: demoBookings, total: demoBookings.length };
    }
    return { bookings: [], total: 0 };
  }
}

// ── Disruptions ───────────────────────────────────────────────────────────────
export async function reportDisruption(tripId: string, data: {
  booking_id: string;
  type: string;
  delay_minutes: number;
  description?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}/disruptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to report disruption');
    }
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] reportDisruption fallback:', err);
    throw err;
  }
}

export async function fetchImpactAnalysis(disruptionId: string = 'dis_001') {
  try {
    const res = await fetch(`${API_BASE}/disruptions/${disruptionId}/impact`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Impact analysis fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] fetchImpactAnalysis fallback:', err);
    return {
      disruption_id: disruptionId,
      impact_results: demoImpactNodes,
      headline: 'Trip Disruption Cascade Analysis',
      summary_text: 'Delay detected across interconnected bookings.',
    };
  }
}

// ── Recovery ──────────────────────────────────────────────────────────────────
export async function fetchRecoveryPlans(targetId: string) {
  try {
    const url = targetId.startsWith('trip_')
      ? `${API_BASE}/trips/${targetId}/recovery-plans`
      : `${API_BASE}/disruptions/${targetId}/recovery-plans`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      // Try fallback URL
      const altUrl = `${API_BASE}/disruptions/${targetId}/recovery-plans`;
      const altRes = await fetch(altUrl, { cache: 'no-store' });
      if (!altRes.ok) throw new Error('Recovery plans fetch failed');
      return await altRes.json();
    }
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] fetchRecoveryPlans fallback:', err);
    return {
      disruption_id: targetId,
      plans: demoRecoveryPlans,
      recommendation_explanation: 'Best Overall is recommended because it preserves key bookings while minimizing additional cost and travel delay.',
    };
  }
}

export async function fetchPlanComparison(planId: string = 'plan_best') {
  try {
    const res = await fetch(`${API_BASE}/recovery-plans/${planId}/compare`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Plan comparison fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] fetchPlanComparison fallback:', err);
    return { plans: demoRecoveryPlans };
  }
}

export async function applyRecoveryPlan(planId: string, tripId?: string) {
  try {
    const url = tripId
      ? `${API_BASE}/trips/${tripId}/recovery-plans/${planId}/apply`
      : `${API_BASE}/recovery-plans/${planId}/apply`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed: true }),
    });
    if (!res.ok) throw new Error('Failed to apply recovery plan');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue] applyRecoveryPlan fallback:', err);
    return {
      applied: true,
      plan_id: planId,
      trip_health_before: 23,
      trip_health_after: 98,
      trip_status: 'STABLE',
      message: 'Trip successfully recovered!',
    };
  }
}
