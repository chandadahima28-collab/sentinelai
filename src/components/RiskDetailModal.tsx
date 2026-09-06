import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  BrainCircuit, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  Database, 
  TrendingUp, 
  Clock, 
  Users, 
  Check, 
  Building2,
  FileText
} from 'lucide-react';
import { RiskItem, Recommendation } from '../types';
import { formatCurrency, getSeverityBadgeClass, getScoreColor } from '../utils/formatters';
import { ExplainableAiBadge } from './ExplainableAiBadge';

interface Props {
  risk: RiskItem | null;
  onClose: () => void;
  onOpenApprovalModal: (risk: RiskItem, recommendation: Recommendation, initialAction: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED') => void;
  onDeepAnalyzeWithGemini: (risk: RiskItem) => void;
  isAnalyzing: boolean;
  geminiDeepAnalysis?: {
    aiExplanation: string;
    contributingFactors: string[];
    recommendedMitigations: string[];
    confidenceScore: number;
  } | null;
}

export const RiskDetailModal: React.FC<Props> = ({
  risk,
  onClose,
  onOpenApprovalModal,
  onDeepAnalyzeWithGemini,
  isAnalyzing,
  geminiDeepAnalysis
}) => {
  if (!risk) return null;

  const scoreColors = getScoreColor(risk.score);
  const severityBadgeClass = getSeverityBadgeClass(risk.severity);
  const evidenceList = Array.isArray(risk?.evidenceDataPoints) ? risk.evidenceDataPoints : [];
  const recList = Array.isArray(risk?.recommendations) ? risk.recommendations : [];
  const contributingFactors = Array.isArray(geminiDeepAnalysis?.contributingFactors)
    ? geminiDeepAnalysis.contributingFactors
    : Array.isArray(risk?.rootCauseAnalysis?.contributingFactors)
    ? risk.rootCauseAnalysis.contributingFactors
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        id="risk-detail-modal"
        className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-6 text-slate-100"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${severityBadgeClass}`}>
                {risk.severity.toUpperCase()}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                {risk.id}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {risk.category.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white leading-tight">
              {risk.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Detected by SentinelAI Engine on {new Date(risk.detectedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border font-bold ${scoreColors.bg} ${scoreColors.text} ${scoreColors.border} shadow-xs`}>
              <span className="text-2xl leading-none font-black">{risk.score}</span>
              <span className="text-[10px] uppercase opacity-80">Risk Score</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Executive Impact Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Total Revenue Exposure
              </span>
              <span className="text-lg font-bold text-white mt-0.5 block">
                {formatCurrency(risk.businessImpact.revenueExposure)}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Contractual SLA Penalty
              </span>
              <span className="text-lg font-bold text-rose-400 mt-0.5 block">
                {formatCurrency(risk.businessImpact.slaPenaltyExposure)}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Affected Orders
              </span>
              <span className="text-lg font-bold text-white mt-0.5 block">
                {risk.businessImpact.affectedOrdersCount} Firm Orders
              </span>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                SLA Breach Probability
              </span>
              <span className="text-lg font-bold text-amber-400 mt-0.5 block">
                {risk.businessImpact.slaRiskPct}% High Probability
              </span>
            </div>
          </div>

          {/* Section 1: AI Root Cause Analysis (Gemini Powered) */}
          <div className="bg-indigo-950/20 rounded-xl border border-indigo-500/20 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  AI Root-Cause & Cross-System Correlation
                </h3>
                <ExplainableAiBadge type="AI_ROOT_CAUSE" />
              </div>
              <button
                onClick={() => onDeepAnalyzeWithGemini(risk)}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Querying Gemini...' : 'Re-run Gemini Deep Reasoning'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">
                Primary Root Cause Hypothesis:
              </p>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-indigo-500/20 font-medium">
                {geminiDeepAnalysis?.aiExplanation || risk.rootCauseAnalysis.explanation}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-300 mb-1.5">
                Key Contributing Risk Drivers:
              </p>
              <ul className="space-y-1">
                {contributingFactors.map((factor, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-indigo-500/20 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Confidence Score: {((geminiDeepAnalysis?.confidenceScore || risk.rootCauseAnalysis?.confidenceScore || 0.85) * 100).toFixed(0)}%</span>
              <span className="italic">{risk.rootCauseAnalysis?.aiEvidenceSummary || 'Verified by cross-system ERP correlation.'}</span>
            </div>
          </div>

          {/* Section 2: Observed Data Points / Evidence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-white">
                  Observed ERP Evidence & Telemetry Points
                </h3>
              </div>
              <ExplainableAiBadge type="OBSERVED_DATA" />
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Telemetry Metric</th>
                    <th className="py-2.5 px-4">Observed Value</th>
                    <th className="py-2.5 px-4">Baseline Normal</th>
                    <th className="py-2.5 px-4">Deviation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                  {evidenceList.map((ev, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-semibold text-white">{ev.metric}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-rose-400">{ev.value}</td>
                      <td className="py-2.5 px-4 text-slate-400">{ev.baseline}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          ev.status === 'critical' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {ev.deviation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Proactive Recommendations & Human-in-the-Loop */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Proactive Mitigation Recommendations ({recList.length})
                </h3>
              </div>
              <ExplainableAiBadge type="RECOMMENDATION" />
            </div>

            <div className="space-y-3">
              {recList.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 shadow-xs space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                          {rec.actionType.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          rec.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                          rec.status === 'REJECTED' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                          rec.status === 'UNDER_REVIEW' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {rec.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{rec.title}</h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-400 block">
                        -{rec.expectedRiskReduction} pts Risk
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Preserves: {formatCurrency(rec.financialProtection)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{rec.description}</p>
                  <p className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded border border-slate-800 font-medium">
                    <span className="font-semibold text-white">Rationale: </span>
                    {rec.rationale}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                      <span>Est. Cost: <strong className="text-slate-200">{rec.estimatedCost > 0 ? formatCurrency(rec.estimatedCost) : 'Internal Allocation'}</strong></span>
                      <span>Timeline: <strong className="text-slate-200">{rec.implementationTimeline}</strong></span>
                    </div>

                    {rec.status === 'PENDING_APPROVAL' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenApprovalModal(risk, rec, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => onOpenApprovalModal(risk, rec, 'REJECTED')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onOpenApprovalModal(risk, rec, 'REVIEW_REQUESTED')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-amber-950 hover:text-amber-400 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        Action logged by {rec.decidedBy || 'Officer'} on {rec.decisionTimestamp ? new Date(rec.decisionTimestamp).toLocaleTimeString() : 'Recently'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            SentinelAI Autonomous Risk Management • Human-in-the-Loop Safe Mode
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg shadow-xs border border-slate-700 cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
