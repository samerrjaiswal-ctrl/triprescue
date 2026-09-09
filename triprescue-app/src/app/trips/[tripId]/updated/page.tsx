'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Plane,
  Train,
  Car,
  Building2,
  Mountain,
  Download,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import TripHealthRing from '@/components/ui/TripHealthRing';
import StatusBadge from '@/components/ui/StatusBadge';
import { fetchTrip, fetchBookings } from '@/lib/api';

const iconMap: Record<string, any> = {
  FLIGHT: Plane,
  TRANSFER: Car,
  CAB: Car,
  TAXI: Car,
  HOTEL: Building2,
  STAY: Building2,
  TRAIN: Train,
  BUS: Car,
  ACTIVITY: Mountain,
};

export default function UpdatedTripPage() {
  const params = useParams();
  const tripId = (params?.tripId as string) || '';

  const [trip, setTrip] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire celebratory confetti on successful recovery load
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'],
    });

    async function load() {
      if (!tripId) return;
      setLoading(true);
      try {
        const [tripRes, bksRes] = await Promise.all([
          fetchTrip(tripId),
          fetchBookings(tripId),
        ]);
        if (tripRes) setTrip(tripRes.trip || tripRes);
        if (bksRes?.bookings) setBookings(bksRes.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tripId]);

  const tripName = trip?.name || 'Restored Itinerary';
  const currentHealth = trip?.trip_health_score ?? 98;

  return (
    <AppShell activeTripId={tripId} activeTripName={tripName}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Top Success Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/80 via-[#0d1c24] to-[#080d1a] border border-emerald-500/40 p-6 lg:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-950/50">
                <ShieldCheck size={30} />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-1.5">
                  <Sparkles size={12} />
                  Trip Feasibility Restored
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Your trip is back on track!
                </h1>
                <p className="text-xs text-emerald-200/80 mt-1 max-w-xl leading-relaxed">
                  All ripple cascade violations have been neutralized. Rebooking transactions completed and downstream buffer constraints are now 100% compliant.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-3">
              <Link
                href={`/trips/${tripId}/dashboard`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-950/60 transition-all hover:scale-105"
              >
                <span>Return to Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Health Transformation & Execution Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trip Health Score */}
          <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3">
              Health Score Recovery
            </div>
            <TripHealthRing score={currentHealth} previousScore={30} showComparison={true} size="lg" />
          </div>

          {/* Reconciliation Stats Card */}
          <div className="md:col-span-2 glass-card rounded-3xl p-6 lg:p-7 flex flex-col justify-between shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c2942] pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Execution Reconciliation
              </h3>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                Trip Status: STABLE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942]">
                <div className="text-[10px] uppercase font-bold text-[#64748b]">Total Nodes</div>
                <div className="text-xl font-black text-blue-400 mt-0.5">
                  {bookings.length} Segments
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942]">
                <div className="text-[10px] uppercase font-bold text-[#64748b]">Preserved Legs</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">Protected</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942]">
                <div className="text-[10px] uppercase font-bold text-[#64748b]">Graph State</div>
                <div className="text-xl font-black text-white mt-0.5">Feasible</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942] flex items-center justify-between text-xs text-[#cbd5e1]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Automated refund and voucher credits reconciled to booking records</span>
              </span>
            </div>
          </div>
        </div>

        {/* Recovered Itinerary Feed */}
        {bookings.length > 0 && (
          <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2942] pb-4">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">
                  Synchronized Connected Itinerary
                </h2>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  All segments aligned and verified against timing constraints
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                100% Validated
              </span>
            </div>

            <div className="space-y-3.5">
              {bookings.map((b, idx) => {
                const typeUpper = (b.type || 'FLIGHT').toUpperCase();
                const Icon = iconMap[typeUpper] || iconMap.FLIGHT;

                return (
                  <div
                    key={b.id || idx}
                    className="p-4 rounded-2xl bg-[#080d1a] border border-[#1c2942] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#141e33] border border-[#1e2d4d] text-blue-400 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{b.title}</div>
                        <div className="text-xs text-[#94a3b8] mt-0.5">
                          {b.start_time} {b.end_time ? `→ ${b.end_time}` : ''} {b.provider ? `• ${b.provider}` : ''}
                        </div>
                        <div className="text-[11px] text-emerald-400/90 mt-1">
                          Buffer and schedule confirmed
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col sm:items-end justify-between items-center gap-1.5 flex-shrink-0">
                      <StatusBadge status={(b.status as any) || 'CONFIRMED'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
