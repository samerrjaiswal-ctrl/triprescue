'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard,
  RefreshCw,
  Clock,
  RotateCcw,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { demoTrip, demoRecoveryPlans } from '@/lib/data';

export default function RecoveryConfirmationPage() {
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);
  const selectedPlan = demoRecoveryPlans[0]; // Best Overall

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const { applyRecoveryPlan } = await import('@/lib/api');
      await applyRecoveryPlan(selectedPlan.id, 'trip_001');
    } catch (e) {
      console.error(e);
    }
    router.push('/trips/trip_001/updated');
  };

  return (
    <AppShell activeTripId={demoTrip.id} activeTripName={demoTrip.name}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Breadcrumb */}
        <div>
          <Link
            href="/trips/trip_001/recovery-plans"
            className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Recovery Options
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/15 px-3 py-1 rounded-full border border-blue-500/30">
              Step 4: Final Execution
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-2">
            Confirm & Execute Trip Recovery
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Review the automated booking swaps and financial reconciliation before finalizing.
          </p>
        </div>

        {/* Selected Plan Summary Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#141e38] via-[#10172b] to-[#0a101f] border border-blue-500/40 p-6 lg:p-7 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-xs font-extrabold uppercase text-blue-400 tracking-wider">
                Selected Plan
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{selectedPlan.title}</h2>
            <p className="text-xs text-[#94a3b8] mt-1">{selectedPlan.rationale}</p>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xs text-[#94a3b8]">Net Added Cost</div>
            <div className="text-3xl font-black text-white mt-0.5">
              +₹{selectedPlan.additional_cost.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Itinerary Diff: What Changes vs What Stays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Changed Bookings */}
          <div className="glass-card rounded-3xl p-6 border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2942]">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <RotateCcw size={16} />
                <span>2 Bookings Modified</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                Action Required
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942] text-xs space-y-1">
                <div className="line-through text-[#64748b]">
                  Delhi → Chandigarh Shatabdi (05:00 PM)
                </div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-blue-400" />
                  Delhi → Chandigarh Vande Bharat (07:15 PM)
                </div>
                <div className="text-[11px] text-blue-400 font-mono">+₹900 fare adjustment</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942] text-xs space-y-1">
                <div className="line-through text-[#64748b]">
                  Chandigarh → Manali Overnight Volvo (11:00 PM)
                </div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ArrowRight size={13} className="text-blue-400" />
                  Chandigarh → Manali Private Cab (11:00 PM)
                </div>
                <div className="text-[11px] text-blue-400 font-mono">+₹1,200 private transfer</div>
              </div>
            </div>
          </div>

          {/* Preserved Bookings */}
          <div className="glass-card rounded-3xl p-6 border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2942]">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <ShieldCheck size={16} />
                <span>4 Bookings 100% Preserved</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                Safe & Intact
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-[#cbd5e1]">
              <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942] flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                <span>Hotel The Imperial, New Delhi (Luggage & Day-use)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942] flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                <span>Solang Valley Paragliding (10:00 AM Slot Guaranteed)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942] flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                <span>Airport Ground Transfer (Shifted to 5:30 PM)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Transparency Ledger */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#1c2942] pb-4">
            <CreditCard size={18} className="text-blue-400" />
            Financial Reconciliation Ledger
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-[#94a3b8]">
              <span>New Booking Charges (Vande Bharat + Private Mountain Cab)</span>
              <span className="font-mono text-white">₹2,600.00</span>
            </div>

            <div className="flex items-center justify-between text-emerald-400">
              <span>Automatic Cancellation Refund (IRCTC Shatabdi 12005)</span>
              <span className="font-mono">-₹500.00</span>
            </div>

            <div className="pt-3 border-t border-[#1c2942] flex items-center justify-between text-base font-black text-white">
              <span>Net Additional Charge to Card</span>
              <span className="text-blue-400">₹2,100.00</span>
            </div>
          </div>
        </div>

        {/* Confirm Action */}
        <div className="pt-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 shadow-2xl shadow-blue-950/60 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Executing Rebooking APIs & Recalculating Graph...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>Confirm & Apply Recovery (Restore Trip Health)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
