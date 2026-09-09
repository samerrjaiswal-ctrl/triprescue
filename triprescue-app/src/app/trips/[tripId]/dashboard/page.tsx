'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  FileText,
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

interface BookingItem {
  id: string;
  trip_id?: string;
  type: string;
  title: string;
  origin?: string;
  destination?: string;
  start_time: string;
  end_time?: string;
  day_offset?: number;
  provider?: string;
  cost?: number;
  status?: string;
  confirmation_number?: string;
  is_important?: boolean;
}

interface TripData {
  id: string;
  name: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  traveler_count?: number;
  budget_ceiling?: number;
  status?: string;
  trip_health_score?: number | null;
}

export default function TripDashboard() {
  const params = useParams();
  const tripId = (params?.tripId as string) || '';

  const [trip, setTrip] = useState<TripData | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'TRANSIT' | 'STAYS' | 'ACTIVITIES'>('ALL');

  useEffect(() => {
    async function loadData() {
      if (!tripId) return;
      setLoading(true);
      try {
        const [tripRes, bookingsRes] = await Promise.all([
          fetchTrip(tripId),
          fetchBookings(tripId),
        ]);
        if (tripRes) {
          setTrip(tripRes?.trip || tripRes);
        }
        if (bookingsRes?.bookings && Array.isArray(bookingsRes.bookings)) {
          setBookings(bookingsRes.bookings);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error('Failed to load trip dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tripId]);

  const filteredBookings = bookings.filter((b) => {
    const t = (b.type || '').toUpperCase();
    if (filter === 'TRANSIT') return ['FLIGHT', 'TRANSFER', 'TRAIN', 'BUS', 'CAB', 'TAXI'].includes(t);
    if (filter === 'STAYS') return ['HOTEL', 'STAY'].includes(t);
    if (filter === 'ACTIVITIES') return t === 'ACTIVITY';
    return true;
  });

  const tripName = trip?.name || 'My Journey';
  const healthScore = trip?.trip_health_score ?? (bookings.length > 0 ? 95 : 100);
  const budgetCap = trip?.budget_ceiling ?? 5000;
  const isDisrupted = trip?.status === 'DISRUPTED' || healthScore < 70;

  // Extract route summary
  const routePoints: string[] = [];
  bookings.forEach((b) => {
    if (b.origin && !routePoints.includes(b.origin)) routePoints.push(b.origin);
    if (b.destination && !routePoints.includes(b.destination)) routePoints.push(b.destination);
  });
  if (routePoints.length === 0 && trip?.destination) {
    routePoints.push(trip.destination);
  }

  return (
    <AppShell activeTripId={tripId} activeTripName={tripName}>
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1628] via-[#10192e] to-[#080d1a] border border-[#1c2942] p-6 lg:p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                {tripName}
              </h1>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                  isDisrupted
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isDisrupted ? 'bg-rose-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                {isDisrupted ? 'Disruption Active' : 'Protected & Monitored'}
              </span>
            </div>

            {/* Route Sequence */}
            <div className="flex items-center gap-2 text-xs lg:text-sm text-[#94a3b8] flex-wrap">
              {routePoints.map((city, idx) => (
                <div key={city} className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#141e33] border border-[#1e2d4d] text-white font-semibold flex items-center gap-1.5">
                    {idx === 0 ? <MapPin size={13} className="text-blue-400" /> : null}
                    {city}
                  </span>
                  {idx < routePoints.length - 1 && (
                    <ArrowRight size={14} className="text-[#475569]" />
                  )}
                </div>
              ))}

              {(trip?.start_date || trip?.end_date) && (
                <>
                  <span className="text-[#334155] mx-1 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1 text-[#94a3b8]">
                    <Calendar size={13} className="text-blue-400" />
                    {trip?.start_date} {trip?.end_date ? `– ${trip.end_date}` : ''}
                  </span>
                </>
              )}

              <span className="text-[#334155] mx-1 hidden sm:inline">•</span>
              <span className="flex items-center gap-1 text-[#94a3b8]">
                <Users size={13} className="text-blue-400" />
                {trip?.traveler_count || 1} Travelers
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href={`/trips/${tripId}/add-bookings`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#141e33] hover:bg-[#1a2845] text-[#e2e8f0] border border-[#1e2d4d] transition-all hover:border-blue-500/40"
            >
              <Plus size={15} /> Add Booking
            </Link>
            <Link
              href={`/trips/${tripId}/disruption`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-xl shadow-rose-950/50 border border-rose-500/30 transition-all hover:scale-[1.02]"
            >
              <AlertTriangle size={15} /> Report Disruption
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
              {healthScore}%
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {healthScore >= 80 ? 'Optimal' : healthScore >= 50 ? 'Moderate' : 'Critical'}
              </span>
            </div>
          </div>

          <div className="bg-[#0b1120]/80 border border-[#162238] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Connected Nodes
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {bookings.length} <span className="text-xs font-normal text-[#94a3b8]">Segments</span>
            </div>
          </div>

          <div className="bg-[#0b1120]/80 border border-[#162238] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Status
            </div>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {trip?.status || 'ACTIVE'}
            </div>
          </div>

          <div className="bg-[#0b1120]/80 border border-[#162238] rounded-2xl p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Recovery Budget
            </div>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              ₹{budgetCap.toLocaleString()} <span className="text-xs font-normal text-[#94a3b8]">Cap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Connected Itinerary Timeline */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 lg:p-8">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filter === tab
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 rounded-2xl bg-[#080d1a] border border-[#1c2942] animate-pulse h-28" />
                ))}
              </div>
            )}

            {/* Empty Bookings State */}
            {!loading && bookings.length === 0 && (
              <div className="p-8 text-center space-y-4 bg-[#080d1a]/60 rounded-2xl border border-[#1c2942]">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                  <FileText size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No bookings added yet</h3>
                  <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
                    Add flights, trains, hotel reservations, or upload booking confirmation PDFs to build your live dependency graph.
                  </p>
                </div>
                <div>
                  <Link
                    href={`/trips/${tripId}/add-bookings`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition-all"
                  >
                    <Plus size={14} /> Add Booking or Upload PDF
                  </Link>
                </div>
              </div>
            )}

            {/* Populated Bookings List */}
            {!loading && bookings.length > 0 && (
              <div className="space-y-4">
                {filteredBookings.map((booking, idx) => {
                  const typeUpper = (booking.type || 'FLIGHT').toUpperCase();
                  const Icon = iconMap[typeUpper] || iconMap.FLIGHT;

                  return (
                    <motion.div
                      key={booking.id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-5 rounded-2xl bg-[#080d1a] hover:bg-[#0c1326] border border-[#1c2942] hover:border-blue-500/40 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-[#141e33] border border-[#1e2d4d] flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                            <Icon size={20} />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-blue-400">
                                {booking.start_time} {booking.end_time ? `→ ${booking.end_time}` : ''}
                              </span>
                              {booking.day_offset ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#162035] text-[#94a3b8]">
                                  Day {booking.day_offset + 1}
                                </span>
                              ) : null}
                              {booking.is_important && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  Protected Key Event
                                </span>
                              )}
                            </div>

                            <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                              {booking.title}
                            </h4>

                            <div className="flex items-center gap-3 text-xs text-[#94a3b8] flex-wrap">
                              {booking.provider && (
                                <span>{booking.provider}</span>
                              )}
                              {booking.origin && booking.destination && (
                                <span className="flex items-center gap-1 text-[#64748b]">
                                  • <MapPin size={11} className="text-blue-400" />
                                  {booking.origin} → {booking.destination}
                                </span>
                              )}
                              {booking.confirmation_number && (
                                <span className="font-mono text-[11px] text-[#64748b]">
                                  • Ref: {booking.confirmation_number}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-col md:items-end justify-between items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#1c2942]">
                          <StatusBadge status={(booking.status as any) || 'CONFIRMED'} />
                          {booking.cost ? (
                            <span className="text-xs font-mono font-bold text-white">
                              ₹{booking.cost.toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Mission Control, Health Ring & Disruption Center */}
        <div className="space-y-6">
          {/* Trip Health Card */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 flex flex-col items-center shadow-xl">
            <h3 className="text-sm font-bold text-[#94a3b8] uppercase tracking-wider mb-6">
              Trip Health Status
            </h3>

            <TripHealthRing score={healthScore} size="lg" />

            <div className="w-full mt-6 pt-6 border-t border-[#1c2942] space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Overall Risk Level</span>
                <span className={`font-extrabold ${healthScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {healthScore >= 80 ? 'Minimal' : healthScore >= 50 ? 'Moderate' : 'High Alert'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Itinerary Graph</span>
                <span className="font-extrabold text-white">
                  {bookings.length} Node{bookings.length === 1 ? '' : 's'} Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Solver Engine</span>
                <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Constraint Engine
                </span>
              </div>
            </div>
          </div>

          {/* Incident Management Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121226] via-[#1a1426] to-[#0d0d1a] border border-rose-500/30 p-6 lg:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/15 border border-rose-500/30 text-rose-400 flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Incident & Anomaly Center</h3>
                <p className="text-xs text-rose-300/80">Continuous delay & cancellation detection</p>
              </div>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">
              When carrier delays or schedule shifts hit any booking segment, TripRescue calculates ripple cascade impact across downstream connections and generates multi-modal recovery solutions.
            </p>

            <Link
              href={`/trips/${tripId}/disruption`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-xl shadow-rose-950/60 transition-all hover:scale-[1.02]"
            >
              <Zap size={15} /> Report or Check Disruption
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
