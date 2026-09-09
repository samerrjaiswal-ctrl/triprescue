'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Columns,
  Coins,
  Shield,
  Star,
  Info,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchTrip, fetchRecoveryPlans } from '@/lib/api';

interface PlanChange {
  original_booking?: string;
  new_booking?: string;
  change_type?: string;
  replacement?: string;
  cost_diff?: string;
}

interface RecoveryPlan {
  id: string;
  label: string;
  name?: string;
  type?: string;
  additional_cost: number;
  time_impact_hours: number;
  itinerary_preserved_pct: number;
  bookings_changed_count: number;
  convenience_score: number;
  hotel_preserved: boolean;
  activity_preserved: boolean;
  rationale_text?: string;
  is_recommended?: boolean;
  changes?: PlanChange[];
}

export default function RecoveryPlansPage() {
  const params = useParams();
  const tripId = (params?.tripId as string) || '';

  const [trip, setTrip] = useState<any>(null);
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!tripId) return;
      setLoading(true);
      try {
        const [tripRes, plansRes] = await Promise.all([
          fetchTrip(tripId),
          fetchRecoveryPlans(tripId),
        ]);
        if (tripRes) setTrip(tripRes.trip || tripRes);
        if (plansRes?.plans && Array.isArray(plansRes.plans)) {
          setPlans(plansRes.plans);
        }
      } catch (err) {
        console.error('Failed to load recovery plans:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tripId]);

  const tripName = trip?.name || 'Recovery Plans';

  return (
    <AppShell activeTripId={tripId} activeTripName={tripName}>
      <div className="space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 mb-3">
              <Sparkles size={13} />
              Step 3: Algorithmic Resolution
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Calculated Recovery Alternatives
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Constraint-optimized alternatives balancing cost, recovery speed, and itinerary preservation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/trips/${tripId}/compare`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#141e33] hover:bg-[#1a2845] text-white border border-[#1e2d4d] transition-all hover:border-blue-500/40"
            >
              <Columns size={15} className="text-blue-400" />
              Compare All Side-by-Side
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl p-7 h-96 bg-[#0a101f] border border-[#1c2942] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty Plans Warning */}
        {!loading && plans.length === 0 && (
          <div className="glass-card rounded-3xl p-10 text-center space-y-4 border border-[#1c2942]">
            <p className="text-sm text-[#94a3b8]">
              No active disruption reported for this trip yet. Report a delay to compute recovery plans.
            </p>
            <div>
              <Link
                href={`/trips/${tripId}/disruption`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
              >
                Go to Disruption Center
              </Link>
            </div>
          </div>
        )}

        {/* Plan Cards Grid */}
        {!loading && plans.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, idx) => {
              const isRecommended = plan.is_recommended || plan.label === 'BEST OVERALL' || plan.label === 'BEST_OVERALL';
              const planTitle = plan.name || plan.label.replace('_', ' ');

              return (
                <motion.div
                  key={plan.id || idx}
                  className={`relative rounded-3xl p-6 lg:p-7 flex flex-col justify-between transition-all border ${
                    isRecommended
                      ? 'bg-gradient-to-b from-[#131b33] via-[#0f172a] to-[#0a101f] border-blue-500/60 shadow-2xl shadow-blue-900/30 ring-1 ring-blue-500/50'
                      : 'bg-[#0a101f] border-[#1c2942] hover:border-[#2e3e60]'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-900/50 border border-blue-400/40 flex items-center gap-1.5">
                      <Star size={11} className="fill-white" />
                      Recommended Recovery Plan
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          {plan.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {plan.itinerary_preserved_pct}% Preserved
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white mt-1">
                        {planTitle}
                      </h3>
                      {plan.rationale_text && (
                        <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
                          {plan.rationale_text}
                        </p>
                      )}
                    </div>

                    {/* Metric Highlights */}
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#080d1a] border border-[#1c2942]">
                      <div>
                        <div className="text-[10px] font-bold text-[#64748b] uppercase">
                          Additional Cost
                        </div>
                        <div className="text-base font-black text-white mt-0.5">
                          {plan.additional_cost === 0 ? '₹0' : `+₹${plan.additional_cost.toLocaleString()}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#64748b] uppercase">
                          Time Impact
                        </div>
                        <div className="text-base font-black text-amber-400 mt-0.5">
                          {plan.time_impact_hours === 0 ? 'On Time' : `+${plan.time_impact_hours}h`}
                        </div>
                      </div>
                    </div>

                    {/* Protection Checklist */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-[#1c2942]/60">
                        <span className="text-[#94a3b8]">Accommodations:</span>
                        <span className="flex items-center gap-1 font-bold text-emerald-400">
                          <CheckCircle2 size={13} /> Preserved
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#1c2942]/60">
                        <span className="text-[#94a3b8]">Key Activities:</span>
                        <span className="flex items-center gap-1 font-bold text-emerald-400">
                          <CheckCircle2 size={13} /> Protected
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[#94a3b8]">Segments Rebooked:</span>
                        <span className="font-bold text-white">
                          {plan.bookings_changed_count} Segment{plan.bookings_changed_count === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    {/* Changes List if present */}
                    {plan.changes && plan.changes.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#1c2942]">
                        <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                          Replaced Segments:
                        </div>
                        {plan.changes.map((ch, chIdx) => (
                          <div
                            key={chIdx}
                            className="text-xs p-2.5 rounded-lg bg-[#0e1628] border border-[#1c2942] flex items-center justify-between gap-2"
                          >
                            <span className="text-[#cbd5e1] font-medium truncate">
                              {ch.replacement || ch.new_booking || 'Rebooked alternative connection'}
                            </span>
                            {ch.cost_diff && (
                              <span className="text-[11px] font-mono font-bold text-blue-400 flex-shrink-0">
                                {ch.cost_diff}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Select CTA */}
                  <div className="pt-5">
                    <Link
                      href={`/trips/${tripId}/confirm?plan=${plan.id}`}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all ${
                        isRecommended
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/60'
                          : 'bg-[#152037] hover:bg-[#1e2d4d] text-white border border-[#1e2d4d]'
                      }`}
                    >
                      <span>Choose Plan & Proceed</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
