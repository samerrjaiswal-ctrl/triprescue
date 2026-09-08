'use client';

import { motion } from 'framer-motion';

interface TripHealthRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  previousScore?: number;
  showComparison?: boolean;
}

export default function TripHealthRing({
  score,
  size = 'lg',
  previousScore,
  showComparison = false,
}: TripHealthRingProps) {
  const radius = size === 'lg' ? 76 : size === 'md' ? 52 : 36;
  const strokeWidth = size === 'lg' ? 9 : size === 'md' ? 7 : 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  const getColor = (s: number) => {
    if (s >= 85) return '#10b981'; // Emerald
    if (s >= 65) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getStatusLabel = (s: number) => {
    if (s >= 90) return 'Optimal Condition';
    if (s >= 75) return 'Stable';
    if (s >= 50) return 'At Risk';
    return 'Critical Ripple';
  };

  const strokeColor = getColor(score);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="-rotate-90 transform">
          {/* Base Background Circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="#161f33"
            strokeWidth={strokeWidth}
          />

          {/* Animated Progress Circle with Glow */}
          <motion.circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              filter: `drop-shadow(0 0 12px ${strokeColor}70)`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={
              size === 'lg'
                ? 'text-4xl font-extrabold tracking-tight text-white'
                : size === 'md'
                ? 'text-2xl font-bold text-white'
                : 'text-lg font-bold text-white'
            }
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {score}%
          </motion.span>
          {size === 'lg' && (
            <span
              className="text-[11px] font-bold uppercase tracking-wider mt-0.5"
              style={{ color: strokeColor }}
            >
              {getStatusLabel(score)}
            </span>
          )}
        </div>
      </div>

      {/* Comparison pill if before/after recovery */}
      {showComparison && previousScore !== undefined && (
        <motion.div
          className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-rose-400">{previousScore}%</span>
          <span className="text-[#64748b]">→</span>
          <span>{score}%</span>
          <span className="text-emerald-300 font-extrabold">
            (+{score - previousScore}%)
          </span>
        </motion.div>
      )}
    </div>
  );
}
