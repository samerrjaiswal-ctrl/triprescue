'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  TrendingDown,
  Clock,
  ArrowRight,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import ImpactDAGCanvas from '@/components/impact/ImpactDAGCanvas';
import { fetchTrip } from '@/lib/api';

export default function ImpactAnalysis() {
  const params = useParams();
  const tripId = (params?.tripId as string) || '';

  const [trip, setTrip] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!tripId) return;
      try {
        const res = await fetchTrip(tripId);
        if (res) setTrip(res.trip || res);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [tripId]);

  const tripName = trip?.name || 'Impact Analysis';

  return (
    <AppShell activeTripId={tripId} activeTripName={tripName}>
      <div className="space-y-8">
        {/* Urgent Cascade Alert Bar */}
        <div className="rounded-3xl bg-gradient-to-r from-red-950/90 via-rose-900/70 to-[#120f1f] border border-red-500/40 p-6 lg:p-7 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-950/50">
              <AlertTriangle size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  Critical Ripple Cascade
                </span>
                <span className="text-xs font-mono text-[#94a3b8]">Live DAG Propagation</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">
                Trip connections affected by reported disruption.
              </h1>
              <p className="text-xs text-rose-200/80 mt-1 leading-relaxed max-w-3xl">
                Delay propagation has breached buffer thresholds on downstream bookings. Alternative multi-modal plans are ready for review.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
            <Link
              href={`/trips/${tripId}/recovery-plans`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-950/60 border border-indigo-500/30 transition-all hover:scale-105"
            >
              <Sparkles size={16} /> Evaluate Recovery Plans
            </Link>
          </div>
        </div>

        {/* Hero Interactive DAG Canvas Component */}
        <ImpactDAGCanvas />

        {/* Bottom Explanatory & Analytical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Constraint Analysis */}
          <div className="glass-card rounded-3xl p-6 space-y-3 border border-[#1c2942]">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <ShieldAlert size={16} className="text-blue-400" />
              AI Dependency Engine
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Because travel segments form a temporal chain, a delay in earlier segments exhausts transfer buffers, creating cascading infeasibilities for subsequent connections.
            </p>
            <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-[11px] text-[#cbd5e1]">
              <strong>Constraint Guard:</strong> TripRescue prioritizes plans that preserve your non-refundable stays and key activity bookings.
            </div>
          </div>

          {/* Card 2: Financial & Time Exposure */}
          <div className="glass-card rounded-3xl p-6 space-y-3 border border-[#1c2942]">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <TrendingDown size={16} className="text-rose-400" />
              Risk Exposure Metrics
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1c2942]/60">
                <span className="text-[#94a3b8]">Itinerary Infeasible:</span>
                <span className="font-bold text-rose-400">Multiple Segments</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1c2942]/60">
                <span className="text-[#94a3b8]">Budget Ceiling:</span>
                <span className="font-bold text-white">₹{trip?.budget_ceiling?.toLocaleString() || '5,000'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#94a3b8]">Status:</span>
                <span className="font-bold text-amber-400">Recovery Required</span>
              </div>
            </div>
          </div>

          {/* Card 3: Next Recovery Step Guidance */}
          <div className="glass-card rounded-3xl p-6 flex flex-col justify-between border border-[#1c2942] bg-gradient-to-br from-[#0e1424] to-[#120f26]">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Sparkles size={16} />
                Automated Recovery
              </div>
              <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
                The Recovery Engine has computed 3 ranked alternative itineraries that honor your budget ceiling and minimize booking changes.
              </p>
            </div>

            <Link
              href={`/trips/${tripId}/recovery-plans`}
              className="mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-950/50 transition-all hover:scale-[1.02]"
            >
              <span>View Generated Recovery Plans</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
