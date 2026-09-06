import { ErpSnapshot } from '../types';

/**
 * Safely normalizes and unwraps ERP snapshot data from API responses.
 * Ensures arrays such as risks, customers, suppliers, orders, inventory, and auditLog
 * are always guaranteed to be valid arrays, preventing undefined.filter/map/reduce runtime errors.
 */
export function normalizeSnapshot(data: any): ErpSnapshot | null {
  if (!data) return null;
  const raw = data.snapshot && typeof data.snapshot === 'object' ? data.snapshot : data;
  if (!raw || typeof raw !== 'object') return null;

  const risks = Array.isArray(raw.risks) ? raw.risks : [];
  const auditLog = Array.isArray(raw.auditLog) ? raw.auditLog : [];
  const customers = Array.isArray(raw.customers) ? raw.customers : [];
  const suppliers = Array.isArray(raw.suppliers) ? raw.suppliers : [];
  const orders = Array.isArray(raw.orders) ? raw.orders : [];
  const inventory = Array.isArray(raw.inventory) ? raw.inventory : [];

  return {
    systemStatus: raw.systemStatus || {
      connectedErp: 'Synthetic ERP Data — BigQuery Live',
      lastSyncTimestamp: new Date().toISOString(),
      syncStatus: 'HEALTHY',
      activeScenario: 'bigquery_live'
    },
    metrics: raw.metrics || {
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
    },
    risks,
    customers,
    suppliers,
    orders,
    inventory,
    auditLog
  };
}
