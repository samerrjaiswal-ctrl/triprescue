'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Sliders,
  Sparkles,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { demoBookings, demoTrip } from '@/lib/data';

const disruptionTypes = [
  {
    type: 'DELAY',
    icon: Clock,
    title: 'Flight Delay',
    desc: 'Late departure or air traffic hold',
    defaultMinutes: 300,
    accent: '#f59e0b',
  },
  {
    type: 'CANCELLATION',
    icon: Plane,
    title: 'Flight Cancelled',
    desc: 'Flight completely scrubbed by carrier',
    defaultMinutes: 720,
    accent: '#ef4444',
  },
  {
    type: 'WEATHER',
    icon: CloudRain,
    title: 'Severe Weather',
    desc: 'Heavy fog, rain, or mountain landslides',
    defaultMinutes: 360,
    accent: '#6366f1',
  },
  {
    type: 'HOTEL',
    icon: Building2,
    title: 'Hotel Booking Cancelled',
    desc: 'Property overbooked or check-in issue',
    defaultMinutes: 0,
    accent: '#ec4899',
  },
];

export default function DisruptionCenter() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('DELAY');
  const [selectedBookingId, setSelectedBookingId] = useState('bk_1');
  const [delayMinutes, setDelayMinutes] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBooking = demoBookings.find((b) => b.id === selectedBookingId) || demoBookings[0];
  const delayHours = (delayMinutes / 60).toFixed(1);

  const handleRunAnalysis = async () => {
    setIsSubmitting(true);
    try {
      const { reportDisruption } = await import('@/lib/api');
      await reportDisruption('trip_001', {
        booking_id: selectedBookingId,
        type: selectedType,
        delay_minutes: delayMinutes,
        description: `Delay on ${selectedBooking.title}`,
      });
    } catch (e) {
      console.error(e);
    }
    router.push('/trips/trip_001/impact');
  };

  return (
    <AppShell activeTripId={demoTrip.id} activeTripName={demoTrip.name}>
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
            Specify the travel delay or cancellation to run real-time dependency cascade analysis.
          </p>
        </div>

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
                className={`p-5 rounded-2xl text-left transition-all border ${
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
              Affected Booking Node
            </label>
            <div className="grid grid-cols-1 gap-2">
              {demoBookings.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedBookingId === b.id
                      ? 'bg-blue-600/15 border-blue-500 text-white font-semibold'
                      : 'bg-[#080d1a] border-[#1c2942] text-[#94a3b8] hover:border-[#2e3e60]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#141e33] flex items-center justify-center text-xs font-mono font-bold text-blue-400">
                      {b.code}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white">{b.title}</div>
                      <div className="text-xs text-[#94a3b8]">{b.provider}</div>
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
                <span>5 hours (Recommended Demo)</span>
                <span>8 hours</span>
              </div>
            </div>
          )}

          {/* Time Impact Preview */}
          <div className="p-4 rounded-2xl bg-[#080d1a] border border-[#1c2942] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                Predicted Arrival Shift
              </span>
              <div className="flex items-center gap-2.5 text-sm font-bold text-white mt-1">
                <span className="line-through text-[#64748b]">12:00 PM</span>
                <ArrowRight size={14} className="text-rose-400" />
                <span className="text-rose-400 text-base">05:00 PM Arrival</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                Cascade Scope
              </span>
              <div className="text-sm font-black text-amber-400 mt-1">
                5 Downstream Nodes Affected
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              onClick={handleRunAnalysis}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-xl shadow-rose-950/60 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
            >
              <Zap size={17} className={isSubmitting ? 'animate-spin' : ''} />
              {isSubmitting ? 'Computing Cascade Ripple...' : 'Run Ripple Cascade Analysis'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
