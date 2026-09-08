import { CheckCircle2, AlertTriangle, XCircle, Clock, RotateCcw } from 'lucide-react';

interface StatusBadgeProps {
  status: 'CONFIRMED' | 'AT_RISK' | 'CRITICAL' | 'REBOOKED' | 'CANCELLED';
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const configs = {
    CONFIRMED: {
      label: 'Confirmed',
      icon: CheckCircle2,
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    },
    AT_RISK: {
      label: 'At Risk',
      icon: AlertTriangle,
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    CRITICAL: {
      label: 'Critical',
      icon: XCircle,
      bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    },
    REBOOKED: {
      label: 'Rebooked',
      icon: RotateCcw,
      bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    },
    CANCELLED: {
      label: 'Cancelled',
      icon: XCircle,
      bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    },
  };

  const config = configs[status] || configs.CONFIRMED;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.bg} ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <Icon size={size === 'sm' ? 11 : 13} />
      {config.label}
    </span>
  );
}
