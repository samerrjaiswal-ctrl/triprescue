/**
 * TripRescue — Frontend API Client
 * Connects to FastAPI Backend on http://localhost:8000/api
 * Falls back gracefully to local demo data if backend is offline.
 */

import { demoTrip, demoImpactNodes, demoRecoveryPlans, demoBookings } from './data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'mock_fallback', error: String(err) };
  }
}

export async function fetchTrip(tripId: string) {
  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Trip ${tripId} not found`);
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue API] Falling back to local demoTrip:', err);
    return demoTrip;
  }
}

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
    if (!res.ok) throw new Error('Failed to report disruption');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue API] Mocking disruption response:', err);
    return {
      disruption_id: 'dis_001',
      trip_id: tripId,
      ...data,
      severity: 'MAJOR',
      status: 'ACTIVE',
    };
  }
}

export async function fetchImpactAnalysis(disruptionId: string = 'dis_001') {
  try {
    const res = await fetch(`${API_BASE}/disruptions/${disruptionId}/impact`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Impact analysis fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue API] Falling back to local impact nodes:', err);
    return {
      disruption_id: disruptionId,
      impact_results: demoImpactNodes,
      headline: 'Your trip is at risk',
      summary_text: 'A 5-hour flight delay creates multiple downstream impacts across your connected itinerary.',
    };
  }
}

export async function fetchRecoveryPlans(disruptionId: string = 'dis_001') {
  try {
    const res = await fetch(`${API_BASE}/disruptions/${disruptionId}/recovery-plans`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Recovery plans fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue API] Falling back to local recovery plans:', err);
    return {
      disruption_id: disruptionId,
      plans: demoRecoveryPlans,
      recommendation_explanation: 'Best Overall is recommended because it preserves your hotel and important activity while keeping additional cost moderate.',
    };
  }
}

export async function applyRecoveryPlan(planId: string, tripId: string = 'trip_001') {
  try {
    const res = await fetch(`${API_BASE}/recovery-plans/${planId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_id: tripId, strategy: planId }),
    });
    if (!res.ok) throw new Error('Failed to apply recovery plan');
    return await res.json();
  } catch (err) {
    console.warn('[TripRescue API] Mocking plan apply result:', err);
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
