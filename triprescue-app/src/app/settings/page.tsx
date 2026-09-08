'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  CheckCircle2,
  Shield,
  Bell,
  Coins,
  Cpu,
  User,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [strategy, setStrategy] = useState('best_overall');
  const [budgetCeiling, setBudgetCeiling] = useState(5000);
  const [avoidHotels, setAvoidHotels] = useState(true);
  const [protectActivities, setProtectActivities] = useState(true);
  const [aiExplanations, setAiExplanations] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell activeTripName="Settings & Preferences">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Configure global AI recovery trade-offs, budget controls, and alert channels.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all hover:scale-105"
          >
            {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
            <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>

        {/* Section 1: Recovery Strategy & Budget */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#1c2942] pb-4">
            <Coins size={18} className="text-blue-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Recovery Solver Strategy & Budget
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3">
              Default Optimization Archetype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'best_overall', title: 'Best Overall', desc: 'Balances budget with activity preservation' },
                { id: 'cheapest', title: 'Cheapest', desc: 'Minimizes out-of-pocket cash costs' },
                { id: 'fastest', title: 'Fastest', desc: 'Zero delay, direct airline reroutes' },
              ].map((s) => (
                <div
                  key={s.id}
                  onClick={() => setStrategy(s.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    strategy === s.id
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-900/30'
                      : 'bg-[#080d1a] border-[#1c2942] text-[#94a3b8] hover:border-[#2e3e60]'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{s.title}</div>
                  <div className="text-[11px] text-[#94a3b8] mt-1">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                Emergency Budget Ceiling
              </label>
              <span className="text-sm font-black text-white px-3 py-1 rounded-lg bg-[#141e33] border border-[#1e2d4d]">
                ₹{budgetCeiling.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={25000}
              step={500}
              value={budgetCeiling}
              onChange={(e) => setBudgetCeiling(Number(e.target.value))}
              className="w-full h-2 bg-[#162238] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Section 2: Hard Constraint Protection */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#1c2942] pb-4">
            <Shield size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Hard Constraint Locks
            </h3>
          </div>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#080d1a] border border-[#1c2942] cursor-pointer">
            <div>
              <div className="text-xs font-bold text-white">Lock Hotel Bookings</div>
              <div className="text-[11px] text-[#94a3b8]">Prevent AI solver from dropping luxury hotel stays</div>
            </div>
            <input
              type="checkbox"
              checked={avoidHotels}
              onChange={(e) => setAvoidHotels(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#080d1a] border border-[#1c2942] cursor-pointer">
            <div>
              <div className="text-xs font-bold text-white">Lock Bucket-List Activities</div>
              <div className="text-[11px] text-[#94a3b8]">Guarantees preservation of non-refundable adventure slots</div>
            </div>
            <input
              type="checkbox"
              checked={protectActivities}
              onChange={(e) => setProtectActivities(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded"
            />
          </label>
        </div>

        {/* Section 3: AI & Communication */}
        <div className="glass-card rounded-3xl p-6 lg:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#1c2942] pb-4">
            <Cpu size={18} className="text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              AI Intelligence & Notifications
            </h3>
          </div>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#080d1a] border border-[#1c2942] cursor-pointer">
            <div>
              <div className="text-xs font-bold text-white">Display Causal AI Explanations</div>
              <div className="text-[11px] text-[#94a3b8]">Shows transparent reasoning behind why each plan is recommended</div>
            </div>
            <input
              type="checkbox"
              checked={aiExplanations}
              onChange={(e) => setAiExplanations(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#080d1a] border border-[#1c2942] cursor-pointer">
            <div>
              <div className="text-xs font-bold text-white">Instant SMS / WhatsApp Ripple Alerts</div>
              <div className="text-[11px] text-[#94a3b8]">Sends actionable recovery link the second an airline pushes a delay</div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded"
            />
          </label>
        </div>
      </div>
    </AppShell>
  );
}
