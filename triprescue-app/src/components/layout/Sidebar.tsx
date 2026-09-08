'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  GitFork,
  Sparkles,
  Columns,
  Map,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Activity,
  PlusCircle,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/trips/trip_001/dashboard', icon: LayoutDashboard },
  { label: 'Disruption Center', href: '/trips/trip_001/disruption', icon: AlertTriangle, badge: 'Simulate' },
  { label: 'Impact Analysis', href: '/trips/trip_001/impact', icon: GitFork },
  { label: 'Recovery Plans', href: '/trips/trip_001/recovery-plans', icon: Sparkles },
  { label: 'Plan Comparison', href: '/trips/trip_001/compare', icon: Columns },
  { label: 'My Trips', href: '/my-trips', icon: Map },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 z-30 flex flex-col transition-all duration-300 ease-in-out bg-[#080d1a] border-r border-[#162035] ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-20 border-b border-[#162035]">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 flex-shrink-0">
            <Shield size={22} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                TripRescue
              </span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mt-1">
                Mission Control
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#64748b] hover:text-white hover:bg-[#131b2e] transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-150 group ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 font-bold border border-blue-500/30 shadow-md shadow-blue-900/20'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#101729]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={19}
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-[#64748b] group-hover:text-blue-400'
                  }`}
                />
                {!collapsed && (
                  <span className="text-sm tracking-tight">{item.label}</span>
                )}
              </div>

              {!collapsed && item.badge && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status Box */}
      {!collapsed && (
        <div className="p-4 border-t border-[#162035] space-y-3">
          <Link
            href="/create-trip"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-[#152037] hover:bg-[#1e2d4d] border border-blue-500/20 transition-all"
          >
            <PlusCircle size={15} className="text-blue-400" />
            Create New Trip
          </Link>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0e1628] border border-[#162035] text-xs text-[#94a3b8]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium">Graph Engine 1.0 Online</span>
          </div>
        </div>
      )}
    </aside>
  );
}
