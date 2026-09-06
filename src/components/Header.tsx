import React from 'react';
import { 
  ShieldAlert, 
  RefreshCw, 
  Server, 
  GitFork, 
  Sliders, 
  Bot, 
  FileCheck2, 
  Layers, 
  AlertTriangle,
  Activity,
  Database
} from 'lucide-react';
import { ErpSnapshot } from '../types';

interface HeaderProps {
  snapshot: ErpSnapshot | null;
  activeTab: 'dashboard' | 'risks' | 'cascade' | 'simulator' | 'assistant' | 'audit' | 'erp';
  setActiveTab: (tab: 'dashboard' | 'risks' | 'cascade' | 'simulator' | 'assistant' | 'audit' | 'erp') => void;
  onSync: () => void;
  isSyncing: boolean;
  onSwitchScenario: (scenario: 'bigquery_live' | 'semiconductor_crisis' | 'liquidity_cash_crunch' | 'logistics_sorter_failure' | 'nominal_healthy') => void;
}

export const Header: React.FC<HeaderProps> = ({
  snapshot,
  activeTab,
  setActiveTab,
  onSync,
  isSyncing,
  onSwitchScenario,
}) => {
  const activeScenario = snapshot?.systemStatus.activeScenario || 'bigquery_live';
  const isBqLive = snapshot?.systemStatus?.bigQueryStatus?.source === 'bigquery_live' || 
                   snapshot?.systemStatus?.bigQueryStatus?.connected === true;

  return (
    <header id="app-header" className="bg-slate-900/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 shadow-md">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3 border-b border-slate-800">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm ring-4 ring-indigo-950/60">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg tracking-tight">SentinelAI</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                  <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
                  Autonomous Agent
                </span>
                {isBqLive && (
                  <span id="header-bq-status-badge" className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-xs">
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>Synthetic ERP — BigQuery Live</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Autonomous Business Risk Intelligence & Decision Support • Enterprise Architecture (SAP & Oracle Ready)
              </p>
            </div>
          </div>

          {/* ERP Connector & Scenario Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live Data Source Badge */}
            <div 
              id="erp-connector-badge" 
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs font-mono ${
                isBqLive 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-950/80 border-slate-800 text-slate-300'
              }`}
              title={isBqLive ? 'Connected to Google Cloud BigQuery synthetic ERP dataset (sentinelai_data). Architecture ready for secure SAP S/4HANA or Oracle Cloud ERP integration.' : 'Operating in synthetic simulation mode'}
            >
              {isBqLive ? (
                <Database className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Server className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-semibold">
                {isBqLive ? 'Synthetic ERP Data — BigQuery Live' : (snapshot?.systemStatus?.connectedErp || 'Synthetic ERP Simulation')}
              </span>
              <span className={`w-2 h-2 rounded-full ${isBqLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            </div>

            {/* Scenario Selector */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="scenario-select" className="text-xs font-medium text-slate-400">
                Dataset / Scenario:
              </label>
              <select
                id="scenario-select"
                value={activeScenario}
                onChange={(e) => onSwitchScenario(e.target.value as any)}
                className="text-xs font-medium bg-slate-950 text-slate-200 border border-slate-700/80 rounded-md px-2.5 py-1.5 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
              >
                <option value="bigquery_live">⚡ Synthetic ERP Data — BigQuery Live (sentinelai_data)</option>
                <option value="semiconductor_crisis">⚠️ Synthetic Stress Scenario: Apex Microchip Crisis (Critical)</option>
                <option value="liquidity_cash_crunch">💸 Synthetic Stress Scenario: NovaTech Net-60 Delinquency</option>
                <option value="logistics_sorter_failure">⚙️ Synthetic Stress Scenario: Chicago Sorter Motor Seizure</option>
                <option value="nominal_healthy">✅ Synthetic Stress Scenario: Healthy Baseline</option>
              </select>
            </div>

            {/* Sync Button */}
            <button
              id="btn-erp-sync"
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              title={isBqLive ? 'Refresh synthetic ERP dataset from BigQuery and recompute risk matrix' : 'Sync latest synthetic ERP dataset and re-evaluate risk models'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : isBqLive ? 'Sync BigQuery' : 'Sync ERP Data'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Overview Dashboard</span>
          </button>

          <button
            id="tab-risks"
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'risks'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Active Risks & Root Cause</span>
            {snapshot && snapshot.metrics.activeCriticalRisks > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                {snapshot.metrics.activeCriticalRisks}
              </span>
            )}
          </button>

          <button
            id="tab-cascade"
            onClick={() => setActiveTab('cascade')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'cascade'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>Cascading Impact Graph</span>
          </button>

          <button
            id="tab-simulator"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>What-If Simulator</span>
          </button>

          <button
            id="tab-assistant"
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'assistant'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Risk Assistant</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              Gemini
            </span>
          </button>

          <button
            id="tab-audit"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Approvals & Audit Trail</span>
          </button>

          <button
            id="tab-erp"
            onClick={() => setActiveTab('erp')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'erp'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>ERP Data Explorer</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
