'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  AlertTriangle,
  Plus,
  Shield,
  Clock,
  ArrowRight,
  Plane,
  Train,
  Building2,
  Car,
  Mountain,
  CheckCircle2,
  Sparkles,
  Zap,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import TripHealthRing from '@/components/ui/TripHealthRing';
import StatusBadge from '@/components/ui/StatusBadge';
import { demoTrip, demoBookings } from '@/lib/data';

const iconMap: Record<string, any> = {
  FLIGHT: Plane,
  TRANSFER: Car,
  HOTEL: Building2,
  TRAIN: Train,
  ACTIVITY: Mountain,
};

export default function TripDashboard() {
  const [filter, setFilter] = useState<'ALL' | 'TRANSIT' | 'STAYS' | 'ACTIVITIES'>('ALL');

  const filteredBookings = demoBookings.filter((b) => {
    if (filter === 'TRANSIT') return ['FLIGHT', 'TRANSFER', 'TRAIN'].includes(b.type);
    if (filter === 'STAYS') return b.type === 'HOTEL';
    if (filter === 'ACTIVITIES') return b.type === 'ACTIVITY';
    return true;
  });

  return (
    <AppShell activeTripId={demoTrip.id} activeTripName={demoTrip.name}>
      {/* Hero Banner with Route & Action Buttons */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1628] via-[#10192e] to-[#080d1a] border border-[#1c2942] p-6 lg:p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                {demoTrip.name}
              </h1>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active & Monitored
              </span>
            </div>

            {/* Route Sequence Pills */}
            <div className="flex items-center gap-2 text-xs lg:text-sm text-[#94a3b8] flex-wrap">
              {demoTrip.route_summary.map((city, idx) => (
                <div key={city} className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#141e33] border border-[#1e2d4d] text-white font-semibold flex items-center gap-1.5">
                    {idx === 0 ? <MapPin size={13} className="text-blue-400" /> : null}
                    {city}
                  </span>
                  {idx < demoTrip.route_summary.length - 1 && (
                    <ArrowRight size={14} className="text-[#475569]" />
                  )}
                </div>
              ))}

              <span className="text-[#334155] mx-1 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-[#94a3b8]">
                <Calendar size={13} className="text-blue-400" />
                Sep 12–17, 2026
              </span>
              <span className="text-[#334155] mx-1 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-[#94a3b8]">
                <Users size={13} className="text-blue-400" />
                2 Travelers
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/trips/trip_001/add-bookings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#141e33] hover:bg-[#1a2845] text-[#e2e8f0] border border-[#1e2d4d] transition-all hover:border-blue-500/40"
            >
              <Plus size={15} /> Add Booking
            </Link>
            <Link
              href="/trips/trip_001/disruption"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-xl shadow-rose-950/50 border border-rose-500/30 transition-all hover:scale-[1.02]"
            >
              <AlertTriangle size={15} /> Simulate Disruption
            </Link>
          </div>
        </div>

        {/* 4 Executive Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#1c2942]">
          <div className="bg-[#0b1120]/80 border border-[#162238] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Composite Health
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
              92%
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Excellent
              </span>
            </div>
          </div>

          <div className="bg-[#0b1120]/80 border border-[#162238] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Connected Nodes
            </div>
            <div className="text-2xl font-black text-white mt-1">
              6 <span className="text-xs font-normal text-[#94a3b8]">Sequenced</span>
            </div>
          </div>

          <div className="bg-[#0b1120]/80 border border-[#162238] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Cumulative Buffer
            </div>
            <div className="text-2xl font-black text-blue-400 mt-1">
              +7.5 <span className="text-xs font-normal text-[#94a3b8]">hours</span>
            </div>
          </div>

          <div className="bg-[#0b1120]/80 border border-[#162238] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Recovery Budget
            </div>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              ₹5,000 <span className="text-xs font-normal text-[#94a3b8]">Cap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Cols Itinerary + 1 Col Mission Control */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Connected Itinerary Timeline */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 lg:p-8">
            {/* Header with filter tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2942] mb-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Connected Itinerary
                </h2>
                <p className="text-xs text-[#94a3b8] mt-1">
                  Continuous dependency graph linking transfers, stays, and departures
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090f1d] border border-[#1c2942]">
                {(['ALL', 'TRANSIT', 'STAYS', 'ACTIVITIES'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filter === tab
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {tab === 'ALL'
                      ? 'All Nodes (6)'
                      : tab === 'TRANSIT'
                      ? 'Transit'
                      : tab === 'STAYS'
                      ? 'Stays'
                      : 'Activities'}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Cards Stream */}
            <div className="space-y-4">
              {filteredBookings.map((booking, idx) => {
                const Icon = iconMap[booking.type] || Plane;
                const startTime = new Date(booking.start_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const endTime = new Date(booking.end_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <motion.div
                    key={booking.id}
                    className="relative"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                  >
                    {/* Booking Card */}
                    <div className="group bg-[#0a101f] hover:bg-[#121b30] border border-[#1c2942] hover:border-blue-500/40 rounded-2xl p-5 lg:p-6 transition-all duration-200 shadow-lg">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        {/* Time Column + Icon + Main Info */}
                        <div className="flex items-start gap-4 flex-1">
                          {/* Left Time Badge */}
                          <div className="flex flex-col items-center justify-center w-24 py-3 px-2 rounded-xl bg-[#080d1a] border border-[#1c2942] text-center flex-shrink-0">
                            <span className="text-xs font-black text-white">{startTime}</span>
                            <span className="text-[10px] text-[#64748b] mt-0.5">to {endTime}</span>
                          </div>

                          {/* Icon Container */}
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600/10 border border-blue-500/25 text-blue-400 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0 shadow-sm">
                            <Icon size={22} />
                          </div>

                          {/* Node Titles & Hubs */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                                {booking.title}
                              </h3>
                              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#141e33] text-[#94a3b8] border border-[#1e2d4d]">
                                {booking.code}
                              </span>
                              {booking.is_important && (
                                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  Protected Node
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#94a3b8] mt-1 font-medium">
                              <span className="text-[#c0c1ff]">{booking.provider}</span> • {booking.operator}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-[#64748b] mt-2 flex-wrap">
                              <span className="flex items-center gap-1.5 text-[#94a3b8]">
                                <MapPin size={12} className="text-blue-400" />
                                {booking.origin_hub} → {booking.dest_hub}
                              </span>
                            </div>

                            {/* Tags pill */}
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              {booking.details.map((d, dIdx) => (
                                <span
                                  key={dIdx}
                                  className="text-[10px] font-medium px-2.5 py-0.5 rounded-lg bg-[#0e1628] text-[#94a3b8] border border-[#1c2942]"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Status Column */}
                        <div className="flex md:flex-col md:items-end justify-between items-center gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#1c2942]">
                          <StatusBadge status={booking.status} />
                          <span className="text-xs font-mono font-bold text-white">
                            ₹{booking.cost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Buffer connector indicator */}
                    {booking.buffer_to_next && (
                      <div className="flex items-center gap-3 my-3 pl-10 md:pl-32">
                        <div className="w-0.5 h-7 bg-blue-500/40 rounded-full" />
                        <span className="text-[11px] font-semibold text-[#94a3b8] bg-[#090f1d] px-3 py-1.5 rounded-xl border border-[#1c2942] flex items-center gap-2 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          {booking.buffer_to_next}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Mission Control, Health Ring & Instant Simulator */}
        <div className="space-y-6">
          {/* Trip Health Card */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col items-center shadow-xl">
            <h3 className="text-sm font-bold text-[#94a3b8] uppercase tracking-wider mb-6">
              Trip Health Status
            </h3>

            <TripHealthRing score={demoTrip.trip_health_score} size="lg" />

            {/* Health Breakdown Matrix */}
            <div className="w-full mt-6 pt-6 border-t border-[#1c2942] space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Overall Risk Level</span>
                <span className="font-extrabold text-emerald-400">Minimal</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Safe Connections</span>
                <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  5 Feasible
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Buffer Watch</span>
                <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  1 Buffer Watch (30m)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Critical Violations</span>
                <span className="font-extrabold text-[#64748b] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  0 Critical
                </span>
              </div>
            </div>
          </div>

          {/* Instant Disruption Trigger Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121226] via-[#1a1426] to-[#0d0d1a] border border-rose-500/30 p-6 lg:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/15 border border-rose-500/30 text-rose-400 flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Disruption Simulator</h3>
                <p className="text-xs text-rose-300/80">Trigger live travel anomaly</p>
              </div>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Test how TripRescue detects ripple effects across your connected bookings when an airline delay strikes.
            </p>

            <div className="p-3.5 rounded-xl bg-[#0d0914]/80 border border-rose-500/20 text-xs text-[#cbd5e1] space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Plane size={13} className="text-rose-400" />
                Flight 6E-1234 +5h Delay
              </div>
              <p className="text-[11px] text-[#94a3b8]">
                Arrives at 5:00 PM instead of 12:00 PM → Misses cab, train, and bus.
              </p>
            </div>

            <Link
              href="/trips/trip_001/disruption"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-xl shadow-rose-950/60 transition-all hover:scale-[1.02]"
            >
              <Zap size={15} /> Trigger Disruption Analysis
            </Link>
          </div>

          {/* Next Departure Widget */}
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400 flex-shrink-0">
              <Clock size={20} />
            </div>
            <div className="text-xs">
              <div className="text-[#64748b] font-semibold uppercase tracking-wider text-[10px]">
                Upcoming Milestone
              </div>
              <div className="font-bold text-white text-sm mt-0.5">
                IndiGo 6E-1234
              </div>
              <div className="text-[11px] text-[#94a3b8]">
                Departure in 3 days (12 Sep, 10:00 AM)
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
