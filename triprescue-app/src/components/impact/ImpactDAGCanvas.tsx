'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plane,
  Car,
  Building2,
  Train,
  Mountain,
  Zap,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Sliders,
  Layers,
  Activity,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  FLIGHT: Plane,
  TRANSFER: Car,
  HOTEL: Building2,
  TRAIN: Train,
  ACTIVITY: Mountain,
};

interface DAGNodeData {
  id: string;
  booking_id: string;
  type: string;
  title: string;
  code: string;
  carrier: string;
  origin: string;
  destination: string;
  scheduled_start: string;
  scheduled_end: string;
  buffer_minutes: number;
  slack_minutes: number;
  severity: 'CRITICAL' | 'AT_RISK' | 'SAFE';
  status_label: string;
  reason: string;
  action_required: string;
  depends_on?: string;
  x: number;
  y: number;
}

export default function ImpactDAGCanvas() {
  const params = useParams();
  const tripId = (params?.tripId as string) || '';

  const [delayMinutes, setDelayMinutes] = useState<number>(300);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('bk_1');
  const [activeSimulationStep, setActiveSimulationStep] = useState<number>(-1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'graph' | 'stream'>('graph');

  // Dynamic recalculation of DAG node data based on delay slider
  const computeNodes = (delay: number): DAGNodeData[] => {
    // 1. Flight
    const flightSlack = -delay;
    const flightSeverity: 'CRITICAL' | 'AT_RISK' | 'SAFE' =
      delay > 120 ? 'CRITICAL' : delay > 30 ? 'AT_RISK' : 'SAFE';

    // 2. Cab Transfer (Original buffer: 30 mins)
    const cabSlack = 30 - delay;
    const cabSeverity: 'CRITICAL' | 'AT_RISK' | 'SAFE' =
      cabSlack < 0 ? 'CRITICAL' : cabSlack < 15 ? 'AT_RISK' : 'SAFE';

    // 3. Hotel Day Stay (Scheduled 2:00 PM - 4:00 PM, buffer 60m)
    const hotelSlack = 150 - delay;
    const hotelSeverity: 'CRITICAL' | 'AT_RISK' | 'SAFE' =
      hotelSlack < -60 ? 'CRITICAL' : hotelSlack < 30 ? 'AT_RISK' : 'SAFE';

    // 4. NDLS Shatabdi Train (Departs 5:00 PM = 300 mins from 12:00 PM)
    const trainSlack = 240 - delay;
    const trainSeverity: 'CRITICAL' | 'AT_RISK' | 'SAFE' =
      trainSlack < 0 ? 'CRITICAL' : trainSlack < 45 ? 'AT_RISK' : 'SAFE';

    // 5. Volvo to Manali (Departs 11:00 PM)
    const volvoSlack = trainSeverity === 'CRITICAL' ? -60 : 360 - delay;
    const volvoSeverity: 'CRITICAL' | 'AT_RISK' | 'SAFE' =
      trainSeverity === 'CRITICAL' ? 'CRITICAL' : volvoSlack < 0 ? 'CRITICAL' : volvoSlack < 60 ? 'AT_RISK' : 'SAFE';

    // 6. Solang Paragliding (Next Day 10:00 AM)
    const activitySlack = volvoSeverity === 'CRITICAL' ? 0 : 60;
    const activitySeverity: 'CRITICAL' | 'AT_RISK' | 'SAFE' =
      volvoSeverity === 'CRITICAL' ? 'AT_RISK' : 'SAFE';

    return [
      {
        id: 'node_1',
        booking_id: 'bk_1',
        type: 'FLIGHT',
        title: 'Pune → Delhi Flight',
        code: '6E-1234',
        carrier: 'IndiGo Airlines',
        origin: 'PNQ (Pune)',
        destination: 'DEL (New Delhi)',
        scheduled_start: '10:00 AM',
        scheduled_end: '12:00 PM',
        buffer_minutes: 30,
        slack_minutes: flightSlack,
        severity: flightSeverity,
        status_label: delay > 120 ? 'DELAYED (+ ' + (delay / 60).toFixed(1) + 'h)' : 'ON TIME',
        reason: `Initial trigger: Aircraft maintenance delay of ${delay} minutes. Lands at ${
          delay >= 300 ? '5:00 PM' : `${Math.floor(12 + delay / 60)}:${String(delay % 60).padStart(2, '0')} PM`
        }.`,
        action_required: 'Carrier alert received. Downstream graph re-evaluated.',
        x: 0,
        y: 0,
      },
      {
        id: 'node_2',
        booking_id: 'bk_2',
        type: 'TRANSFER',
        title: 'Airport Transfer Cab',
        code: 'UB-5678',
        carrier: 'Uber Premier',
        origin: 'DEL Airport T2',
        destination: 'Connaught Place',
        scheduled_start: '12:30 PM',
        scheduled_end: '01:30 PM',
        buffer_minutes: 30,
        slack_minutes: cabSlack,
        severity: cabSeverity,
        status_label: cabSlack < 0 ? 'CAB MISSED' : cabSlack < 15 ? 'BUFFER TIGHT' : 'FEASIBLE',
        reason:
          cabSlack < 0
            ? `Cab booked for 12:30 PM departed. Flight lands at ${
                delay >= 300 ? '5:00 PM' : 'after scheduled cab'
              }. Deficit of ${Math.abs(cabSlack)}m.`
            : `Cab pickup scheduled within feasible arrival window (${cabSlack}m buffer remaining).`,
        action_required: cabSlack < 0 ? 'Auto-reschedule Uber to revised terminal exit time.' : 'Monitor flight gate arrival.',
        depends_on: 'node_1',
        x: 1,
        y: 0,
      },
      {
        id: 'node_3',
        booking_id: 'bk_3',
        type: 'HOTEL',
        title: 'The Imperial, Delhi',
        code: 'IMP-9012',
        carrier: 'Heritage Suites',
        origin: 'Janpath',
        destination: 'Connaught Place',
        scheduled_start: '02:00 PM',
        scheduled_end: '04:00 PM',
        buffer_minutes: 60,
        slack_minutes: hotelSlack,
        severity: hotelSeverity,
        status_label: hotelSlack < -60 ? 'STAY INVALIDATED' : hotelSlack < 30 ? 'STAY SQUEEZED' : 'CONFIRMED',
        reason:
          hotelSlack < -60
            ? 'Arrival pushed past 5:30 PM. 4-hour freshen up window reduced to 0 mins.'
            : hotelSlack < 30
            ? `Day-use window squeezed down by ${Math.abs(hotelSlack)}m.`
            : 'Sufficient relaxation buffer remaining.',
        action_required: hotelSlack < -60 ? 'Request hotel late check-in or cancel freshen up stay.' : 'Inform concierge of late arrival.',
        depends_on: 'node_2',
        x: 2,
        y: 0,
      },
      {
        id: 'node_4',
        booking_id: 'bk_4',
        type: 'TRAIN',
        title: 'Delhi → Chandigarh Shatabdi',
        code: '12005',
        carrier: 'Indian Railways',
        origin: 'NDLS Platform 1',
        destination: 'Chandigarh Junc.',
        scheduled_start: '05:00 PM',
        scheduled_end: '08:30 PM',
        buffer_minutes: 60,
        slack_minutes: trainSlack,
        severity: trainSeverity,
        status_label: trainSlack < 0 ? 'CONNECTION MISSED' : trainSlack < 45 ? 'TIGHT CONNECTION' : 'ON TRACK',
        reason:
          trainSlack < 0
            ? `Train departs NDLS at 5:00 PM. Infeasible connection with flight delay of ${delay}m.`
            : 'Train departure remains catchable with current airport transit time.',
        action_required: trainSlack < 0 ? 'CRITICAL: Re-route via evening Vande Bharat (07:15 PM) or direct highway cab.' : 'Proceed to station.',
        depends_on: 'node_1',
        x: 3,
        y: 0,
      },
      {
        id: 'node_5',
        booking_id: 'bk_5',
        type: 'TRANSFER',
        title: 'Chandigarh → Manali Volvo',
        code: 'HP-VOL-44',
        carrier: 'HPTDC Luxury Volvo',
        origin: 'Sector 43 Bay 6',
        destination: 'Manali Bus Stand',
        scheduled_start: '11:00 PM',
        scheduled_end: '07:00 AM (+1)',
        buffer_minutes: 150,
        slack_minutes: volvoSlack,
        severity: volvoSeverity,
        status_label: volvoSeverity === 'CRITICAL' ? 'OVERNIGHT BUS LOST' : 'ON TRACK',
        reason:
          volvoSeverity === 'CRITICAL'
            ? 'Missed earlier train prevents reaching Chandigarh ISBT before 11:00 PM departure.'
            : 'On schedule to reach Sector 43 ISBT with buffer to spare.',
        action_required: volvoSeverity === 'CRITICAL' ? 'Switch to direct Delhi-Manali sleeper cab or next morning express.' : 'Confirmed seat.',
        depends_on: 'node_4',
        x: 4,
        y: 0,
      },
      {
        id: 'node_6',
        booking_id: 'bk_6',
        type: 'ACTIVITY',
        title: 'Solang Valley Paragliding',
        code: 'HA-2345',
        carrier: 'Himalayan Adventures',
        origin: 'Base Camp',
        destination: 'Landing Point',
        scheduled_start: '10:00 AM (+1)',
        scheduled_end: '02:00 PM (+1)',
        buffer_minutes: 180,
        slack_minutes: activitySlack,
        severity: activitySeverity,
        status_label: activitySeverity === 'AT_RISK' ? '10:00 AM SLOT AT RISK' : 'CONFIRMED',
        reason:
          activitySeverity === 'AT_RISK'
            ? 'Late Manali arrival past 10:00 AM threatens non-refundable paragliding morning slot.'
            : 'Safely preserved slot with morning arrival in Manali.',
        action_required: activitySeverity === 'AT_RISK' ? 'Protect activity preference: Reschedule slot to 02:00 PM afternoon session.' : 'Confirmed.',
        depends_on: 'node_5',
        x: 5,
        y: 0,
      },
    ];
  };

  const nodes = computeNodes(delayMinutes);
  const selectedNode = nodes.find((n) => n.booking_id === selectedNodeId) || nodes[0];

  // Ripple Cascade Simulation trigger
  const runRippleCascade = () => {
    setIsSimulating(true);
    setActiveSimulationStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step >= nodes.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsSimulating(false);
          setActiveSimulationStep(-1);
        }, 1500);
      } else {
        setActiveSimulationStep(step);
        setSelectedNodeId(nodes[step].booking_id);
      }
    }, 700);
  };

  // Metrics summary
  const criticalCount = nodes.filter((n) => n.severity === 'CRITICAL').length;
  const atRiskCount = nodes.filter((n) => n.severity === 'AT_RISK').length;
  const safeCount = nodes.filter((n) => n.severity === 'SAFE').length;

  return (
    <div className="space-y-6">
      {/* Top Interactive Controls Toolbar */}
      <div className="glass-card rounded-3xl p-5 border border-[#1c2942] bg-[#0c1220]/90 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        {/* Left: View Mode Toggle & Domino Button */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center p-1 rounded-2xl bg-[#080d1a] border border-[#1c2942]">
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'graph'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Layers size={14} />
              Interactive DAG Graph
            </button>
            <button
              onClick={() => setViewMode('stream')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'stream'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Activity size={14} />
              Cascade Stream
            </button>
          </div>

          <div className="h-6 w-px bg-[#1c2942] hidden sm:block" />

          {/* Replay Domino Ripple Cascade button */}
          <button
            onClick={runRippleCascade}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${
              isSimulating
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse cursor-wait'
                : 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 border-rose-500/50 shadow-lg shadow-rose-950/40 hover:scale-105 active:scale-95'
            }`}
          >
            <Play size={13} className={isSimulating ? 'animate-spin' : ''} />
            {isSimulating
              ? `Propagating Ripple: Step ${activeSimulationStep + 1}/6...`
              : '▶ Replay Ripple Cascade'}
          </button>
        </div>

        {/* Right: Live Interactive Delay Slider & Canvas Zoom */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Interactive Delay Slider */}
          <div className="flex items-center gap-3 bg-[#080d1a] border border-[#1c2942] px-4 py-2 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
              <Sliders size={13} className="text-blue-400" />
              <span className="font-semibold text-white">Adjust Delay:</span>
            </div>
            <input
              type="range"
              min="30"
              max="480"
              step="30"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              className="w-28 sm:w-36 accent-blue-500 cursor-pointer"
            />
            <span
              className={`font-mono text-xs font-black px-2 py-0.5 rounded-md ${
                delayMinutes >= 240
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : delayMinutes >= 90
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              +{delayMinutes}m ({(delayMinutes / 60).toFixed(1)}h)
            </span>
            <button
              title="Reset delay to 300m"
              onClick={() => setDelayMinutes(300)}
              className="text-[#64748b] hover:text-white transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Zoom controls */}
          {viewMode === 'graph' && (
            <div className="flex items-center gap-1 bg-[#080d1a] border border-[#1c2942] p-1 rounded-2xl">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.1))}
                className="p-1.5 text-[#94a3b8] hover:text-white rounded-lg hover:bg-[#1c2640]"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[11px] font-mono text-[#cbd5e1] px-1 font-bold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.25, z + 0.1))}
                className="p-1.5 text-[#94a3b8] hover:text-white rounded-lg hover:bg-[#1c2640]"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 text-[#94a3b8] hover:text-white rounded-lg hover:bg-[#1c2640]"
                title="Reset Zoom"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Stage: Left Canvas + Right Inspector Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Col (8 cols): DAG Visual Canvas or Stream */}
        <div className="xl:col-span-8 space-y-4">
          {viewMode === 'graph' ? (
            /* Visual Interactive DAG Graph Canvas */
            <div className="glass-card rounded-3xl p-6 lg:p-7 border border-[#1c2942] bg-[#090e1c] shadow-2xl relative overflow-hidden">
              {/* Canvas Background Grid */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Status Header Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1c2942] mb-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <h3 className="text-base font-black text-white tracking-wide">
                      Topological DAG Dependency Canvas
                    </h3>
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Live ripple traversal: Flight delay propagating negative slack down connected nodes
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {criticalCount} Critical Missed
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {atRiskCount} At Risk
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {safeCount} Safe
                  </span>
                </div>
              </div>

              {/* Zoomable Graph Area */}
              <div
                className="overflow-x-auto pb-6 pt-2 transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
              >
                <div className="min-w-[780px] relative">
                  {/* Glowing SVG Connectors between nodes */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
                    style={{ minHeight: '380px' }}
                  >
                    <defs>
                      <linearGradient id="edgeCritical" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
                      </linearGradient>
                      <linearGradient id="edgeAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#eab308" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="edgeSafe" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
                      </linearGradient>
                      <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Node 1 -> Node 2 (Flight to Cab) */}
                    <path
                      d="M 230 75 L 285 75"
                      fill="none"
                      stroke={nodes[1].severity === 'CRITICAL' ? 'url(#edgeCritical)' : 'url(#edgeAmber)'}
                      strokeWidth={activeSimulationStep === 0 ? '4' : '2.5'}
                      strokeDasharray="6 4"
                      className="animate-flow-dash"
                      filter="url(#laserGlow)"
                    />

                    {/* Node 2 -> Node 3 (Cab to Hotel) */}
                    <path
                      d="M 515 75 L 570 75"
                      fill="none"
                      stroke={nodes[2].severity === 'CRITICAL' ? 'url(#edgeCritical)' : 'url(#edgeAmber)'}
                      strokeWidth={activeSimulationStep === 1 ? '4' : '2.5'}
                      strokeDasharray="6 4"
                      className="animate-flow-dash"
                      filter="url(#laserGlow)"
                    />

                    {/* Node 1 -> Node 4 Direct Airport to Train connection branch */}
                    <path
                      d="M 115 130 C 115 200, 200 245, 285 245"
                      fill="none"
                      stroke={nodes[3].severity === 'CRITICAL' ? 'url(#edgeCritical)' : 'url(#edgeAmber)'}
                      strokeWidth={activeSimulationStep === 2 ? '4' : '2.5'}
                      strokeDasharray="6 4"
                      className="animate-flow-dash"
                      filter="url(#laserGlow)"
                    />

                    {/* Node 4 -> Node 5 (Train to Volvo) */}
                    <path
                      d="M 515 245 L 570 245"
                      fill="none"
                      stroke={nodes[4].severity === 'CRITICAL' ? 'url(#edgeCritical)' : 'url(#edgeAmber)'}
                      strokeWidth={activeSimulationStep === 3 ? '4' : '2.5'}
                      strokeDasharray="6 4"
                      className="animate-flow-dash"
                      filter="url(#laserGlow)"
                    />

                    {/* Node 5 -> Node 6 (Volvo to Paragliding) */}
                    <path
                      d="M 800 245 L 850 245"
                      fill="none"
                      stroke={nodes[5].severity === 'SAFE' ? 'url(#edgeSafe)' : 'url(#edgeAmber)'}
                      strokeWidth={activeSimulationStep === 4 ? '4' : '2.5'}
                      strokeDasharray="6 4"
                      className="animate-flow-dash"
                      filter="url(#laserGlow)"
                    />
                  </svg>

                  {/* 2-Tier DAG Layout */}
                  <div className="space-y-10 relative z-10">
                    {/* Row 1: Day 1 Arrival & Freshen Up (Nodes 1, 2, 3) */}
                    <div>
                      <div className="text-[11px] font-mono font-black uppercase text-blue-400 tracking-wider mb-3 flex items-center gap-1.5">
                        <Clock size={12} /> Stage 1: Delhi Arrival & Transfer Pipeline
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        {[nodes[0], nodes[1], nodes[2]].map((node, idx) => {
                          const Icon = iconMap[node.type] || Plane;
                          const isSelected = selectedNodeId === node.booking_id;
                          const isSimActive = activeSimulationStep === idx;
                          const isCritical = node.severity === 'CRITICAL';
                          const isAtRisk = node.severity === 'AT_RISK';

                          return (
                            <motion.div
                              key={node.id}
                              onClick={() => setSelectedNodeId(node.booking_id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`cursor-pointer rounded-2xl p-4 transition-all relative border ${
                                isSelected
                                  ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-950/60'
                                  : 'hover:border-blue-400/50'
                              } ${
                                isCritical
                                  ? 'bg-[#170a12]/95 border-rose-500/50 text-white'
                                  : isAtRisk
                                  ? 'bg-[#181309]/95 border-amber-500/50 text-white'
                                  : 'bg-[#0a1712]/95 border-emerald-500/50 text-white'
                              } ${isSimActive ? 'ring-4 ring-rose-400 animate-pulse' : ''}`}
                            >
                              {/* Pulsing halo during ripple cascade */}
                              {isSimActive && (
                                <div className="absolute -inset-1 rounded-2xl bg-rose-500/30 animate-ripple-halo -z-10" />
                              )}

                              {/* Card Header: Icon + Code + Slack Pill */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                      isCritical
                                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                        : isAtRisk
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    }`}
                                  >
                                    <Icon size={16} />
                                  </div>
                                  <div>
                                    <span className="text-[11px] font-mono font-bold text-[#94a3b8]">
                                      {node.code}
                                    </span>
                                  </div>
                                </div>

                                {/* Slack Deficit Pill */}
                                <div
                                  className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${
                                    isCritical
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                      : isAtRisk
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  }`}
                                >
                                  {node.slack_minutes < 0
                                    ? `${node.slack_minutes}m`
                                    : `+${node.slack_minutes}m`}
                                </div>
                              </div>

                              {/* Title & Route */}
                              <div className="mt-3">
                                <h4 className="text-xs font-bold text-white leading-snug">
                                  {node.title}
                                </h4>
                                <div className="text-[10px] text-[#cbd5e1] mt-0.5 flex items-center gap-1 font-mono">
                                  <span>{node.scheduled_start}</span>
                                  <ArrowRight size={10} className="text-[#64748b]" />
                                  <span>{node.scheduled_end}</span>
                                </div>
                              </div>

                              {/* Severity Badge */}
                              <div className="mt-3 pt-2 border-t border-[#1c2942]/60 flex items-center justify-between">
                                <span
                                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    isCritical
                                      ? 'bg-rose-500/15 text-rose-400'
                                      : isAtRisk
                                      ? 'bg-amber-500/15 text-amber-400'
                                      : 'bg-emerald-500/15 text-emerald-400'
                                  }`}
                                >
                                  {node.status_label}
                                </span>
                                <span className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5">
                                  Inspect <ChevronRight size={11} />
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Row 2: Evening Transit & Mountain Leg (Nodes 4, 5, 6) */}
                    <div>
                      <div className="text-[11px] font-mono font-black uppercase text-indigo-400 tracking-wider mb-3 flex items-center gap-1.5">
                        <Train size={12} /> Stage 2: Himachal Shatabdi & Overnight Connection
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        {[nodes[3], nodes[4], nodes[5]].map((node, idx) => {
                          const Icon = iconMap[node.type] || Plane;
                          const isSelected = selectedNodeId === node.booking_id;
                          const isSimActive = activeSimulationStep === idx + 3;
                          const isCritical = node.severity === 'CRITICAL';
                          const isAtRisk = node.severity === 'AT_RISK';

                          return (
                            <motion.div
                              key={node.id}
                              onClick={() => setSelectedNodeId(node.booking_id)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`cursor-pointer rounded-2xl p-4 transition-all relative border ${
                                isSelected
                                  ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-950/60'
                                  : 'hover:border-blue-400/50'
                              } ${
                                isCritical
                                  ? 'bg-[#170a12]/95 border-rose-500/50 text-white'
                                  : isAtRisk
                                  ? 'bg-[#181309]/95 border-amber-500/50 text-white'
                                  : 'bg-[#0a1712]/95 border-emerald-500/50 text-white'
                              } ${isSimActive ? 'ring-4 ring-rose-400 animate-pulse' : ''}`}
                            >
                              {/* Pulsing halo during ripple cascade */}
                              {isSimActive && (
                                <div className="absolute -inset-1 rounded-2xl bg-rose-500/30 animate-ripple-halo -z-10" />
                              )}

                              {/* Card Header */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                      isCritical
                                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                        : isAtRisk
                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    }`}
                                  >
                                    <Icon size={16} />
                                  </div>
                                  <div>
                                    <span className="text-[11px] font-mono font-bold text-[#94a3b8]">
                                      {node.code}
                                    </span>
                                  </div>
                                </div>

                                {/* Slack Deficit Pill */}
                                <div
                                  className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${
                                    isCritical
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                      : isAtRisk
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  }`}
                                >
                                  {node.slack_minutes < 0
                                    ? `${node.slack_minutes}m`
                                    : `+${node.slack_minutes}m`}
                                </div>
                              </div>

                              {/* Title & Route */}
                              <div className="mt-3">
                                <h4 className="text-xs font-bold text-white leading-snug">
                                  {node.title}
                                </h4>
                                <div className="text-[10px] text-[#cbd5e1] mt-0.5 flex items-center gap-1 font-mono">
                                  <span>{node.scheduled_start}</span>
                                  <ArrowRight size={10} className="text-[#64748b]" />
                                  <span>{node.scheduled_end}</span>
                                </div>
                              </div>

                              {/* Severity Badge */}
                              <div className="mt-3 pt-2 border-t border-[#1c2942]/60 flex items-center justify-between">
                                <span
                                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    isCritical
                                      ? 'bg-rose-500/15 text-rose-400'
                                      : isAtRisk
                                      ? 'bg-amber-500/15 text-amber-400'
                                      : 'bg-emerald-500/15 text-emerald-400'
                                  }`}
                                >
                                  {node.status_label}
                                </span>
                                <span className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5">
                                  Inspect <ChevronRight size={11} />
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Cascade Stream View (Sequential Linear List) */
            <div className="glass-card rounded-3xl p-6 border border-[#1c2942] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1c2942]">
                <h3 className="text-base font-bold text-white">Chronological Cascade Chain</h3>
                <span className="text-xs font-mono text-[#94a3b8]">6 Connected Bookings</span>
              </div>

              <div className="space-y-3">
                {nodes.map((node) => {
                  const Icon = iconMap[node.type] || Plane;
                  const isCritical = node.severity === 'CRITICAL';
                  const isAtRisk = node.severity === 'AT_RISK';
                  const isSelected = selectedNodeId === node.booking_id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.booking_id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/40'
                          : 'border-[#1c2942] hover:border-blue-400/40'
                      } ${
                        isCritical
                          ? 'bg-rose-950/20'
                          : isAtRisk
                          ? 'bg-amber-950/20'
                          : 'bg-emerald-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                              isCritical
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : isAtRisk
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            <Icon size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{node.title}</h4>
                              <span className="text-[10px] font-mono text-[#94a3b8]">{node.code}</span>
                            </div>
                            <p className="text-xs text-[#cbd5e1] mt-0.5">{node.reason}</p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div
                            className={`text-sm font-mono font-black ${
                              isCritical
                                ? 'text-rose-400'
                                : isAtRisk
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {node.slack_minutes}m
                          </div>
                          <span className="text-[10px] text-[#64748b] uppercase font-bold">
                            Slack Buffer
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Col (4 cols): Deep-Dive Node Inspector Drawer & Formula Breakdown */}
        <div className="xl:col-span-4 space-y-6">
          {/* Node Inspector Card */}
          <div className="glass-card rounded-3xl p-6 border border-[#1c2942] bg-[#0d1424] shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#1c2942]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Info size={15} /> Node Telemetry Inspector
              </div>
              <span className="text-[10px] font-mono text-[#94a3b8]">
                ID: {selectedNode.booking_id}
              </span>
            </div>

            {/* Selected Node Details */}
            <div className="mt-5 space-y-4">
              <div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    selectedNode.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : selectedNode.severity === 'AT_RISK'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {selectedNode.status_label}
                </span>
                <h3 className="text-lg font-black text-white mt-2 leading-tight">
                  {selectedNode.title}
                </h3>
                <p className="text-xs text-[#94a3b8] mt-1 font-mono">
                  {selectedNode.carrier} • {selectedNode.code}
                </p>
              </div>

              {/* Timings */}
              <div className="p-3.5 rounded-2xl bg-[#080d1a] border border-[#1c2942] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Route:</span>
                  <span className="text-white font-bold">
                    {selectedNode.origin} → {selectedNode.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Scheduled:</span>
                  <span className="text-white">
                    {selectedNode.scheduled_start} — {selectedNode.scheduled_end}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Allocated Buffer:</span>
                  <span className="text-blue-400 font-bold">{selectedNode.buffer_minutes} mins</span>
                </div>
              </div>

              {/* Exact Mathematical Slack Equation */}
              <div className="p-4 rounded-2xl bg-[#120f1f] border border-indigo-500/30 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <Zap size={13} className="text-indigo-400" />
                  Deterministic Slack Math:
                </div>
                <div className="font-mono text-[11px] text-[#e2e8f0] bg-[#0a0715] p-2.5 rounded-xl border border-indigo-950">
                  <div className="text-[#94a3b8]">Slack = Buffer - Delay</div>
                  <div className="mt-1 font-bold text-rose-300">
                    {selectedNode.buffer_minutes}m - {delayMinutes}m ={' '}
                    <span className="text-sm underline">{selectedNode.slack_minutes}m</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                  {selectedNode.reason}
                </p>
              </div>

              {/* AI Recommended Mitigation Action */}
              <div className="p-4 rounded-2xl bg-[#0a1712] border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Sparkles size={13} />
                  Engine Action:
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
                  {selectedNode.action_required}
                </p>
              </div>

              {/* Direct Link to Plan Generation */}
              <Link
                href={tripId ? `/trips/${tripId}/recovery-plans` : '/my-trips'}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-950/60 transition-all hover:scale-[1.02]"
              >
                <Sparkles size={14} />
                Generate Recovery Plan for this Trip
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
