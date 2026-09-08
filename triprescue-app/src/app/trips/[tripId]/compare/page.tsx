'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  Coins,
  ShieldCheck,
  Star,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { demoTrip } from '@/lib/data';

const comparisonDimensions = [
  {
    name: 'Net Additional Expense',
    cheapest: '₹850',
    best: '₹2,100',
    fastest: '₹4,600',
    highlightBest: true,
  },
  {
    name: 'Arrival Delay in Manali',
    cheapest: '+4.5 hours delay',
    best: '+1.2 hours delay',
    fastest: '0 hours (On Time)',
    highlightBest: true,
  },
  {
    name: 'Itinerary Preserved',
    cheapest: '76% Preserved',
    best: '94% Preserved',
    fastest: '100% Preserved',
    highlightBest: true,
  },
  {
    name: 'The Imperial Hotel Stay',
    cheapest: false,
    best: true,
    fastest: true,
    highlightBest: true,
  },
  {
    name: '10:00 AM Paragliding Session',
    cheapest: false,
    best: true,
    fastest: true,
    highlightBest: true,
  },
  {
    name: 'Convenience Score',
    cheapest: '3.2 / 5.0',
    best: '4.8 / 5.0',
    fastest: '5.0 / 5.0',
    highlightBest: true,
  },
  {
    name: 'Bookings Modified',
    cheapest: '3 Bookings Changed',
    best: '2 Bookings Changed',
    fastest: '2 Bookings Changed',
    highlightBest: false,
  },
];

export default function PlanComparisonPage() {
  return (
    <AppShell activeTripId={demoTrip.id} activeTripName={demoTrip.name}>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/trips/trip_001/recovery-plans"
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
            href="/trips/trip_001/confirm?plan=plan_best"
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
                  <div className="text-[11px] text-[#94a3b8]">Overnight Bus</div>
                </th>
                <th className="py-4 px-4 text-center w-1/4 bg-blue-600/10 rounded-t-2xl border-x border-t border-blue-500/40">
                  <div className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 mb-1">
                    <Sparkles size={11} /> Recommended
                  </div>
                  <div className="text-sm font-black text-white">Best Overall</div>
                  <div className="text-[11px] text-blue-200">Vande Bharat & Cab</div>
                </th>
                <th className="py-4 px-4 text-center w-1/4">
                  <div className="text-sm font-bold text-purple-400">Fastest</div>
                  <div className="text-[11px] text-[#94a3b8]">Direct Flight</div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1c2942] text-sm">
              {comparisonDimensions.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#101729]/50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-white">
                    {row.name}
                  </td>

                  {/* Cheapest */}
                  <td className="py-4 px-4 text-center text-[#cbd5e1]">
                    {typeof row.cheapest === 'boolean' ? (
                      row.cheapest ? (
                        <Check size={18} className="text-emerald-400 mx-auto" />
                      ) : (
                        <X size={18} className="text-rose-400 mx-auto" />
                      )
                    ) : (
                      row.cheapest
                    )}
                  </td>

                  {/* Best Overall (Highlighted column) */}
                  <td className="py-4 px-4 text-center font-bold text-white bg-blue-600/10 border-x border-blue-500/40">
                    {typeof row.best === 'boolean' ? (
                      row.best ? (
                        <Check size={18} className="text-emerald-400 mx-auto" />
                      ) : (
                        <X size={18} className="text-rose-400 mx-auto" />
                      )
                    ) : (
                      <span className="text-blue-300">{row.best}</span>
                    )}
                  </td>

                  {/* Fastest */}
                  <td className="py-4 px-4 text-center text-[#cbd5e1]">
                    {typeof row.fastest === 'boolean' ? (
                      row.fastest ? (
                        <Check size={18} className="text-emerald-400 mx-auto" />
                      ) : (
                        <X size={18} className="text-rose-400 mx-auto" />
                      )
                    ) : (
                      row.fastest
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td className="py-6 px-4" />
                <td className="py-6 px-4 text-center">
                  <Link
                    href="/trips/trip_001/confirm?plan=plan_cheapest"
                    className="inline-block py-2 px-4 rounded-xl text-xs font-bold text-[#94a3b8] hover:text-white bg-[#141e33] border border-[#1e2d4d] transition-all"
                  >
                    Select Plan
                  </Link>
                </td>
                <td className="py-6 px-4 text-center bg-blue-600/10 rounded-b-2xl border-x border-b border-blue-500/40">
                  <Link
                    href="/trips/trip_001/confirm?plan=plan_best"
                    className="inline-block py-2.5 px-5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-900/50 transition-all hover:scale-105"
                  >
                    Choose Best Overall
                  </Link>
                </td>
                <td className="py-6 px-4 text-center">
                  <Link
                    href="/trips/trip_001/confirm?plan=plan_fastest"
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
