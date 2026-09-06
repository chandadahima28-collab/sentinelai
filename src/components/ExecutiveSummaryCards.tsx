import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  AlertOctagon, 
  Truck, 
  Users, 
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ErpSnapshot } from '../types';
import { formatCurrency, formatNumber, getScoreColor } from '../utils/formatters';

interface Props {
  snapshot: ErpSnapshot;
  onNavigateToRisks: () => void;
  onNavigateToSimulator: () => void;
}

export const ExecutiveSummaryCards: React.FC<Props> = ({ 
  snapshot, 
  onNavigateToRisks,
  onNavigateToSimulator 
}) => {
  const metrics = snapshot?.metrics || {
    overallRiskScore: 0,
    riskScoreTrend: [],
    totalRevenueAtRisk: 0,
    slaPenaltiesAtRisk: 0,
    activeCriticalRisks: 0,
    activeHighRisks: 0,
    activeMediumRisks: 0,
    activeLowRisks: 0,
    totalMonitoredOrders: 0,
    affectedOrdersCount: 0,
    totalSuppliersMonitored: 0,
    flaggedSuppliersCount: 0
  };
  const scoreColors = getScoreColor(metrics.overallRiskScore);
  const isElevated = metrics.overallRiskScore >= 60;

  return (
    <section id="executive-summary-section" className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Business Risk Score */}
        <div 
          id="card-overall-risk-score" 
          className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Composite Risk Index
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold tracking-tight ${scoreColors.text}`}>
                  {metrics.overallRiskScore}
                </span>
                <span className="text-xs font-medium text-slate-400">/ 100</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${scoreColors.bg} ${scoreColors.text} border ${scoreColors.border}`}>
                  {metrics.overallRiskScore >= 80 ? 'CRITICAL' : metrics.overallRiskScore >= 60 ? 'HIGH RISK' : metrics.overallRiskScore >= 40 ? 'MEDIUM' : 'LOW RISK'}
                </span>
              </div>
            </div>
            <div className={`p-2.5 rounded-lg ${scoreColors.bg} ${scoreColors.text} border ${scoreColors.border}`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">5-Day Velocity:</span>
            <div className="flex items-center gap-1 font-semibold">
              {isElevated ? (
                <span className="text-rose-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +12% vs last week
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  -6% nominal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Financial Exposure & SLA Risk */}
        <div 
          id="card-financial-exposure" 
          className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Revenue Exposure
              </p>
              <div className="mt-1">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {formatCurrency(metrics.totalRevenueAtRisk)}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/50 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Contractual SLA Penalty Risk:</span>
            <span className="font-bold text-rose-400">
              {formatCurrency(metrics.slaPenaltiesAtRisk)}
            </span>
          </div>
        </div>

        {/* Card 3: Active Risks Severity Distribution */}
        <div 
          id="card-risk-severity-distribution" 
          className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-indigo-500/40 transition-colors"
          onClick={onNavigateToRisks}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Risks Breakdown
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  {metrics.activeCriticalRisks} Critical
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {metrics.activeHighRisks} High
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                  {metrics.activeMediumRisks} Med
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {metrics.activeLowRisks} Low
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-950/50 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Visual Distribution Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div style={{ width: `${(metrics.activeCriticalRisks / 4) * 100}%` }} className="bg-rose-500 h-full"></div>
              <div style={{ width: `${(metrics.activeHighRisks / 4) * 100}%` }} className="bg-amber-500 h-full"></div>
              <div style={{ width: `${(metrics.activeMediumRisks / 4) * 100}%` }} className="bg-yellow-500 h-full"></div>
              <div style={{ width: `${(metrics.activeLowRisks / 4) * 100}%` }} className="bg-emerald-500 h-full"></div>
            </div>
            <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400">
              <span>View details & root causes</span>
              <span className="text-indigo-400 font-semibold">Inspect →</span>
            </div>
          </div>
        </div>

        {/* Card 4: Supply Chain & Operational Nodes Affected */}
        <div 
          id="card-supply-chain-impact" 
          className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Supply Chain & Order Health
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold tracking-tight text-white">
                  {metrics.affectedOrdersCount}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  / {formatNumber(metrics.totalMonitoredOrders)} orders at risk
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-950/50 text-purple-400 border border-purple-500/20">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Flagged Suppliers:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {metrics.flaggedSuppliersCount} of {metrics.totalSuppliersMonitored}
            </span>
          </div>
        </div>
      </div>

      {/* Trajectory and Quick Scenario Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                SentinelAI Executive Advisory
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Action Required
              </span>
            </div>
            <p className="text-sm font-medium text-slate-200 mt-0.5">
              {metrics.overallRiskScore >= 70
                ? 'High-priority supply chain disruption detected. Automated mitigation proposals require human sign-off to avert $185,000 SLA penalty.'
                : 'Enterprise operations within nominal risk tolerance bounds. Continuous background monitoring active.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="btn-quick-view-mitigations"
            onClick={onNavigateToRisks}
            className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer text-center"
          >
            Review Recommendations
          </button>
          <button
            id="btn-quick-run-simulation"
            onClick={onNavigateToSimulator}
            className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer text-center"
          >
            Run What-If Simulation
          </button>
        </div>
      </div>
    </section>
  );
};
