'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  PlaneTakeoff,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchTrips } from '@/lib/api';

interface TripItem {
  id: string;
  name: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  traveler_count?: number;
  status?: string;
  trip_health_score?: number | null;
  booking_count?: number;
}

export default function MyTripsPage() {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchTrips();
        if (res?.trips && Array.isArray(res.trips)) {
          setTrips(res.trips);
        } else {
          setTrips([]);
        }
      } catch (err) {
        console.error('Failed to load trips:', err);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = trips.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.destination || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell activeTripName="My Trips">
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">My Trips</h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Active travel graphs protected by the TripRescue continuous constraint solver.
            </p>
          </div>

          <Link
            href="/create-trip"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all hover:scale-105"
          >
            <Plus size={15} /> Create New Trip
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search trips by destination or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#0a101f] border border-[#1c2942] text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card rounded-3xl p-6 h-56 animate-pulse bg-[#0a101f]/60 border border-[#1c2942]"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && trips.length === 0 && (
          <div className="glass-card rounded-3xl p-10 lg:p-16 text-center space-y-5 border border-[#1c2942]">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-xl shadow-blue-950/40">
              <PlaneTakeoff size={30} />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl font-bold text-white">No protected journeys yet</h2>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Add your upcoming trip to start real-time multi-modal monitoring. When delays occur,
                TripRescue detects broken connections and recalculates recovery alternatives.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/create-trip"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/50 transition-all hover:scale-105"
              >
                <Plus size={15} /> Protect Your First Journey
              </Link>
            </div>
          </div>
        )}

        {/* Populated Trips Cards Grid */}
        {!loading && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((trip) => {
              const health = trip.trip_health_score ?? 100;
              const status = trip.status || 'ACTIVE';

              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}/dashboard`}
                  className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-blue-500/50 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          status === 'DISRUPTED'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : status === 'RECOVERED'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {status}
                      </span>

                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {health}% Health
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {trip.name}
                    </h3>

                    <div className="space-y-1.5 mt-2.5 text-xs text-[#94a3b8]">
                      {trip.destination && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-blue-400" />
                          <span>{trip.destination}</span>
                        </div>
                      )}
                      {(trip.start_date || trip.end_date) && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#64748b]" />
                          <span>
                            {trip.start_date} {trip.end_date ? `– ${trip.end_date}` : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-[#64748b]" />
                        <span>
                          {trip.traveler_count || 1} Travelers
                          {trip.booking_count !== undefined ? ` • ${trip.booking_count} Bookings` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1c2942] flex items-center justify-between text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>Open Dashboard</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
