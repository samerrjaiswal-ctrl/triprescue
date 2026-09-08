'use client';

import { useState } from 'react';
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
import { demoTrip, demoRecoveryPlans } from '@/lib/data';

export default function RecoveryPlansPage() {
  const [selectedPlanId, setSelectedPlanId] = useState('plan_best');

  return (
    <AppShell activeTripId={demoTrip.id} activeTripName={demoTrip.name}>
      <div className="space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 mb-3">
              <Sparkles size={13} />
              Step 3: Algorithmic Resolution
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              We found 3 ways to save your trip
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Constraint-optimized alternatives balancing cost, recovery speed, and itinerary preservation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/trips/trip_001/compare"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#141e33] hover:bg-[#1a2845] text-white border border-[#1e2d4d] transition-all hover:border-blue-500/40"
            >
              <Columns size={15} className="text-blue-400" />
              Compare All Side-by-Side
            </Link>
          </div>
        </div>

        {/* 3 Large Plan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {demoRecoveryPlans.map((plan, idx) => {
            const isSelected = selectedPlanId === plan.id;
            const isRecommended = plan.type === 'BEST_OVERALL';

            return (
              <motion.div
                key={plan.id}
                className={`relative rounded-3xl p-6 lg:p-7 flex flex-col justify-between transition-all border ${
                  isRecommended
                    ? 'bg-gradient-to-b from-[#131b33] via-[#0f172a] to-[#0a101f] border-blue-500/60 shadow-2xl shadow-blue-900/30 ring-1 ring-blue-500/50'
                    : 'bg-[#0a101f] border-[#1c2942] hover:border-[#2e3e60]'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -3 }}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                      isRecommended
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : plan.type === 'CHEAPEST'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}
                  >
                    {plan.badge}
                  </span>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Star size={13} className="fill-amber-400" />
                    <span>{plan.convenience_score} / 5</span>
                  </div>
                </div>

                {/* Plan Title & Added Cost */}
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {plan.title}
                  </h3>

                  <div className="flex items-baseline gap-2 mt-3 pb-5 border-b border-[#1c2942]">
                    <span className="text-3xl font-black text-white">
                      +₹{plan.additional_cost.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#94a3b8]">net additional expense</span>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 my-5">
                    <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942]">
                      <div className="text-[10px] uppercase font-bold text-[#64748b]">
                        Time Impact
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        +{plan.time_impact_hours} hrs delay
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942]">
                      <div className="text-[10px] uppercase font-bold text-[#64748b]">
                        Preservation
                      </div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        {plan.itinerary_preserved_pct}% Intact
                      </div>
                    </div>
                  </div>

                  {/* Rationale Explanation */}
                  <div className="p-3.5 rounded-xl bg-[#080d1a]/80 border border-[#1c2942] text-xs text-[#cbd5e1] leading-relaxed mb-5">
                    {plan.rationale}
                  </div>

                  {/* Changes List */}
                  <div className="space-y-2 mb-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                      Execution Actions
                    </div>
                    {plan.changes.map((ch, chIdx) => (
                      <div
                        key={chIdx}
                        className="text-xs p-2.5 rounded-lg bg-[#0e1628] border border-[#1c2942] flex items-center justify-between gap-2"
                      >
                        <span className="text-[#cbd5e1] font-medium truncate">
                          {ch.replacement}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-blue-400 flex-shrink-0">
                          {ch.cost_diff}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select CTA */}
                <div className="pt-2">
                  <Link
                    href={`/trips/trip_001/confirm?plan=${plan.id}`}
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
      </div>
    </AppShell>
  );
}
