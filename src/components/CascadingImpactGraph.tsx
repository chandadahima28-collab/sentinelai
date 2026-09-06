import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowRight, 
  Factory, 
  Truck, 
  Package, 
  Building2, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Sliders
} from 'lucide-react';
import { RiskItem, CascadingNode } from '../types';
import { ExplainableAiBadge } from './ExplainableAiBadge';

interface Props {
  risks: RiskItem[];
  selectedRiskId?: string;
  onNavigateToSimulator?: (risk: RiskItem) => void;
}

export const CascadingImpactGraph: React.FC<Props> = ({ 
  risks, 
  selectedRiskId,
  onNavigateToSimulator 
}) => {
  const safeRisks = Array.isArray(risks) ? risks : [];
  const [activeRiskId, setActiveRiskId] = useState<string>(selectedRiskId || safeRisks[0]?.id || 'RISK-8041');
  const [selectedNode, setSelectedNode] = useState<CascadingNode | null>(null);

  const currentRisk = safeRisks.find(r => r.id === activeRiskId) || safeRisks[0];

  if (!currentRisk || !currentRisk.cascadingImpact) {
    return <div className="p-8 text-center text-slate-500">No active risks to analyze.</div>;
  }

  const stages = Array.isArray(currentRisk.cascadingImpact.stages) ? currentRisk.cascadingImpact.stages : [];
  const links = Array.isArray(currentRisk.cascadingImpact.links) ? currentRisk.cascadingImpact.links : [];
  const cascadeSummary = currentRisk.cascadingImpact.cascadeSummary || '';

  const getNodeIcon = (nodeType: CascadingNode['nodeType']) => {
    switch (nodeType) {
      case 'supplier':
        return <Truck className="w-5 h-5 text-purple-400" />;
      case 'production':
        return <Factory className="w-5 h-5 text-amber-400" />;
      case 'order':
        return <Package className="w-5 h-5 text-blue-400" />;
      case 'customer':
        return <Building2 className="w-5 h-5 text-indigo-400" />;
      case 'financial':
        return <DollarSign className="w-5 h-5 text-rose-400" />;
    }
  };

  const getNodeStatusBorder = (status: CascadingNode['status']) => {
    switch (status) {
      case 'failed':
        return 'border-rose-500/80 bg-rose-950/30 ring-2 ring-rose-500/30 text-slate-100';
      case 'critical':
        return 'border-rose-500/60 bg-rose-950/20 ring-1 ring-rose-500/20 text-slate-100';
      case 'warning':
        return 'border-amber-500/60 bg-amber-950/20 ring-1 ring-amber-500/20 text-slate-100';
      default:
        return 'border-slate-800 bg-slate-900/90 text-slate-100';
    }
  };

  return (
    <div id="cascading-impact-container" className="bg-slate-900/80 rounded-xl border border-slate-800 shadow-xs overflow-hidden text-slate-100">
      {/* Header & Risk Selector */}
      <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Interactive Cascading Downstream Impact Graph
              </h2>
              <p className="text-xs text-slate-400">
                Propagational mapping: How root operational failures cascade into financial exposure
              </p>
            </div>
          </div>
        </div>

        {/* Risk Selection Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="risk-cascade-select" className="text-xs font-semibold text-slate-400">
            Selected Vector:
          </label>
          <select
            id="risk-cascade-select"
            value={activeRiskId}
            onChange={(e) => {
              setActiveRiskId(e.target.value);
              setSelectedNode(null);
            }}
            className="text-xs font-medium bg-slate-900 text-slate-200 border border-slate-800 rounded-md px-3 py-1.5 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          >
            {risks.map((r) => (
              <option key={r.id} value={r.id}>
                [{r.severity.toUpperCase()}] {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Narrative Ribbon */}
      <div className="px-6 py-3 bg-indigo-950/20 border-b border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium">
          <ExplainableAiBadge type="PREDICTIVE_CASCADE" />
          <span className="font-semibold text-indigo-300">Cascade Pathway:</span>
          <span className="text-slate-300 font-mono text-[11px]">{cascadeSummary}</span>
        </div>
        {onNavigateToSimulator && (
          <button
            onClick={() => onNavigateToSimulator(currentRisk)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-300 hover:text-white bg-slate-900 border border-indigo-500/30 rounded-md shadow-2xs hover:bg-indigo-950/60 transition-colors cursor-pointer shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate What-If on this Cascade</span>
          </button>
        )}
      </div>

      {/* Main Cascade Visualization Flow */}
      <div className="p-4 sm:p-8 overflow-x-auto bg-slate-950/50">
        <div className="min-w-[860px] flex items-center justify-between gap-2 relative py-4">
          {stages.map((stage, idx) => {
            const isSelected = selectedNode?.id === stage.id;
            const linkToNext = links[idx];

            return (
              <React.Fragment key={stage.id}>
                {/* Node Box */}
                <div
                  id={`cascade-node-${stage.id}`}
                  onClick={() => setSelectedNode(stage)}
                  className={`flex-1 max-w-[190px] rounded-xl border p-4 shadow-xs transition-all cursor-pointer relative ${getNodeStatusBorder(
                    stage.status
                  )} ${isSelected ? 'ring-2 ring-indigo-400 shadow-md scale-102' : 'hover:border-slate-700'}`}
                >
                  {/* Step Sequence Badge */}
                  <div className="absolute -top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700 shadow-xs">
                    Step {idx + 1}
                  </div>

                  {/* Header Icon + NodeType */}
                  <div className="flex items-center justify-between mt-1 mb-2">
                    <div className="p-1.5 rounded-md bg-slate-950 border border-slate-800 shadow-2xs">
                      {getNodeIcon(stage.nodeType)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {stage.nodeType}
                    </span>
                  </div>

                  {/* Entity and Name */}
                  <h4 className="text-xs font-bold text-white line-clamp-1" title={stage.name}>
                    {stage.name}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-300 mt-0.5 line-clamp-1" title={stage.entity}>
                    {stage.entity}
                  </p>

                  {/* Primary Metric Pill */}
                  <div className="mt-3 pt-2 border-t border-slate-800">
                    <span className="inline-block text-[11px] font-bold text-slate-200 bg-slate-950/90 px-2 py-1 rounded border border-slate-800 w-full text-center font-mono">
                      {stage.metric}
                    </span>
                  </div>
                </div>

                {/* Arrow Connector Link */}
                {idx < stages.length - 1 && (
                  <div className="flex flex-col items-center justify-center shrink-0 w-16 px-1 relative">
                    <div className="text-[10px] font-semibold text-slate-400 text-center mb-1 leading-tight line-clamp-2">
                      {linkToNext?.label || 'Cascades to'}
                    </div>
                    <div className="flex items-center text-slate-500">
                      <div className="w-8 h-0.5 bg-slate-700"></div>
                      <ArrowRight className="w-4 h-4 text-slate-400 -ml-1" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Telemetry Drawer */}
      <div className="p-5 bg-slate-950/80 border-t border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  {selectedNode ? selectedNode.name : 'Select any node above to inspect ERP telemetry and propagation mechanics'}
                </h4>
                {selectedNode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-800">
                    {selectedNode.nodeType}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedNode
                  ? selectedNode.description
                  : 'Click on any step in the cascading chain (e.g. Supplier Disruption, Production Halt, Customer SLA) to review specific contract clauses, component buffer levels, and mitigation vectors.'}
              </p>
              {selectedNode && (
                <div className="mt-2 flex flex-wrap gap-4 text-xs font-mono">
                  <div className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    <span className="text-slate-400">Entity: </span>
                    <span className="font-semibold text-slate-200">{selectedNode.entity}</span>
                  </div>
                  <div className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    <span className="text-slate-400">Telemetric Impact: </span>
                    <span className="font-semibold text-rose-400 font-mono">{selectedNode.metric}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <ExplainableAiBadge type="OBSERVED_DATA" label="BigQuery ERP Telemetry Verified" />
          </div>
        </div>
      </div>
    </div>
  );
};
