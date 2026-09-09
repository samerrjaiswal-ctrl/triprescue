'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Coins,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

import { createTrip } from '@/lib/api';

export default function CreateTripPage() {
  const router = useRouter();
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('2026-09-15');
  const [endDate, setEndDate] = useState('2026-09-20');
  const [travelers, setTravelers] = useState(2);
  const [budgetCeiling, setBudgetCeiling] = useState(5000);
  const [strategy, setStrategy] = useState<'best_overall' | 'cheapest' | 'fastest'>('best_overall');

  const [avoidHotels, setAvoidHotels] = useState(true);
  const [protectActivities, setProtectActivities] = useState(true);
  const [avoidOvernight, setAvoidOvernight] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim() || !destination.trim() || !startDate || !endDate) {
      setError('Please fill in trip name, destination, and dates.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const res = await createTrip({
        name: tripName.trim(),
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        traveler_count: travelers,
        budget_ceiling: budgetCeiling,
        recovery_strategy: strategy,
        preferences: {
          avoid_changing_hotels: avoidHotels,
          protect_important_activities: protectActivities,
          avoid_overnight_travel: avoidOvernight,
        },
      });
      const newTripId = res?.id || res?.trip?.id;
      if (newTripId) {
        router.push(`/trips/${newTripId}/add-bookings`);
      } else {
        throw new Error('Trip creation returned invalid ID');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to create trip. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell activeTripName="New Trip Setup">

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-3">
            <Sparkles size={13} />
            Step 1 of 3: Trip Parameters
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Create your connected journey
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Tell us about your itinerary dates and preferences. TripRescue will model dependencies automatically.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 lg:p-8 space-y-7 shadow-2xl">
          {/* Section 1: Trip Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
              1. Trip Overview
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#cbd5e1] mb-1.5">
                Trip Name
              </label>
              <input
                type="text"
                placeholder="e.g. Goa Vacation 2026, Kashmir Winter Expedition"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#cbd5e1] mb-1.5">
                  Primary Destination
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-[#64748b]" />
                  <input
                    type="text"
                    placeholder="e.g. North Goa, Leh Ladakh, Manali"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#cbd5e1] mb-1.5">
                  Traveler Count
                </label>
                <div className="relative">
                  <Users size={16} className="absolute left-3.5 top-3.5 text-[#64748b]" />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#cbd5e1] mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#cbd5e1] mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#080d1a] border border-[#1c2942] text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Budget Ceiling */}
          <div className="pt-6 border-t border-[#1c2942] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                2. Maximum Recovery Budget Ceiling
              </h3>
              <span className="text-base font-black text-white px-3 py-1 rounded-xl bg-[#141e33] border border-[#1e2d4d]">
                ₹{budgetCeiling.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min={1000}
              max={25000}
              step={500}
              value={budgetCeiling}
              onChange={(e) => setBudgetCeiling(Number(e.target.value))}
              className="w-full h-2 bg-[#162238] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-[11px] text-[#94a3b8]">
              Maximum out-of-pocket cash TripRescue is allowed to allocate when booking emergency replacement legs.
            </p>
          </div>

          {/* Section 3: Recovery Strategy */}
          <div className="pt-6 border-t border-[#1c2942] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
              3. Default Recovery Strategy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'best_overall', title: 'Best Overall', desc: 'Balances budget with activity protection' },
                { id: 'cheapest', title: 'Cheapest', desc: 'Minimizes additional out-of-pocket costs' },
                { id: 'fastest', title: 'Fastest', desc: 'Zero vacation time lost, maximum comfort' },
              ].map((s) => (
                <div
                  key={s.id}
                  onClick={() => setStrategy(s.id as any)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    strategy === s.id
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-900/30'
                      : 'bg-[#080d1a] border-[#1c2942] text-[#94a3b8] hover:border-[#2e3e60]'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{s.title}</div>
                  <div className="text-[11px] text-[#94a3b8] mt-1">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Hard Constraints & Protection Toggles */}
          <div className="pt-6 border-t border-[#1c2942] space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-2">
              4. Vacation Protection Toggles
            </h3>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942] cursor-pointer">
              <span className="text-xs font-semibold text-white">
                Protect non-refundable hotel stays from cancellation
              </span>
              <input
                type="checkbox"
                checked={avoidHotels}
                onChange={(e) => setAvoidHotels(e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942] cursor-pointer">
              <span className="text-xs font-semibold text-white">
                Protect booked activities (Paragliding, Trekking, Tours)
              </span>
              <input
                type="checkbox"
                checked={protectActivities}
                onChange={(e) => setProtectActivities(e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942] cursor-pointer">
              <span className="text-xs font-semibold text-white">
                Avoid overnight transit changes whenever possible
              </span>
              <input
                type="checkbox"
                checked={avoidOvernight}
                onChange={(e) => setAvoidOvernight(e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded"
              />
            </label>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-sm font-black text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 shadow-xl shadow-blue-900/50 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>{isSubmitting ? 'Creating Journey Graph...' : 'Continue to Add Bookings'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
