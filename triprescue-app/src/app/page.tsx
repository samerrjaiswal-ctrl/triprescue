'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import TripRescueBrand from '@/components/ui/TripRescueBrand';
import {
  Shield,
  ArrowRight,
  Sparkles,
  Zap,
  GitFork,
  Plane,
  Train,
  Building2,
  Car,
  Mountain,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-[#f8fafc] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 h-20 bg-[#080c14]/80 backdrop-blur-xl border-b border-[#162035] px-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <TripRescueBrand iconSize={42} wordmarkSize="md" />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/my-trips"
            className="text-xs font-bold text-[#94a3b8] hover:text-white transition-colors"
          >
            My Trips
          </Link>
          <Link
            href="/create-trip"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all hover:scale-105"
          >
            <span>Protect a Trip</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 px-6 lg:px-12 flex-1 flex flex-col justify-center items-center text-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25 shadow-sm"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Sparkles size={14} />
            Graph-Based Multi-Modal Travel Recovery Platform
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            When your trip breaks,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              we rebuild it.
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-[#94a3b8] max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            TripRescue models your entire multi-modal itinerary as a connected dependency graph. When a flight, train, or road delay strikes, we calculate downstream ripple effects in milliseconds and generate constraint-aware atomic recovery plans.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/create-trip"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-2xl shadow-indigo-950/80 transition-all hover:scale-105"
            >
              <Shield size={18} />
              <span>Protect My Trip</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/my-trips"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-[#cbd5e1] bg-[#0e1628] hover:bg-[#142038] border border-[#1c2942] transition-all"
            >
              View My Trips
            </Link>
          </motion.div>
        </div>

        {/* Interactive Visual Graph Preview */}
        <motion.div
          className="relative z-10 w-full max-w-5xl mx-auto mt-16 p-6 lg:p-8 rounded-3xl glass-card border-[#1c2942] shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between pb-6 border-b border-[#1c2942] mb-8 text-left">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                Real-Time Multi-Modal Architecture
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                Continuous Dependency Graph & Slack Protection
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              Continuous Monitoring
            </span>
          </div>

          {/* Node Flow Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-left">
            {[
              { icon: Plane, label: 'Flight Leg', from: 'Airport', to: 'Hub', status: 'MONITORED' },
              { icon: Car, label: 'Airport Transfer', from: 'Terminal', to: 'Hotel', status: 'PROTECTED (+45m slack)' },
              { icon: Building2, label: 'Hotel Booking', from: 'City Center', to: 'Stay', status: 'SECURED' },
              { icon: Train, label: 'Intercity Rail', from: 'Station A', to: 'Station B', status: 'BUFFERED (+90m slack)' },
              { icon: Car, label: 'Express Transit', from: 'Station', to: 'Destination', status: 'SAFE' },
              { icon: Mountain, label: 'Activity / Tour', from: 'Destination', to: 'Return', status: 'SAFEGUARDED' },
            ].map((item, idx) => {
              const Icon = item.icon;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border bg-[#080d1a] border-[#1c2942] text-[#94a3b8] hover:border-blue-500/40 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#141e33] flex items-center justify-center text-blue-400 mb-2">
                    <Icon size={16} />
                  </div>
                  <div className="text-xs font-bold text-white truncate">{item.label}</div>
                  <div className="text-[10px] text-[#64748b]">{item.from} → {item.to}</div>
                  <div className="text-[9px] font-mono font-bold mt-2 text-emerald-400 truncate">
                    {item.status}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-20 px-6 lg:px-12 border-t border-[#162035] bg-[#070b12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Built for chaotic travel reality
            </h2>
            <p className="text-sm text-[#94a3b8]">
              Traditional apps treat bookings as isolated tickets. TripRescue links them as a living constraint graph.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <GitFork size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">1. Instant Ripple Detection</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                A 30-minute flight delay isn't just 30 minutes. It eats into your transfer slack, causing you to miss your connecting train hours later. We calculate every downstream vulnerability instantly.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">2. Constraint-Aware Recovery</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Never sacrifice non-refundable hotel stays or bucket-list activities. Our solver respects your customized budget ceiling and preference toggles to preserve what matters most.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">3. Atomic Trip Restoration</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Choose between Cheapest, Best Overall, or Fastest. With one confirmation click, all replacements are locked in, refunds are reconciled, and your Trip Health restores to 98%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-[#162035] text-center text-xs text-[#64748b]">
        TripRescue © 2026 • Intelligent Travel Disruption Recovery Platform
      </footer>
    </div>
  );
}
