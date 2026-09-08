'use client';

import { useState } from 'react';
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
  CheckCircle2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

const tripsList = [
  {
    id: 'trip_001',
    name: 'Manali Adventure',
    destination: 'Manali, Himachal Pradesh',
    dates: 'Sep 12 – 17, 2026',
    travelers: 2,
    bookingsCount: 6,
    health: 92,
    status: 'ACTIVE',
    badge: 'Protected & Monitored',
  },
  {
    id: 'trip_002',
    name: 'Goa Coastal Getaway',
    destination: 'North Goa, India',
    dates: 'Oct 24 – 28, 2026',
    travelers: 4,
    bookingsCount: 4,
    health: 96,
    status: 'ACTIVE',
    badge: 'Stable',
  },
  {
    id: 'trip_003',
    name: 'Ladakh High Altitude Circuit',
    destination: 'Leh & Pangong Tso',
    dates: 'Jul 10 – 18, 2026',
    travelers: 2,
    bookingsCount: 8,
    health: 98,
    status: 'RECOVERED',
    badge: 'Recovered via Alliance Air',
  },
];

export default function MyTripsPage() {
  const [search, setSearch] = useState('');

  const filtered = tripsList.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell activeTripName="All My Trips">
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

        {/* Trip Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}/dashboard`}
              className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:border-blue-500/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      trip.status === 'RECOVERED'
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {trip.badge}
                  </span>

                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {trip.health}% Health
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {trip.name}
                </h3>

                <div className="space-y-1.5 mt-2.5 text-xs text-[#94a3b8]">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-blue-400" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#64748b]" />
                    <span>{trip.dates}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-[#64748b]" />
                    <span>{trip.travelers} Travelers • {trip.bookingsCount} Bookings</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1c2942] flex items-center justify-between text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Open Command Center</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
