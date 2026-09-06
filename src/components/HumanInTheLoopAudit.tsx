import React, { useState } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ShieldCheck, 
  ArrowUpRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { AuditEntry, RiskItem, Recommendation } from '../types';
import { formatCurrency } from '../utils/formatters';

interface Props {
  auditLog: AuditEntry[];
  risks: RiskItem[];
  onOpenApprovalModal: (risk: RiskItem, recommendation: Recommendation, initialAction: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED') => void;
}

export const HumanInTheLoopAudit: React.FC<Props> = ({
  auditLog,
  risks,
  onOpenApprovalModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState<'ALL' | 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED'>('ALL');

  const safeRisks = Array.isArray(risks) ? risks : [];
  const safeAuditLog = Array.isArray(auditLog) ? auditLog : [];

  // Collect all pending recommendations
  const pendingRecommendations: { risk: RiskItem; rec: Recommendation }[] = [];
  safeRisks.forEach(r => {
    (r?.recommendations || []).forEach(rec => {
      if (rec && rec.status === 'PENDING_APPROVAL') {
        pendingRecommendations.push({ risk: r, rec });
      }
    });
  });

  const filteredLog = safeAuditLog.filter(entry => {
    if (!entry) return false;
    const matchesSearch = 
      (entry.riskTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.recommendationTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.decidedBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDecision = filterDecision === 'ALL' || entry.decision === filterDecision;
    return matchesSearch && matchesDecision;
  });

  const totalProtected = safeAuditLog
    .filter(e => e && e.decision === 'APPROVED')
    .reduce((sum, e) => sum + (e.financialProtection || 0), 0);

  return (
    <div id="audit-trail-container" className="space-y-6 text-slate-100">
      {/* Top Banner: Governance Overview */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Governance, Approvals & Immutable Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Autonomous agent boundary: Critical business interventions are gated by authorized human sign-off
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Decisions Recorded</span>
            <span className="text-base font-bold text-white">{auditLog.length} Entries</span>
          </div>
          <div className="bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/30 text-emerald-400">
            <span className="text-emerald-400 block text-[10px] uppercase font-semibold">Value Protected</span>
            <span className="text-base font-bold text-emerald-400">{formatCurrency(totalProtected)}</span>
          </div>
        </div>
      </div>

      {/* Pending Approval Queue */}
      {pendingRecommendations.length > 0 && (
        <div className="bg-amber-500/10 rounded-xl border border-amber-500/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-300">
                Action Required: Pending AI Mitigation Proposals ({pendingRecommendations.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
              High Priority Authorization
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingRecommendations.map(({ risk, rec }) => (
              <div
                key={rec.id}
                className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/30 shadow-2xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-mono font-semibold text-slate-300">{risk.id} • {risk.title}</span>
                    <span className="font-bold text-emerald-400">-{rec.expectedRiskReduction} pts</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{rec.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Est. Cost: <strong className="text-slate-200">{rec.estimatedCost > 0 ? formatCurrency(rec.estimatedCost) : 'Internal'}</strong>
                  </span>
                  <button
                    id={`btn-review-pending-${rec.id}`}
                    onClick={() => onOpenApprovalModal(risk, rec, 'APPROVED')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    Review & Authorize →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log Table Section */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 shadow-xs overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail by decision, reviewer, or risk..."
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-200 bg-slate-900 border border-slate-800 rounded-lg shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Filter Outcome:</span>
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value as any)}
              className="text-xs font-medium bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Outcomes</option>
              <option value="APPROVED">Approved Actions</option>
              <option value="REJECTED">Rejected Proposals</option>
              <option value="REVIEW_REQUESTED">Under Review</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Audit ID / Timestamp</th>
                <th className="py-3 px-4">Decision & Sign-Off</th>
                <th className="py-3 px-4">Mitigation Proposal</th>
                <th className="py-3 px-4">Executive Rationale</th>
                <th className="py-3 px-4 text-right">Protection Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal bg-slate-900/40">
              {filteredLog.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLog.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-white">{entry.id}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {entry.decision === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            APPROVED
                          </span>
                        ) : entry.decision === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            REJECTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            REVIEW
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 mt-1">
                        {entry.decidedBy}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-white line-clamp-1" title={entry.recommendationTitle}>
                        {entry.recommendationTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        Risk: {entry.riskTitle}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <div className="text-slate-300 italic bg-slate-950/70 p-2 rounded border border-slate-800 text-[11px]">
                        "{entry.notes}"
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        {entry.expectedImpact}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="font-bold text-white text-sm">
                        {entry.financialProtection > 0 ? formatCurrency(entry.financialProtection) : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
