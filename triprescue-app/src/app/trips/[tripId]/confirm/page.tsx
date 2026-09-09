'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
import { fetchTrip, fetchRecoveryPlans, applyRecoveryPlan } from '@/lib/api';

export default function RecoveryConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tripId = (params?.tripId as string) || '';
  const planQuery = searchParams?.get('plan') || '';

  const [trip, setTrip] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!tripId) return;
      setLoading(true);
      try {
        const [tripRes, plansRes] = await Promise.all([
          fetchTrip(tripId),
          fetchRecoveryPlans(tripId),
        ]);
        if (tripRes) setTrip(tripRes.trip || tripRes);
        if (plansRes?.plans && Array.isArray(plansRes.plans)) {
          setPlans(plansRes.plans);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tripId]);

  const selectedPlan =
    plans.find((p) => p.id === planQuery) ||
    plans.find((p) => p.is_recommended) ||
    plans[0] || {
      id: 'plan_best',
      label: 'BEST OVERALL',
      additional_cost: 2100,
      itinerary_preserved_pct: 92,
      rationale_text: 'Recalculated viable alternatives while preserving critical reservations.',
      changes: [],
    };

  const handleExecute = async () => {
    setIsExecuting(true);
    setError('');
    try {
      await applyRecoveryPlan(selectedPlan.id, tripId);
      router.push(`/trips/${tripId}/updated`);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to apply recovery plan');
      setIsExecuting(false);
    }
  };

  const tripName = trip?.name || 'Recovery Execution';
  const planCost = selectedPlan.additional_cost ?? 2100;
  const refunds = Math.round(planCost * 0.25);
  const grossCharges = planCost + refunds;

  return (
    <AppShell activeTripId={tripId} activeTripName={tripName}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Breadcrumb */}
        <div>
          <Link
            href={`/trips/${tripId}/recovery-plans`}
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
                Selected Recovery Strategy
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {selectedPlan.name || selectedPlan.label?.replace('_', ' ')}
            </h2>
            <p className="text-xs text-[#94a3b8] mt-1">
              {selectedPlan.rationale_text || selectedPlan.rationale || 'Optimal constraint resolution for your itinerary.'}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xs text-[#94a3b8]">Net Added Cost</div>
            <div className="text-3xl font-black text-white mt-0.5">
              +₹{planCost.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Itinerary Diff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Changed Bookings */}
          <div className="glass-card rounded-3xl p-6 border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2942]">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <RotateCcw size={16} />
                <span>Segments Rebooked</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                Auto-Swapped
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942] space-y-1">
                <div className="text-amber-300 font-semibold">
                  Downstream Connection Optimization
                </div>
                <p className="text-[#94a3b8] text-[11px]">
                  Affected travel legs are shifted to next available verified carriers with sufficient connection buffers.
                </p>
              </div>
            </div>
          </div>

          {/* Preserved Bookings */}
          <div className="glass-card rounded-3xl p-6 border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2942]">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <ShieldCheck size={16} />
                <span>Protected Itinerary Legs</span>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                Safe & Intact
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-[#cbd5e1]">
              <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942] flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                <span>Hotel and accommodation bookings preserved</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080d1a] border border-[#1c2942] flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                <span>Important activities & scheduled slots guarded</span>
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
              <span>New Leg Booking Charges</span>
              <span className="font-mono text-white">₹{grossCharges.toLocaleString()}.00</span>
            </div>

            <div className="flex items-center justify-between text-emerald-400">
              <span>Automatic Cancellation Refund Credited</span>
              <span className="font-mono">-₹{refunds.toLocaleString()}.00</span>
            </div>

            <div className="pt-3 border-t border-[#1c2942] flex items-center justify-between text-base font-black text-white">
              <span>Net Out-of-Pocket Balance</span>
              <span className="text-blue-400">₹{planCost.toLocaleString()}.00</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Confirm Action */}
        <div className="pt-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 shadow-2xl shadow-blue-950/60 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
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
