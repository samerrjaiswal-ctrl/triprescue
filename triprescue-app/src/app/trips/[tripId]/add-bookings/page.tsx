'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Plane,
  Train,
  Car,
  Building2,
  Mountain,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Trash2,
  Clock,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { demoTrip, demoBookings } from '@/lib/data';

const bookingTypes = [
  { type: 'FLIGHT', icon: Plane, label: 'Flight' },
  { type: 'TRAIN', icon: Train, label: 'Train' },
  { type: 'HOTEL', icon: Building2, label: 'Hotel' },
  { type: 'TRANSFER', icon: Car, label: 'Transfer Cab' },
  { type: 'ACTIVITY', icon: Mountain, label: 'Activity' },
];

export default function AddBookingsPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [bookings, setBookings] = useState(demoBookings);

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert('AI extracted ticket: IndiGo 6E-1234 (Pune → Delhi, Seat 14A) successfully parsed!');
    }, 1200);
  };

  return (
    <AppShell activeTripId={demoTrip.id} activeTripName={demoTrip.name}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-2">
              <Sparkles size={13} />
              Step 2 of 3: Itinerary Ingestion
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Build your connected itinerary
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Add bookings manually or let our AI parser extract details from confirmation tickets.
            </p>
          </div>

          <Link
            href="/trips/trip_001/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all hover:scale-105"
          >
            <span>Finish & View Dashboard</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Dual Mode Ingestion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A: AI Upload Card */}
          <div className="glass-card rounded-3xl p-6 lg:p-7 flex flex-col justify-between space-y-4 border-dashed border-2 border-blue-500/40">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-blue-400 tracking-wider mb-2">
                <Sparkles size={15} />
                Option A: Fast AI Extraction
              </div>
              <h3 className="text-lg font-bold text-white">Upload Ticket / PDF</h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Drop your airline boarding pass, IRCTC train ticket, or hotel confirmation PDF/JPG.
              </p>
            </div>

            <div
              onClick={handleSimulateUpload}
              className="py-10 px-4 rounded-2xl bg-[#080d1a] border border-[#1c2942] flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500/60 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600/15 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-3">
                <UploadCloud size={24} />
              </div>
              <div className="text-sm font-bold text-white">
                {isUploading ? 'Parsing document with AI...' : 'Drop ticket files here or click to browse'}
              </div>
              <div className="text-[11px] text-[#64748b] mt-1">
                Supports PDF, Apple Wallet PKPass, JPG, PNG (Max 15MB)
              </div>
            </div>
          </div>

          {/* Option B: Manual Booking Types */}
          <div className="glass-card rounded-3xl p-6 lg:p-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-extrabold uppercase text-[#94a3b8] tracking-wider mb-2">
                Option B: Manual Input
              </div>
              <h3 className="text-lg font-bold text-white">Select Booking Category</h3>
              <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                Choose a transportation or lodging type to add a node to the dependency graph.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {bookingTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => alert(`Added ${item.label} form to itinerary!`)}
                    className="p-3.5 rounded-xl bg-[#080d1a] border border-[#1c2942] hover:border-blue-500 text-left transition-all hover:scale-102 group"
                  >
                    <Icon size={18} className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-bold text-white">{item.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Existing Sequenced Bookings List */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1c2942]">
            <div>
              <h3 className="text-lg font-bold text-white">Current Sequenced Legs</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">6 nodes linked into dependency graph</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Graph Feasible
            </span>
          </div>

          <div className="space-y-3">
            {bookings.map((b, idx) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-[#080d1a] border border-[#1c2942] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-8 h-8 rounded-lg bg-[#141e33] flex items-center justify-center text-xs font-mono font-bold text-blue-400">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">{b.title}</div>
                    <div className="text-xs text-[#94a3b8]">
                      {b.provider} • {b.code}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-[#cbd5e1]">
                    ₹{b.cost.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#1c2942]">
            <Link
              href="/trips/trip_001/dashboard"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-sm font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/50 transition-all hover:scale-[1.01]"
            >
              <span>Build My Connected Itinerary</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
