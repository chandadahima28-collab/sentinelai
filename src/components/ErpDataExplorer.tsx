import React, { useState } from 'react';
import { 
  Server, 
  Package, 
  Truck, 
  Users, 
  Boxes, 
  Code2, 
  Search, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { ErpSnapshot } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface Props {
  snapshot: ErpSnapshot;
}

export const ErpDataExplorer: React.FC<Props> = ({ snapshot }) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'suppliers' | 'inventory' | 'customers' | 'apiDocs'>('orders');
  const [searchFilter, setSearchFilter] = useState('');

  const orders = Array.isArray(snapshot?.orders) ? snapshot.orders : [];
  const suppliers = Array.isArray(snapshot?.suppliers) ? snapshot.suppliers : [];
  const inventory = Array.isArray(snapshot?.inventory) ? snapshot.inventory : [];
  const customers = Array.isArray(snapshot?.customers) ? snapshot.customers : [];
  const systemStatus = snapshot?.systemStatus || {
    connectedErp: 'Synthetic ERP Data — BigQuery Live',
    lastSyncTimestamp: new Date().toISOString(),
    syncStatus: 'HEALTHY',
    activeScenario: 'bigquery_live'
  };

  return (
    <div id="erp-data-explorer" className="bg-slate-900/80 rounded-xl border border-slate-800 shadow-xs overflow-hidden space-y-4 text-slate-100">
      {/* Explorer Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Enterprise Telemetry & Synthetic Data Explorer
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                systemStatus?.bigQueryStatus?.source === 'bigquery_live' || systemStatus?.bigQueryStatus?.connected
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {systemStatus?.bigQueryStatus?.connected ? 'Synthetic ERP Data — BigQuery Live' : systemStatus.connectedErp}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synthetic enterprise dataset hosted in Google Cloud BigQuery (<code className="text-indigo-300">sentinelai_data</code>). Prototype architecture is production-ready for secure future integration with SAP S/4HANA, Oracle ERP Cloud, and NetSuite.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Last Ingest: {new Date(systemStatus.lastSyncTimestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* BigQuery Dataset Status Banner */}
      {systemStatus?.bigQueryStatus && (
        <div className="mx-5 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full mt-1 sm:mt-0 shrink-0 ${systemStatus.bigQueryStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-200">Google Cloud BigQuery — Synthetic ERP Dataset:</span>
                <code className="text-indigo-300 bg-indigo-950/50 px-1.5 py-0.5 rounded text-[11px] font-mono">
                  {systemStatus.bigQueryStatus.project || 'smart-bonus-507710-d8'}.{systemStatus.bigQueryStatus.dataset || 'sentinelai_data'}
                </code>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {systemStatus.bigQueryStatus.source === 'bigquery_live' ? 'Live Table Ingest' : 'Synthetic Fallback'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Full enterprise relation modeling across 6 core tables. Designed with decoupled adapters ready for live SAP S/4HANA (OData/IDoc) or Oracle ERP Cloud REST endpoints.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono shrink-0">
            <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Auth: ADC (Cloud Run)</span>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="px-5 border-b border-slate-800 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'orders'
              ? 'border-indigo-400 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Sales & Production Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'suppliers'
              ? 'border-indigo-400 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Tier-1 Suppliers ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'inventory'
              ? 'border-indigo-400 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Inventory & Critical Parts ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('customers')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'customers'
              ? 'border-indigo-400 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Enterprise Customers ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('apiDocs')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
            activeSubTab === 'apiDocs'
              ? 'border-indigo-400 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Enterprise Connector Docs (SAP & Oracle Ready)</span>
        </button>
      </div>

      {/* Sub-tab content */}
      <div className="p-5 pt-0">
        {activeSubTab === 'orders' && (
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4">Product Line</th>
                  <th className="py-3 px-4">Order Value</th>
                  <th className="py-3 px-4">Promised Date</th>
                  <th className="py-3 px-4">SLA Risk Exposure</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-900/40 text-slate-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{o.orderNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{o.customerName}</td>
                    <td className="py-3 px-4 text-slate-300">{o.productLine}</td>
                    <td className="py-3 px-4 font-bold text-white">{formatCurrency(o.value)}</td>
                    <td className="py-3 px-4 text-slate-400">{o.promisedDate}</td>
                    <td className="py-3 px-4">
                      {o.slaPenaltyExposure > 0 ? (
                        <span className="font-bold text-rose-400">
                          {formatCurrency(o.slaPenaltyExposure)} (+{o.predictedDelayDays}d slip)
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">On SLA</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        o.status.includes('Stalled') ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        o.status.includes('Delayed') ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'suppliers' && (
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">On-Time Delivery</th>
                  <th className="py-3 px-4">Lead Time Variance</th>
                  <th className="py-3 px-4">Active Critical Parts</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-900/40 text-slate-200">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                    <td className="py-3 px-4 text-slate-300">{s.country}</td>
                    <td className="py-3 px-4 text-slate-300">{s.category}</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={s.onTimeDeliveryRate < 80 ? 'text-rose-400' : 'text-slate-200'}>
                        {s.onTimeDeliveryRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {s.currentVarianceDays > 3 ? (
                        <span className="font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                          +{s.currentVarianceDays} Days Late
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">+{s.currentVarianceDays} Days</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                      {s.activeComponents.join(', ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        s.status === 'Disrupted' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        s.status === 'Delayed' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'inventory' && (
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">SKU / Item Code</th>
                  <th className="py-3 px-4">Part Description</th>
                  <th className="py-3 px-4">Primary Vendor</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Reorder Point</th>
                  <th className="py-3 px-4">Days of Cover</th>
                  <th className="py-3 px-4">Buffer Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-900/40 text-slate-200">
                {inventory.map((item) => (
                  <tr key={item.sku} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{item.sku}</td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{item.name}</td>
                    <td className="py-3 px-4 text-slate-300">{item.supplierName}</td>
                    <td className="py-3 px-4 font-bold font-mono text-white">{formatNumber(item.currentStock)} units</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{formatNumber(item.reorderPoint)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold font-mono ${item.daysOfCover <= 3 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {item.daysOfCover} Days
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.status === 'Depleted' || item.status === 'Critical Buffer'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'customers' && (
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Customer Account</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Annual Contract</th>
                  <th className="py-3 px-4">Active Orders</th>
                  <th className="py-3 px-4">SLA Commitment</th>
                  <th className="py-3 px-4">Penalty Clause</th>
                  <th className="py-3 px-4">Relationship Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 bg-slate-900/40 text-slate-200">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{formatCurrency(c.contractValue)}</td>
                    <td className="py-3 px-4 text-slate-200 font-semibold">{c.activeOrders}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">{c.slaCommitmentPct}% On-Time</td>
                    <td className="py-3 px-4 text-rose-400 font-mono font-semibold">
                      {formatCurrency(c.slaPenaltyPerDay)} / day late
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        c.healthStatus === 'Critical Risk' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        c.healthStatus === 'Monitored' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {c.healthStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeSubTab === 'apiDocs' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-[11px] space-y-3 border border-slate-800">
              <div className="text-emerald-400 font-bold text-xs uppercase">
                # SentinelAI Enterprise Integration Endpoints & BigQuery Connector
              </div>
              <div>
                <span className="text-amber-400 font-bold">GET</span> /api/bigquery/snapshot
                <p className="text-slate-400 text-[10px] pl-4">Ingests Google Cloud BigQuery dataset <code className="text-indigo-300">smart-bonus-507710-d8:sentinelai_data</code> (customers, suppliers, orders, inventory, invoices, payments) via Application Default Credentials (ADC).</p>
              </div>
              <div>
                <span className="text-amber-400 font-bold">GET</span> /api/bigquery/status
                <p className="text-slate-400 text-[10px] pl-4">Returns connection diagnostics, table row counts, ADC identity mode, and health status.</p>
              </div>
              <div>
                <span className="text-amber-400 font-bold">GET</span> /api/erp/snapshot
                <p className="text-slate-400 text-[10px] pl-4">Returns current synthetic ERP telemetry snapshot, risk scores, customers, suppliers, and inventory (supports <code className="text-indigo-300">?source=bigquery</code>).</p>
              </div>
              <div>
                <span className="text-blue-400 font-bold">POST</span> /api/erp/sync
                <p className="text-slate-400 text-[10px] pl-4">Refreshes synthetic ERP data from BigQuery dataset or triggers enterprise connector adapters (SAP S/4HANA & Oracle ERP Cloud ready).</p>
              </div>
              <div>
                <span className="text-blue-400 font-bold">POST</span> /api/erp/scenario
                <p className="text-slate-400 text-[10px] pl-4">Body: {`{ "scenario": "bigquery_live" | "semiconductor_crisis" | "liquidity_cash_crunch" | "logistics_sorter_failure" | "nominal_healthy" }`}</p>
              </div>
              <div>
                <span className="text-blue-400 font-bold">POST</span> /api/recommendations/action
                <p className="text-slate-400 text-[10px] pl-4">Body: {`{ "recommendationId": "REC-8041-A", "riskId": "RISK-8041", "action": "APPROVED", "decidedBy": "VP", "notes": "..." }`}</p>
              </div>
              <div>
                <span className="text-blue-400 font-bold">POST</span> /api/ai/analyze-risk
                <p className="text-slate-400 text-[10px] pl-4">Invokes Gemini 3.8 Flash for deep root-cause explanation and cross-table correlation.</p>
              </div>
              <div>
                <span className="text-blue-400 font-bold">POST</span> /api/ai/simulate
                <p className="text-slate-400 text-[10px] pl-4">Runs what-if simulation with counterfactual parameters and returns AI executive synthesis.</p>
              </div>
              <div>
                <span className="text-blue-400 font-bold">POST</span> /api/ai/chat
                <p className="text-slate-400 text-[10px] pl-4">Conversational risk assistant with real-time enterprise dataset context.</p>
              </div>
            </div>

            <div className="p-4 bg-indigo-950/30 rounded-xl border border-indigo-500/30 text-slate-300 space-y-2 text-xs">
              <span className="font-bold text-indigo-200 block text-sm">Enterprise Connector Architecture (SAP S/4HANA & Oracle ERP Ready)</span>
              <p className="text-slate-300 leading-relaxed">
                The current prototype uses <strong>Synthetic ERP Data — BigQuery Live</strong> hosted in Google Cloud BigQuery (<code className="text-indigo-300">sentinelai_data</code>), enabling full end-to-end evaluation without requiring invasive production SAP/Oracle system credentials during the proof-of-concept phase.
              </p>
              <p className="text-slate-300 leading-relaxed">
                SentinelAI implements a stateless risk-scoring adapter pattern. In a live enterprise deployment, incoming webhooks from <strong>SAP S/4HANA</strong> (OData v4, IDoc, or SAP Event Mesh) and <strong>Oracle ERP Cloud</strong> (REST APIs or OIC) feed directly into the same normalized data contract. All autonomous AI recommendations enforce human-in-the-loop governance before triggering downstream reversal or purchase order webhooks.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
