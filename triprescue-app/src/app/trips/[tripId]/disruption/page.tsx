'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Clock,
  Plane,
  Building2,
  CloudRain,
  AlertTriangle,
  ArrowRight,
  Zap,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchTrip, fetchBookings, reportDisruption } from '@/lib/api';

const disruptionTypes = [
  {
    type: 'DELAY',
    icon: Clock,
    title: 'Carrier Delay',
    desc: 'Late departure or air traffic/rail hold',
    defaultMinutes: 180,
    accent: '#f59e0b',
  },
  {
    type: 'CANCELLATION',
    icon: Plane,
    title: 'Service Cancelled',
    desc: 'Trip segment completely cancelled by operator',
    defaultMinutes: 480,
    accent: '#ef4444',
  },
  {
    type: 'WEATHER',
    icon: CloudRain,
    title: 'Severe Weather',
    desc: 'Heavy fog, rain, snow, or road closure',
    defaultMinutes: 240,
    accent: '#6366f1',
  },
  {
    type: 'HOTEL',
    icon: Building2,
    title: 'Accommodation Issue',
    desc: 'Property overbooked or check-in canceled',
    defaultMinutes: 0,
    accent: '#ec4899',
  },
];

interface BookingItem {
  id: string;
  type: string;
  title: string;
  provider?: string;
  start_time: string;
  cost?: number;
}

export default function DisruptionCenter() {
  const router = useRouter();
  const params = useParams();
  const tripId = (params?.tripId as string) || '';

  const [trip, setTrip] = useState<any>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState('DELAY');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(180);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!tripId) return;
      setLoading(true);
      try {
        const [tripRes, bksRes] = await Promise.all([
          fetchTrip(tripId),
          fetchBookings(tripId),
        ]);
        if (tripRes) setTrip(tripRes.trip || tripRes);
        const list = bksRes?.bookings || [];
        setBookings(list);
        if (list.length > 0) {
          setSelectedBookingId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tripId]);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const delayHours = (delayMinutes / 60).toFixed(1);

  const handleRunAnalysis = async () => {
    if (!selectedBookingId) {
      setError('Please select an affected booking segment.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await reportDisruption(tripId, {
        booking_id: selectedBookingId,
        type: selectedType,
        delay_minutes: delayMinutes,
        description: `${selectedType} on ${selectedBooking?.title || 'booking'}`,
      });
      router.push(`/trips/${tripId}/impact`);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to run cascade analysis.');
      setIsSubmitting(false);
    }
  };

  const tripName = trip?.name || 'Trip Recovery';

  return (
    <AppShell activeTripId={tripId} activeTripName={tripName}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 mb-3">
            <AlertTriangle size={13} />
            Step 1: Anomaly Ingestion
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            What disruption has occurred?
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Specify the delay or anomaly to run real-time dependency cascade analysis across your itinerary.
          </p>
        </div>

        {/* Empty Bookings State */}
        {!loading && bookings.length === 0 && (
          <div className="glass-card rounded-3xl p-10 text-center space-y-4 border border-[#1c2942]">
            <AlertTriangle size={32} className="text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Bookings In Itinerary</h3>
            <p className="text-xs text-[#94a3b8] max-w-md mx-auto">
              You need at least one scheduled flight, train, or stay in this trip before running disruption analysis.
            </p>
            <div className="pt-2">
              <Link
                href={`/trips/${tripId}/add-bookings`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all"
              >
                <Plus size={14} /> Add Bookings First
              </Link>
            </div>
          </div>
        )}

        {/* Disruption Form */}
        {!loading && bookings.length > 0 && (
          <>
            {/* Disruption Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {disruptionTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedType === item.type;

                return (
                  <motion.button
                    key={item.type}
                    onClick={() => {
                      setSelectedType(item.type);
                      setDelayMinutes(item.defaultMinutes);
                    }}
                    className={`p-5 rounded-2xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#151c30] border-blue-500 shadow-xl shadow-blue-900/30 ring-1 ring-blue-500'
                        : 'bg-[#0a101f] border-[#1c2942] hover:border-[#2e3e60]'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white"
                      style={{ backgroundColor: `${item.accent}25`, border: `1px solid ${item.accent}40` }}
                    >
                      <Icon size={20} style={{ color: item.accent }} />
                    </div>
                    <div className="font-bold text-sm text-white">{item.title}</div>
                    <div className="text-[11px] text-[#94a3b8] mt-1 leading-relaxed">
                      {item.desc}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Details Form Card */}
            <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6">
              <h3 className="text-base font-bold text-white border-b border-[#1c2942] pb-4">
                Disruption Parameters
              </h3>

              {/* Booking Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-2">
                  Affected Booking Segment
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBookingId(b.id)}
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                        selectedBookingId === b.id
                          ? 'bg-blue-600/15 border-blue-500 text-white font-semibold shadow-md shadow-blue-950/40'
                          : 'bg-[#080d1a] border-[#1c2942] text-[#94a3b8] hover:border-[#2e3e60]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#141e33] flex items-center justify-center text-xs font-mono font-bold text-blue-400 uppercase">
                          {b.type.slice(0, 3)}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white">{b.title}</div>
                          <div className="text-xs text-[#94a3b8]">
                            {b.start_time} {b.provider ? `• ${b.provider}` : ''}
                          </div>
                        </div>
                      </div>

                      {selectedBookingId === b.id && (
                        <CheckCircle2 size={18} className="text-blue-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Delay Slider */}
              {selectedType === 'DELAY' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                      Delay Duration
                    </label>
                    <span className="text-sm font-black text-amber-400 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      {delayMinutes} Minutes ({delayHours} Hours)
                    </span>
                  </div>

                  <input
                    type="range"
                    min={30}
                    max={480}
                    step={30}
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(Number(e.target.value))}
                    className="w-full h-2 bg-[#162238] rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-[#64748b]">
                    <span>30 mins</span>
                    <span>2 hours</span>
                    <span>5 hours</span>
                    <span>8 hours</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  onClick={handleRunAnalysis}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-xl shadow-rose-950/60 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                >
                  <Zap size={17} className={isSubmitting ? 'animate-spin' : ''} />
                  {isSubmitting ? 'Computing Ripple Cascade...' : 'Run Ripple Cascade Analysis'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
