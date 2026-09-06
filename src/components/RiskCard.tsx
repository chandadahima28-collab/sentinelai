import React, { useState } from 'react';
import { 
  AlertTriangle, 
  BrainCircuit, 
  DollarSign, 
  Users, 
  Sparkles, 
  ChevronRight, 
  Check, 
  X, 
  Eye, 
  Clock, 
  ShieldCheck,
  Building2,
  GitBranch
} from 'lucide-react';
import { RiskItem, Recommendation } from '../types';
import { formatCurrency, getSeverityBadgeClass, getScoreColor } from '../utils/formatters';
import { ExplainableAiBadge } from './ExplainableAiBadge';

interface RiskCardProps {
  risk: RiskItem;
  onOpenDetails: (risk: RiskItem) => void;
  onOpenApprovalModal: (risk: RiskItem, recommendation: Recommendation, initialAction: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED') => void;
  onDeepAnalyzeWithGemini: (risk: RiskItem) => void;
  isAnalyzing: boolean;
}

export const RiskCard: React.FC<RiskCardProps> = ({
  risk,
  onOpenDetails,
  onOpenApprovalModal,
  onDeepAnalyzeWithGemini,
  isAnalyzing
}) => {
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const scoreColors = getScoreColor(risk.score);
  const severityBadgeClass = getSeverityBadgeClass(risk.severity);
  const evidencePoints = Array.isArray(risk?.evidenceDataPoints) ? risk.evidenceDataPoints : [];
  const recommendations = Array.isArray(risk?.recommendations) ? risk.recommendations : [];

  return (
    <div
      id={`risk-card-${risk.id}`}
      className="bg-slate-900/80 rounded-xl border border-slate-800 shadow-xs hover:border-slate-700/80 transition-all overflow-hidden flex flex-col justify-between"
    >
      {/* Card Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${severityBadgeClass}`}>
                {risk.severity.toUpperCase()}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                {risk.id}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {risk.category.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-base font-bold text-white leading-snug">
              {risk.title}
            </h3>
          </div>

          {/* Risk Score Circle */}
          <div className="text-center shrink-0">
            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-bold ${scoreColors.bg} ${scoreColors.text} ${scoreColors.border} shadow-2xs`}>
              <span className="text-lg leading-none font-extrabold">{risk.score}</span>
              <span className="text-[9px] uppercase tracking-tighter opacity-80">Score</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
          {risk.summary}
        </p>

        {/* Business Exposure Ribbon */}
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Revenue Exposure</span>
            <span className="font-bold text-white">{formatCurrency(risk.businessImpact.revenueExposure)}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">SLA Penalty Risk</span>
            <span className="font-bold text-rose-400">{formatCurrency(risk.businessImpact.slaPenaltyExposure)}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Affected Accounts</span>
            <span className="font-bold text-white truncate block" title={risk.businessImpact.affectedCustomers.join(', ')}>
              {risk.businessImpact.affectedCustomersCount} Clients ({risk.businessImpact.affectedOrdersCount} Orders)
            </span>
          </div>
        </div>
      </div>

      {/* AI Root Cause Synopsis */}
      <div className="p-4 bg-indigo-950/20 border-b border-indigo-500/20">
        <div className="flex items-center justify-between mb-1.5">
          <ExplainableAiBadge type="AI_ROOT_CAUSE" />
          <button
            onClick={() => onDeepAnalyzeWithGemini(risk)}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Querying Gemini...' : 'Deep AI Reasoning'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          <span className="font-semibold text-white">Primary Root Cause: </span>
          {risk.rootCauseAnalysis.primaryCause}
        </p>
      </div>

      {/* Evidence Snapshot (Top 2 data points) */}
      <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Observed Evidence / Telemetry
          </span>
          <ExplainableAiBadge type="OBSERVED_DATA" size="sm" />
        </div>
        <div className="space-y-1.5">
          {evidencePoints.slice(0, 2).map((ev, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-300 font-medium truncate max-w-[220px]" title={ev.metric}>
                {ev.metric}
              </span>
              <span className="font-semibold text-white font-mono text-[11px]">
                {ev.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Proactive Recommendations Header & Top Action */}
      <div className="p-4 sm:p-5 bg-slate-950/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              Proactive Recommendations ({recommendations.length})
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">
            Requires Human Approval
          </span>
        </div>

        {/* Top Recommendation Box */}
        {recommendations.slice(0, showAllRecommendations ? undefined : 1).map((rec) => (
          <div
            key={rec.id}
            id={`rec-item-${rec.id}`}
            className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 shadow-2xs space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                    {rec.actionType.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    rec.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                    rec.status === 'REJECTED' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                    rec.status === 'UNDER_REVIEW' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {rec.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mt-1">
                  {rec.title}
                </h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-emerald-400 block">
                  -{rec.expectedRiskReduction} pts
                </span>
                <span className="text-[10px] text-slate-400">Risk Delta</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 line-clamp-2">
              {rec.description}
            </p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                Est. Cost: <strong className="text-slate-200">{rec.estimatedCost > 0 ? formatCurrency(rec.estimatedCost) : 'Internal'}</strong>
              </span>
              <span className="text-slate-400">
                Protection: <strong className="text-emerald-400">{formatCurrency(rec.financialProtection)}</strong>
              </span>
            </div>

            {/* Human In The Loop Action Buttons */}
            {rec.status === 'PENDING_APPROVAL' ? (
              <div className="pt-2 flex items-center gap-2">
                <button
                  id={`btn-approve-${rec.id}`}
                  onClick={() => onOpenApprovalModal(risk, rec, 'APPROVED')}
                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Action</span>
                </button>
                <button
                  id={`btn-reject-${rec.id}`}
                  onClick={() => onOpenApprovalModal(risk, rec, 'REJECTED')}
                  className="py-1.5 px-2.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                  title="Reject recommendation"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`btn-review-${rec.id}`}
                  onClick={() => onOpenApprovalModal(risk, rec, 'REVIEW_REQUESTED')}
                  className="py-1.5 px-2.5 bg-slate-800 hover:bg-amber-950 hover:text-amber-400 text-slate-300 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-700"
                  title="Request detailed review from team"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                <span className="font-semibold text-slate-300">Audit Logged</span>
                <span>{rec.decidedBy || 'Risk Committee'}</span>
              </div>
            )}
          </div>
        ))}

        {risk.recommendations.length > 1 && (
          <button
            onClick={() => setShowAllRecommendations(!showAllRecommendations)}
            className="w-full text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors py-1 cursor-pointer"
          >
            {showAllRecommendations
              ? 'Show fewer recommendations'
              : `View all ${risk.recommendations.length} recommendations →`}
          </button>
        )}
      </div>

      {/* Card Footer: View Full Detail Modal */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-mono text-[10px]">
          Detected: {new Date(risk.detectedAt).toLocaleDateString()}
        </span>
        <button
          id={`btn-inspect-risk-${risk.id}`}
          onClick={() => onOpenDetails(risk)}
          className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <span>Full Risk & Cascade Dossier</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
