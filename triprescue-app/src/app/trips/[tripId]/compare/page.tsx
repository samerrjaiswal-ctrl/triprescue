'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Coins,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { fetchTrip } from '@/lib/api';

interface ComparisonRow {
  dimension: string;
  cheapest: string;
  bestOverall: string;
  fastest: string;
  highlightBest?: boolean;
}

const comparisonData: ComparisonRow[] = [
  {
    dimension: 'Additional Out-of-Pocket',
    cheapest: '₹1,200',
    bestOverall: '₹2,600',
    fastest: '₹4,800',
    highlightBest: true,
  },
  {
    dimension: 'Total Vacation Delay',
    cheapest: '+5.0 hours',
    bestOverall: '+1.5 hours',
    fastest: '0 hours (On Time)',
    highlightBest: true,
  },
  {
    dimension: 'Itinerary Preservation',
    cheapest: '75%',
    bestOverall: '92%',
    fastest: '100%',
    highlightBest: true,
  },
  {
    dimension: 'Non-Refundable Hotel',
    cheapest: 'Preserved',
    bestOverall: 'Preserved',
    fastest: 'Preserved',
    highlightBest: true,
  },
  {
    dimension: 'Protected Activities',
    cheapest: 'Rescheduled',
    bestOverall: 'Preserved (100%)',
    fastest: 'Preserved (100%)',
    highlightBest: true,
  },
  {
    dimension: 'Transit Comfort Level',
    cheapest: 'Standard Rail/Bus',
    bestOverall: 'Express Air/Cab',
    fastest: 'Direct Premium Flight',
    highlightBest: false,
  },
  {
    dimension: 'Booking Changes Required',
    cheapest: '3 Segments Rebooked',
    bestOverall: '2 Segments Rebooked',
    fastest: '1 Segment Rebooked',
    highlightBest: false,
  },
];

export default function PlanComparisonPage() {
  const params = useParams();
  const tripId = (params?.tripId as string) || '';

  const [trip, setTrip] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (!tripId) return;
      try {
        const res = await fetchTrip(tripId);
        if (res) setTrip(res.trip || res);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [tripId]);

  const tripName = trip?.name || 'Comparison Matrix';

  return (
    <AppShell activeTripId={tripId} activeTripName={tripName}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href={`/trips/${tripId}/recovery-plans`}
              className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Recovery Plans
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Side-by-Side Trade-off Analysis
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Evaluate financial cost against vacation time and preserved experiences.
            </p>
          </div>

          <Link
            href={`/trips/${tripId}/confirm?plan=plan_best`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all hover:scale-105"
          >
            <Sparkles size={14} /> Select Best Overall
          </Link>
        </div>

        {/* Matrix Table */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-[#1c2942]">
                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-[#64748b] w-1/4">
                  Evaluation Dimension
                </th>
                <th className="py-4 px-4 text-center w-1/4">
                  <div className="text-sm font-bold text-emerald-400">Cheapest</div>
                  <div className="text-[11px] text-[#94a3b8]">Budget Connection</div>
                </th>
                <th className="py-4 px-4 text-center w-1/4 bg-blue-600/10 rounded-t-2xl border-t border-x border-blue-500/40 relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow">
                    Optimal
                  </span>
                  <div className="text-sm font-black text-blue-400">Best Overall</div>
                  <div className="text-[11px] text-[#94a3b8]">Balanced Trade-off</div>
                </th>
                <th className="py-4 px-4 text-center w-1/4">
                  <div className="text-sm font-bold text-purple-400">Fastest</div>
                  <div className="text-[11px] text-[#94a3b8]">Direct Express</div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1c2942]/60 text-xs">
              {comparisonData.map((row, idx) => (
                <tr
                  key={row.dimension}
                  className={`hover:bg-[#101729]/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-[#080d1a]/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {row.dimension}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[#cbd5e1]">
                    {row.cheapest}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-300 bg-blue-600/10 border-x border-blue-500/40">
                    {row.bestOverall}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[#cbd5e1]">
                    {row.fastest}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td className="py-6 px-4" />
                <td className="py-6 px-4 text-center">
                  <Link
                    href={`/trips/${tripId}/confirm?plan=plan_cheapest`}
                    className="inline-block py-2 px-4 rounded-xl text-xs font-bold text-[#94a3b8] hover:text-white bg-[#141e33] border border-[#1e2d4d] transition-all"
                  >
                    Select Plan
                  </Link>
                </td>
                <td className="py-6 px-4 text-center bg-blue-600/10 rounded-b-2xl border-x border-b border-blue-500/40">
                  <Link
                    href={`/trips/${tripId}/confirm?plan=plan_best`}
                    className="inline-block py-2.5 px-5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-900/50 transition-all hover:scale-105"
                  >
                    Choose Best Overall
                  </Link>
                </td>
                <td className="py-6 px-4 text-center">
                  <Link
                    href={`/trips/${tripId}/confirm?plan=plan_fastest`}
                    className="inline-block py-2 px-4 rounded-xl text-xs font-bold text-[#94a3b8] hover:text-white bg-[#141e33] border border-[#1e2d4d] transition-all"
                  >
                    Select Plan
                  </Link>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
