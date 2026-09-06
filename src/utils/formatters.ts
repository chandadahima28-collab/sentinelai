export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getSeverityBadgeClass(severity: 'Critical' | 'High' | 'Medium' | 'Low'): string {
  switch (severity) {
    case 'Critical':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30 ring-rose-500/20';
    case 'High':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30 ring-amber-500/20';
    case 'Medium':
      return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 ring-yellow-500/20';
    case 'Low':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 ring-emerald-500/20';
  }
}

export function getScoreColor(score: number): { text: string; bg: string; border: string; ring: string } {
  if (score >= 80) {
    return { text: 'text-rose-400', bg: 'bg-rose-950/50', border: 'border-rose-500/30', ring: 'ring-rose-500/30' };
  }
  if (score >= 60) {
    return { text: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-500/30', ring: 'ring-amber-500/30' };
  }
  if (score >= 40) {
    return { text: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-500/30', ring: 'ring-yellow-500/30' };
  }
  return { text: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-500/30', ring: 'ring-emerald-500/30' };
}
