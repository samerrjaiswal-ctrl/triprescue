'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Plane,
  Car,
  Building2,
  Train,
  Mountain,
  ChevronDown,
  Clock,
  ShieldAlert,
  ArrowDown,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { demoTrip, demoDisruption, demoImpactNodes } from '@/lib/data';

const iconMap: Record<string, any> = {
  FLIGHT: Plane,
  TRANSFER: Car,
  HOTEL: Building2,
  TRAIN: Train,
  ACTIVITY: Mountain,
};

export default function ImpactAnalysis() {
  return (
    <AppShell activeTripId={demoTrip.id} activeTripName={demoTrip.name}>
      <div className="space-y-8">
        {/* Urgent Cascade Alert Bar */}
        <div className="rounded-3xl bg-gradient-to-r from-red-950/80 via-rose-900/60 to-[#120f1f] border border-red-500/40 p-6 lg:p-7 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-950/50">
              <AlertTriangle size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                  Critical Ripple Cascade
                </span>
                <span className="text-xs text-[#94a3b8]">Disruption ID: dis_001</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">
                Your trip is at risk. 3 downstream bookings broken.
              </h1>
              <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">
                A 300-minute delay on Flight 6E-1234 invalidates your ground transfer, the Kalka Shatabdi train, and the overnight Volvo to Manali.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/trips/trip_001/recovery-plans"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-950/60 border border-indigo-500/30 transition-all hover:scale-105"
            >
              <Sparkles size={16} /> Generate Recovery Plans
            </Link>
          </div>
        </div>

        {/* Main Grid: 2 Cols Graph Cascade + 1 Col Summary & Causality */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Visual Graph Cascade */}
          <div className="xl:col-span-2 space-y-4">
            <div className="glass-card rounded-3xl p-6 lg:p-8">
              <div className="flex items-center justify-between pb-5 border-b border-[#1c2942] mb-6">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Dependency Ripple Graph
                  </h2>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    Directional causality propagation analyzed across buffer constraints
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-400 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25">
                  5 Impacted Nodes
                </span>
              </div>

              {/* Cascade Stream */}
              <div className="space-y-4">
                {demoImpactNodes.map((node, idx) => {
                  const Icon = iconMap[node.type] || Plane;
                  const isCritical = node.severity === 'CRITICAL' || node.severity === 'DISRUPTED';

                  return (
                    <motion.div
                      key={node.booking_id}
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      {/* Node Card */}
                      <div
                        className={`rounded-2xl p-5 lg:p-6 transition-all border ${
                          isCritical
                            ? 'bg-[#140c14]/90 border-rose-500/40 shadow-lg shadow-rose-950/20'
                            : 'bg-[#14120c]/90 border-amber-500/35 shadow-lg shadow-amber-950/20'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {/* Type Icon */}
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                                isCritical
                                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              }`}
                            >
                              <Icon size={22} />
                            </div>

                            {/* Node Info */}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-white">
                                  {node.title}
                                </h3>
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                    isCritical
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  }`}
                                >
                                  {node.severity}
                                </span>
                              </div>

                              <p className="text-xs text-[#cbd5e1] mt-1.5 leading-relaxed">
                                {node.reason}
                              </p>

                              <div className="text-[11px] font-medium text-[#94a3b8] mt-2 flex items-center gap-1.5">
                                <Zap size={12} className={isCritical ? 'text-rose-400' : 'text-amber-400'} />
                                <span>Action: {node.action_required}</span>
                              </div>
                            </div>
                          </div>

                          {/* Slack Indicator */}
                          <div className="flex md:flex-col md:items-end justify-between items-center gap-1 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1c2942]">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                              Slack Deficit
                            </div>
                            <div
                              className={`text-sm font-black font-mono ${
                                isCritical ? 'text-rose-400' : 'text-amber-400'
                              }`}
                            >
                              {node.slack_minutes} mins
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Directional Arrow between nodes */}
                      {idx < demoImpactNodes.length - 1 && (
                        <div className="flex items-center justify-center py-2">
                          <div className="flex items-center gap-2 text-xs text-rose-400/70 font-mono">
                            <ArrowDown size={15} className="animate-bounce" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">
                              Downstream Failure
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Executive Summary & Causality Breakdown */}
          <div className="space-y-6">
            {/* Impact Summary Card */}
            <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6">
              <h3 className="text-base font-bold text-white border-b border-[#1c2942] pb-4">
                Impact Summary
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94a3b8]">Critical Violations</span>
                  <span className="font-black text-rose-400 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30">
                    3 Infeasible
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94a3b8]">At-Risk Elements</span>
                  <span className="font-black text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                    2 Warning
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94a3b8]">Safe Elements</span>
                  <span className="font-bold text-[#64748b]">0</span>
                </div>

                <div className="pt-3 border-t border-[#1c2942] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94a3b8]">Estimated Cost Exposure</span>
                    <span className="font-black text-white">₹1,800 — ₹4,500</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94a3b8]">Total Time Delay</span>
                    <span className="font-black text-white">+1.2 to +4.5 hrs</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94a3b8]">Itinerary Disrupted</span>
                    <span className="font-black text-rose-400">83% of Trip</span>
                  </div>
                </div>
              </div>

              <Link
                href="/trips/trip_001/recovery-plans"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-950/60 transition-all hover:scale-[1.02]"
              >
                <Sparkles size={15} />
                Evaluate 3 Recovery Plans
              </Link>
            </div>

            {/* Why Are These Affected? Explanation Box */}
            <div className="glass-card rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <ShieldAlert size={15} className="text-blue-400" />
                AI Constraint Analysis
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Because travel nodes form a temporal chain, a failure in Flight 1 exhausts the 30-minute buffer to the transfer cab, and the subsequent delay renders the 5:00 PM train uncatchable.
              </p>
              <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-[11px] text-[#cbd5e1]">
                <strong>Constraint Guard:</strong> TripRescue prioritizes plans that preserve your 10:00 AM Paragliding session and the luxury hotel stay.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
