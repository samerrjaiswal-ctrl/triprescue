'use client';

import Sidebar from './Sidebar';
import Link from 'next/link';
import {
  Bell,
  Search,
  AlertTriangle,
  Zap,
  MapPin,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  activeTripId?: string;
  activeTripName?: string;
}

export default function AppShell({
  children,
  activeTripId,
  activeTripName,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#080c14] text-[#f8fafc]">
      {/* Sticky Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Command Bar */}
        <header className="sticky top-0 z-20 h-16 bg-[#080c14]/90 backdrop-blur-md border-b border-[#162035] px-6 lg:px-10 flex items-center justify-between gap-4">
          {/* Left: Breadcrumbs & Active Trip Selector */}
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/my-trips"
              className="text-[#94a3b8] hover:text-white transition-colors"
            >
              Trips
            </Link>
            {activeTripName && (
              <>
                <ChevronRight size={14} className="text-[#475569]" />
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1e293b]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-white">{activeTripName}</span>
                  {activeTripId && (
                    <span className="text-[10px] text-[#64748b] font-mono">
                      ({activeTripId})
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right: Actions & User Tools */}
          <div className="flex items-center gap-3">
            {activeTripId ? (
              <>
                <Link
                  href={`/trips/${activeTripId}/disruption`}
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                >
                  <AlertTriangle size={14} className="text-rose-400" />
                  <span>Report Disruption</span>
                </Link>

                <Link
                  href={`/trips/${activeTripId}/recovery-plans`}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all"
                >
                  <Zap size={14} className="text-blue-400" />
                  <span>Recovery Plans</span>
                </Link>
              </>
            ) : (
              <Link
                href="/create-trip"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all"
              >
                <span>+ Protect New Trip</span>
              </Link>
            )}

            {/* Notification Bell */}
            <div className="relative p-2 rounded-xl bg-[#101729] border border-[#162035] text-[#94a3b8] hover:text-white cursor-pointer">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
            </div>

            {/* Profile Avatar */}
            <Link
              href="/settings"
              className="flex items-center gap-2 pl-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-900/30 border border-blue-400/30">
                S
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Page View Container */}
        <main className="flex-1 w-full max-w-[1500px] mx-auto px-6 lg:px-10 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
