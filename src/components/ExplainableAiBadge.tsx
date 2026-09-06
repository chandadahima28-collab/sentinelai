import React from 'react';
import { Database, BrainCircuit, TrendingUp, ShieldAlert } from 'lucide-react';

export type AiDataType = 'OBSERVED_DATA' | 'AI_ROOT_CAUSE' | 'PREDICTIVE_CASCADE' | 'RECOMMENDATION';

interface Props {
  type: AiDataType;
  label?: string;
  size?: 'sm' | 'md';
}

export const ExplainableAiBadge: React.FC<Props> = ({ type, label, size = 'sm' }) => {
  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (type) {
    case 'OBSERVED_DATA':
      return (
        <span
          id={`badge-observed-${label || 'data'}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/70 ${sizeClasses}`}
          title="Factual recorded data from ERP telematics, EDI purchase orders, and factory sensors"
        >
          <Database className="w-3 h-3 text-slate-400" />
          <span>{label || 'Observed ERP Fact'}</span>
        </span>
      );
    case 'AI_ROOT_CAUSE':
      return (
        <span
          id={`badge-ai-${label || 'root'}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 ${sizeClasses}`}
          title="Synthesized by Gemini AI reasoning over cross-system logs and historical baselines"
        >
          <BrainCircuit className="w-3 h-3 text-indigo-400" />
          <span>{label || 'Gemini AI Root Cause'}</span>
        </span>
      );
    case 'PREDICTIVE_CASCADE':
      return (
        <span
          id={`badge-predictive-${label || 'cascade'}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/30 ${sizeClasses}`}
          title="Downstream probabilistic cascade simulation based on dependency graph"
        >
          <TrendingUp className="w-3 h-3 text-amber-400" />
          <span>{label || 'Predictive Cascade'}</span>
        </span>
      );
    case 'RECOMMENDATION':
      return (
        <span
          id={`badge-recommendation-${label || 'rec'}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 ${sizeClasses}`}
          title="Proactive mitigation proposal. Requires human approval before execution."
        >
          <ShieldAlert className="w-3 h-3 text-emerald-400" />
          <span>{label || 'Proactive Mitigation'}</span>
        </span>
      );
  }
};
