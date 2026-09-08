'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Download,
  Calendar,
  Sparkles,
  Plane,
  Train,
  Building2,
  Car,
  Mountain,
  Zap,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import TripHealthRing from '@/components/ui/TripHealthRing';
import StatusBadge from '@/components/ui/StatusBadge';
import { demoTrip } from '@/lib/data';

const recoveredBookings = [
  {
    type: 'FLIGHT',
    icon: Plane,
    title: 'Pune to New Delhi (Delayed Flight)',
    time: '10:00 AM → 05:00 PM',
    operator: 'IndiGo 6E-1234',
    status: 'CONFIRMED' as const,
    note: 'Landed safely with rebooking buffer accommodated',
  },
  {
    type: 'TRANSFER',
    icon: Car,
    title: 'Airport Transfer (Adjusted Pickup)',
    time: '05:30 PM → 06:15 PM',
    operator: 'Uber Premier Cab',
    status: 'REBOOKED' as const,
    note: 'Pickup rescheduled from 12:30 PM to 05:30 PM automatically',
  },
  {
    type: 'HOTEL',
    icon: Building2,
    title: 'Hotel The Imperial, New Delhi',
    time: '06:15 PM → 06:45 PM',
    operator: 'Heritage Room (Luggage Hold)',
    status: 'CONFIRMED' as const,
    note: 'Luggage picked up and quick freshen-up preserved',
  },
  {
    type: 'TRAIN',
    icon: Train,
    title: 'Delhi to Chandigarh (Vande Bharat Express)',
    time: '07:15 PM → 10:45 PM',
    operator: 'Train 22447 • Executive Chair',
    status: 'REBOOKED' as const,
    note: 'Successfully rebooked to evening express, zero connection stress',
  },
  {
    type: 'TRANSFER',
    icon: Car,
    title: 'Chandigarh to Manali (Private Mountain Cab)',
    time: '11:00 PM → 06:30 AM',
    operator: 'Dedicated Innova Crysta Cab',
    status: 'REBOOKED' as const,
    note: 'Replaced missed Volvo with private direct cab to Solang',
  },
  {
    type: 'ACTIVITY',
    icon: Mountain,
    title: 'Solang Valley Paragliding & Trek',
    time: '10:00 AM → 02:00 PM',
    operator: 'Himalayan Adventure Club',
    status: 'CONFIRMED' as const,
    note: 'Arrived at 06:30 AM with 3.5 hours of rest before flight time!',
  },
];

export default function UpdatedTripPage() {
  useEffect(() => {
    // Fire confetti on successful recovery load
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'],
    });
  }, []);

  return (
    <AppShell activeTripId={demoTrip.id} activeTripName={demoTrip.name}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Top Success Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/80 via-[#0d1c24] to-[#080d1a] border border-emerald-500/40 p-6 lg:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-950/50">
                <ShieldCheck size={30} />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-1.5">
                  <Sparkles size={12} />
                  Trip Feasibility Restored
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Your trip is back on track!
                </h1>
                <p className="text-xs text-emerald-200/80 mt-1 max-w-xl leading-relaxed">
                  All ripple cascade violations have been neutralized. Rebooking transactions completed and downstream buffer constraints are now 100% compliant.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center gap-3">
              <Link
                href="/trips/trip_001/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-950/60 transition-all hover:scale-105"
              >
                <span>Return to Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Health Transformation & Execution Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trip Health Before vs After Ring */}
          <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3">
              Health Score Recovery
            </div>
            <TripHealthRing score={98} previousScore={23} showComparison={true} size="lg" />
          </div>

          {/* Reconciliation Stats Card */}
          <div className="md:col-span-2 glass-card rounded-3xl p-6 lg:p-7 flex flex-col justify-between shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c2942] pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Execution Reconciliation
              </h3>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                Trip Status: STABLE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942]">
                <div className="text-[10px] uppercase font-bold text-[#64748b]">Modified</div>
                <div className="text-xl font-black text-blue-400 mt-0.5">2 Legs</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942]">
                <div className="text-[10px] uppercase font-bold text-[#64748b]">Preserved</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">4 Legs</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942]">
                <div className="text-[10px] uppercase font-bold text-[#64748b]">Net Cost</div>
                <div className="text-xl font-black text-white mt-0.5">+₹2,100</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942]">
                <div className="text-[10px] uppercase font-bold text-[#64748b]">Time Delay</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">+1.2 hrs</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942] flex items-center justify-between text-xs text-[#cbd5e1]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>IRCTC Refund Credit: ₹500 automatically returned to wallet</span>
              </span>
              <button
                onClick={() => alert('Recovery Summary PDF downloaded!')}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-400 hover:text-blue-300"
              >
                <Download size={13} />
                Download Receipt PDF
              </button>
            </div>
          </div>
        </div>

        {/* Recovered Itinerary Feed */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1c2942] pb-4">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Updated Connected Itinerary
              </h2>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                All 6 nodes synchronized and ready for travel
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              100% Validated
            </span>
          </div>

          <div className="space-y-3.5">
            {recoveredBookings.map((leg, idx) => {
              const Icon = leg.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#080d1a] border border-[#1c2942] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#141e33] border border-[#1e2d4d] text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{leg.title}</div>
                      <div className="text-xs text-[#94a3b8] mt-0.5">
                        {leg.time} • <span className="text-[#c0c1ff]">{leg.operator}</span>
                      </div>
                      <div className="text-[11px] text-emerald-400/90 mt-1">{leg.note}</div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between items-center gap-1.5 flex-shrink-0">
                    <StatusBadge status={leg.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
