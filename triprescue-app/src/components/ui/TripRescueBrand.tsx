'use client';

import React from 'react';
import Image from 'next/image';

interface TripRescueIconProps {
  size?: number;
  className?: string;
}

/**
 * TripRescue Premium Brand Icon
 * - Matching the reference design: dark rounded-square with TR monogram,
 *   airplane flight path, location pin, and subtle neon border.
 */
export function TripRescueIcon({ size = 40, className = '' }: TripRescueIconProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-lg shadow-black/50 border border-white/10 flex-shrink-0 bg-[#050811] ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand-logo.png"
        alt="TripRescue Logo"
        width={size}
        height={size}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
}

interface TripRescueWordmarkProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * TripRescue Wordmark
 * - "Trip" = white
 * - "Rescue" = warm gold (#F59E0B)
 * - Bold but clean modern sans-serif
 * - Under it: "RECOVERY ENGINE" in small uppercase gold text with letter spacing
 */
export function TripRescueWordmark({ size = 'md' }: TripRescueWordmarkProps) {
  const textClass = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';
  const subtextClass =
    size === 'sm' ? 'text-[8.5px]' : size === 'lg' ? 'text-[11px]' : 'text-[9.5px]';

  return (
    <div className="flex flex-col select-none">
      <span className={`font-black ${textClass} tracking-tight block leading-none`}>
        <span className="text-white">Trip</span>
        <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Rescue</span>
      </span>
      <span
        className={`font-extrabold ${subtextClass} text-sky-400/90 uppercase tracking-[0.22em] block mt-1 leading-none`}
      >
        Recovery Engine
      </span>
    </div>
  );
}

interface TripRescueBrandProps {
  iconSize?: number;
  wordmarkSize?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

/**
 * Full TripRescue Brand (Icon + Wordmark)
 */
export default function TripRescueBrand({
  iconSize = 40,
  wordmarkSize = 'md',
  showWordmark = true,
}: TripRescueBrandProps) {
  return (
    <div className="flex items-center gap-3">
      <TripRescueIcon size={iconSize} />
      {showWordmark && <TripRescueWordmark size={wordmarkSize} />}
    </div>
  );
}
