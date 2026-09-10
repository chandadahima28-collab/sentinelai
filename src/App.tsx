import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  GitFork, 
  Bot, 
  FileCheck2, 
  Search, 
  Filter, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Server
} from 'lucide-react';
import { 
  ErpSnapshot, 
  RiskItem, 
  Recommendation, 
  WhatIfSimulationInput, 
  WhatIfSimulationResult 
} from './types';
import { normalizeSnapshot } from './utils/normalizeSnapshot';
import { Header } from './components/Header';
import { ExecutiveSummaryCards } from './components/ExecutiveSummaryCards';
import { CascadingImpactGraph } from './components/CascadingImpactGraph';
import { RiskCard } from './components/RiskCard';
import { RiskDetailModal } from './components/RiskDetailModal';
import { ApprovalActionModal } from './components/ApprovalActionModal';
import { HumanInTheLoopAudit } from './components/HumanInTheLoopAudit';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AiRiskAssistant } from './components/AiRiskAssistant';
import { ErpDataExplorer } from './components/ErpDataExplorer';
import { ExplainableAiBadge } from './components/ExplainableAiBadge';

export default function App() {
  const [snapshot, setSnapshot] = useState<ErpSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'risks' | 'cascade' | 'simulator' | 'assistant' | 'audit' | 'erp'>('dashboard');
  const [showWelcome, setShowWelcome] = useState(true);

  // Filter for risks tab
  const [riskSeverityFilter, setRiskSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [riskSearchQuery, setRiskSearchQuery] = useState('');

  // Modals state
  const [selectedRiskForDetails, setSelectedRiskForDetails] = useState<RiskItem | null>(null);
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [geminiDeepAnalysis, setGeminiDeepAnalysis] = useState<any | null>(null);

  const [approvalModalData, setApprovalModalData] = useState<{
    isOpen: boolean;
    risk: RiskItem | null;
    recommendation: Recommendation | null;
    initialAction: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED';
  }>({
    isOpen: false,
    risk: null,
    recommendation: null,
    initialAction: 'APPROVED'
  });

  // User notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch initial ERP Snapshot
  const fetchSnapshot = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/erp/snapshot');
      if (!res.ok) {
        throw new Error(`Failed to load ERP snapshot: ${res.statusText}`);
      }
      const rawData = await res.json();
      const parsed = normalizeSnapshot(rawData);
      if (!parsed) {
        throw new Error('Received invalid or empty ERP snapshot');
      }
      setSnapshot(parsed);
    } catch (err: any) {
      console.error('Fetch snapshot error:', err);
      setError(err.message || 'Unable to connect to SentinelAI ERP service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
  }, []);

  // Trigger ERP Sync
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/erp/sync', { method: 'POST' });
      const rawData = await res.json();
      const parsed = normalizeSnapshot(rawData);
      if (parsed) {
        setSnapshot(parsed);
      }
      const isBq = parsed?.systemStatus?.bigQueryStatus?.source === 'bigquery_live';
      showToast(
        isBq
          ? 'Synchronized 6 tables with Google Cloud BigQuery (Synthetic ERP Dataset: sentinelai_data). Risk engine refreshed.'
          : 'Successfully synchronized with synthetic ERP dataset. Risk scores updated.'
      );
    } catch (err) {
      console.error('Sync failed:', err);
      showToast('Synchronization error with data connector.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Switch Scenario or return to BigQuery Live
  const handleSwitchScenario = async (scenario: 'bigquery_live' | 'semiconductor_crisis' | 'liquidity_cash_crunch' | 'logistics_sorter_failure' | 'nominal_healthy') => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/erp/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const rawData = await res.json();
      const parsed = normalizeSnapshot(rawData);
      if (parsed) {
        setSnapshot(parsed);
      }
      showToast(
        scenario === 'bigquery_live'
          ? 'Active Ingest: Synthetic ERP Data — BigQuery Live (sentinelai_data)'
          : `Switched scenario to: ${scenario.replace('_', ' ').toUpperCase()}`
      );
    } catch (err) {
      console.error('Scenario switch failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Run What-If Simulation
  const handleRunSimulation = async (input: WhatIfSimulationInput): Promise<WhatIfSimulationResult> => {
    const res = await fetch('/api/ai/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!res.ok) {
      throw new Error('Simulation failed');
    }
    return await res.json();
  };

  // AI Chat Assistant Query
  const handleSendMessage = async (query: string, history: { sender: 'user' | 'assistant'; text: string }[]) => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history })
    });
    if (!res.ok) {
      throw new Error('Chat failed');
    }
    return await res.json();
  };

  // Deep Root-Cause Analysis via Gemini
  const handleDeepAnalyzeRisk = async (risk: RiskItem) => {
    setIsAnalyzingRisk(true);
    try {
      const res = await fetch('/api/ai/analyze-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskId: risk.id })
      });
      const data = await res.json();
      setGeminiDeepAnalysis(data);
      showToast(`Gemini analyzed root causes for ${risk.id}.`);
    } catch (err) {
      console.error('AI root cause analysis failed:', err);
    } finally {
      setIsAnalyzingRisk(false);
    }
  };

  // Commit Human Approval / Rejection
  const handleCommitApproval = async (data: {
    recommendationId: string;
    riskId: string;
    action: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED';
    decidedBy: string;
    notes: string;
  }) => {
    try {
      const res = await fetch('/api/recommendations/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to record action');
      const rawData = await res.json();
      const updatedSnapshot = normalizeSnapshot(rawData);
      if (updatedSnapshot) {
        setSnapshot(updatedSnapshot);
        // Update selected risk if open
        if (selectedRiskForDetails) {
          const updatedRisk = updatedSnapshot.risks.find(r => r.id === selectedRiskForDetails.id);
          if (updatedRisk) setSelectedRiskForDetails(updatedRisk);
        }
      }
      setApprovalModalData({ isOpen: false, risk: null, recommendation: null, initialAction: 'APPROVED' });

      showToast(`Executive sign-off recorded: ${data.action} by ${data.decidedBy}`);
    } catch (err) {
      console.error('Commit approval failed:', err);
      showToast('Error recording approval decision.');
    }
  };

  const openApprovalModal = (
    risk: RiskItem,
    recommendation: Recommendation,
    initialAction: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED'
  ) => {
    setApprovalModalData({
      isOpen: true,
      risk,
      recommendation,
      initialAction
    });
  };

  if (loading && !snapshot) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg ring-4 ring-indigo-950/60 animate-pulse mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Initializing SentinelAI Engine</h1>
        <p className="text-xs text-slate-400 mt-1">Connecting to Google Cloud BigQuery synthetic ERP dataset and evaluating neural risk models...</p>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Enterprise Data Connection Failed</h2>
          <p className="text-xs text-slate-400">{error || 'Could not load enterprise data snapshot.'}</p>
          <button
            onClick={fetchSnapshot}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Guaranteed safe risks list
  const risksList = Array.isArray(snapshot?.risks) ? snapshot.risks : [];

  // Filtered risks for the Risks tab
  const filteredRisks = risksList.filter(r => {
    if (!r) return false;
    const matchesSeverity = 
      riskSeverityFilter === 'ALL' || 
      (r.severity && r.severity.toUpperCase() === riskSeverityFilter);
    const matchesSearch = 
      (r.title && r.title.toLowerCase().includes(riskSearchQuery.toLowerCase())) ||
      (r.summary && r.summary.toLowerCase().includes(riskSearchQuery.toLowerCase())) ||
      (r.id && r.id.toLowerCase().includes(riskSearchQuery.toLowerCase())) ||
      (r.category && r.category.toLowerCase().includes(riskSearchQuery.toLowerCase()));
    return matchesSeverity && matchesSearch;
  });
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-4xl text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <ShieldAlert className="w-10 h-10 text-cyan-400" />
              </div>
              <span className="text-3xl font-bold tracking-tight">SENTINEL<span className="text-cyan-400">AI</span></span>
            </div>
            <p className="text-cyan-400 text-sm font-semibold tracking-[0.25em] uppercase mb-4">Autonomous Business Risk Intelligence</p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Detect. Predict. Prevent.</h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              An autonomous AI platform that detects emerging business risks, predicts cascading impact, and recommends proactive decisions with human approval.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            {["AI-Powered Risk Detection", "Cascading Impact Analysis", "What-If Simulation", "Human-in-the-Loop Governance"].map((item) => (
              <div key={item} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">{item}</div>
            ))}
          </div>
          <button
            onClick={() => setShowWelcome(false)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
          >
            Enter SentinelAI
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-8 text-xs text-slate-500">Google Cloud • Gemini • BigQuery | Synthetic ERP Demo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-750 flex items-center gap-2.5 text-xs font-medium animate-slideUp backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Navigation */}
      <Header
        snapshot={snapshot}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSync={handleSync}
        isSyncing={isSyncing}
        onSwitchScenario={handleSwitchScenario}
      />

      {/* Main App Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Executive Cards */}
            <ExecutiveSummaryCards
              snapshot={snapshot}
              onNavigateToRisks={() => setActiveTab('risks')}
              onNavigateToSimulator={() => setActiveTab('simulator')}
            />

            {/* Quick Cascading Preview */}
            <CascadingImpactGraph
              risks={risksList}
              selectedRiskId={risksList[0]?.id}
              onNavigateToSimulator={() => setActiveTab('simulator')}
            />

            {/* Active Risks Section Header & Top 2 Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Highest Priority Business Risks
                  </h3>
                  <p className="text-xs text-slate-400">
                    Emerging anomalies analyzed by Gemini root-cause engine with human-in-the-loop mitigation proposals
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('risks')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>View all {risksList.length} active risks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {risksList.slice(0, 2).map((risk) => (
                  <RiskCard
                    key={risk.id}
                    risk={risk}
                    onOpenDetails={(r) => {
                      setSelectedRiskForDetails(r);
                      setGeminiDeepAnalysis(null);
                    }}
                    onOpenApprovalModal={openApprovalModal}
                    onDeepAnalyzeWithGemini={(r) => {
                      setSelectedRiskForDetails(r);
                      handleDeepAnalyzeRisk(r);
                    }}
                    isAnalyzing={isAnalyzingRisk}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE RISKS & ROOT CAUSE */}
        {activeTab === 'risks' && (
          <div className="space-y-6">
            {/* Filter & Search Toolbar */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-400">Severity:</span>
                <div className="flex flex-wrap gap-1">
                  {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setRiskSeverityFilter(sev)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                        riskSeverityFilter === sev
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={riskSearchQuery}
                  onChange={(e) => setRiskSearchQuery(e.target.value)}
                  placeholder="Search risk title, SKU, or supplier..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-100 bg-slate-950 border border-slate-800 rounded-lg shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Risk Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRisks.map((risk) => (
                <RiskCard
                  key={risk.id}
                  risk={risk}
                  onOpenDetails={(r) => {
                    setSelectedRiskForDetails(r);
                    setGeminiDeepAnalysis(null);
                  }}
                  onOpenApprovalModal={openApprovalModal}
                  onDeepAnalyzeWithGemini={(r) => {
                    setSelectedRiskForDetails(r);
                    handleDeepAnalyzeRisk(r);
                  }}
                  isAnalyzing={isAnalyzingRisk}
                />
              ))}
            </div>

            {filteredRisks.length === 0 && (
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-12 text-center text-slate-400">
                No active risks matching current filter criteria.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CASCADING IMPACT GRAPH */}
        {activeTab === 'cascade' && (
          <CascadingImpactGraph
            risks={risksList}
            selectedRiskId={risksList[0]?.id}
            onNavigateToSimulator={() => setActiveTab('simulator')}
          />
        )}

        {/* TAB 4: WHAT-IF SIMULATOR */}
        {activeTab === 'simulator' && (
          <WhatIfSimulator onRunSimulation={handleRunSimulation} />
        )}

        {/* TAB 5: AI RISK ASSISTANT */}
        {activeTab === 'assistant' && (
          <AiRiskAssistant snapshot={snapshot} onSendMessage={handleSendMessage} />
        )}

        {/* TAB 6: AUDIT TRAIL & APPROVALS */}
        {activeTab === 'audit' && (
          <HumanInTheLoopAudit
            auditLog={snapshot.auditLog || []}
            risks={risksList}
            onOpenApprovalModal={openApprovalModal}
          />
        )}

        {/* TAB 7: ERP DATA EXPLORER */}
        {activeTab === 'erp' && (
          <ErpDataExplorer snapshot={snapshot} />
        )}
      </main>

      {/* MODAL 1: Risk Dossier Details */}
      {selectedRiskForDetails && (
        <RiskDetailModal
          risk={selectedRiskForDetails}
          onClose={() => setSelectedRiskForDetails(null)}
          onOpenApprovalModal={openApprovalModal}
          onDeepAnalyzeWithGemini={handleDeepAnalyzeRisk}
          isAnalyzing={isAnalyzingRisk}
          geminiDeepAnalysis={geminiDeepAnalysis}
        />
      )}

      {/* MODAL 2: Human In The Loop Decision Authorization */}
      {approvalModalData.isOpen && approvalModalData.risk && approvalModalData.recommendation && (
        <ApprovalActionModal
          risk={approvalModalData.risk}
          recommendation={approvalModalData.recommendation}
          action={approvalModalData.initialAction}
          onClose={() => setApprovalModalData({ isOpen: false, risk: null, recommendation: null, initialAction: 'APPROVED' })}
          onSubmit={handleCommitApproval}
        />
      )}
    </div>
  );
}
