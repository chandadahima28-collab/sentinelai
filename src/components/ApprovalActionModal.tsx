import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  UserCheck,
  FileSignature
} from 'lucide-react';
import { RiskItem, Recommendation } from '../types';
import { formatCurrency } from '../utils/formatters';

interface Props {
  risk: RiskItem;
  recommendation: Recommendation;
  action: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED';
  onClose: () => void;
  onSubmit: (data: {
    recommendationId: string;
    riskId: string;
    action: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED';
    decidedBy: string;
    notes: string;
  }) => void;
}

export const ApprovalActionModal: React.FC<Props> = ({
  risk,
  recommendation,
  action,
  onClose,
  onSubmit
}) => {
  const [selectedAction, setSelectedAction] = useState<'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED'>(action);
  const [decidedBy, setDecidedBy] = useState('Marcus Vance (VP Global Supply Chain)');
  const [notes, setNotes] = useState(
    action === 'APPROVED' 
      ? 'Approved under executive authorization to protect NovaTech & Vertex SLA commitments.' 
      : action === 'REJECTED' 
      ? 'Cost premium exceeds acceptable Q3 variance threshold. Require alternative sourcing.'
      : 'Requested engineering QA validation of secondary supplier component specs.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      recommendationId: recommendation.id,
      riskId: risk.id,
      action: selectedAction,
      decidedBy,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div 
        id="approval-decision-modal"
        className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
              <FileSignature className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Human-in-the-Loop Decision Authorization
              </h3>
              <p className="text-xs text-slate-400">
                SentinelAI Policy requires human sign-off before executing mitigation actions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Recommendation Summary */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Mitigation Action Proposal
            </span>
            <h4 className="text-sm font-bold text-white">
              {recommendation.title}
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-indigo-500/20">
              <span>Risk Reduction: <strong className="text-emerald-400">-{recommendation.expectedRiskReduction} pts</strong></span>
              <span>Financial Protection: <strong className="text-white">{formatCurrency(recommendation.financialProtection)}</strong></span>
            </div>
          </div>

          {/* Decision Selection Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Select Executive Decision:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedAction('APPROVED')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  selectedAction === 'APPROVED'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('REJECTED')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  selectedAction === 'REJECTED'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('REVIEW_REQUESTED')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  selectedAction === 'REVIEW_REQUESTED'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Under Review</span>
              </button>
            </div>
          </div>

          {/* Decision Maker Identity */}
          <div>
            <label htmlFor="decidedBy-input" className="text-xs font-semibold text-slate-300 block mb-1">
              Authorized Decision Maker:
            </label>
            <select
              id="decidedBy-input"
              value={decidedBy}
              onChange={(e) => setDecidedBy(e.target.value)}
              className="w-full text-xs font-medium bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-2.5 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
            >
              <option value="Marcus Vance (VP Global Supply Chain)">Marcus Vance (VP Global Supply Chain)</option>
              <option value="Elena Rostova (Chief Operations Officer)">Elena Rostova (Chief Operations Officer)</option>
              <option value="Dr. Aris Thorne (Chief Risk Officer)">Dr. Aris Thorne (Chief Risk Officer)</option>
              <option value="Sarah Jenkins (Director of Procurement)">Sarah Jenkins (Director of Procurement)</option>
            </select>
          </div>

          {/* Rationale & Audit Trail Note */}
          <div>
            <label htmlFor="notes-textarea" className="text-xs font-semibold text-slate-300 block mb-1">
              Decision Justification / Audit Notes:
            </label>
            <textarea
              id="notes-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg p-2.5 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-normal placeholder-slate-500"
              placeholder="Enter specific justification for corporate audit compliance..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-authorization"
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs cursor-pointer transition-colors"
            >
              Confirm & Commit to Audit Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
