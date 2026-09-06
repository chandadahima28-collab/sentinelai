export type RiskSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type RiskCategory = 
  | 'SUPPLY_CHAIN' 
  | 'PRODUCTION' 
  | 'FINANCIAL_LIQUIDITY' 
  | 'CUSTOMER_SLA' 
  | 'OPERATIONAL_FAILURE';

export type RecommendationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';

export interface EvidenceDataPoint {
  metric: string;
  value: string;
  baseline: string;
  deviation: string;
  status: 'critical' | 'warning' | 'normal';
}

export interface CascadingNode {
  id: string;
  name: string;
  nodeType: 'supplier' | 'production' | 'order' | 'customer' | 'financial';
  entity: string;
  metric: string;
  status: 'critical' | 'warning' | 'failed' | 'on-track';
  description: string;
}

export interface CascadingLink {
  from: string;
  to: string;
  label: string;
  severity: 'critical' | 'warning' | 'nominal';
}

export interface CascadingImpact {
  stages: CascadingNode[];
  links: CascadingLink[];
  cascadeSummary: string;
}

export interface BusinessImpact {
  revenueExposure: number;
  slaPenaltyExposure: number;
  affectedCustomersCount: number;
  affectedOrdersCount: number;
  affectedCustomers: string[];
  operationalDaysLost: number;
  slaRiskPct: number;
}

export interface Recommendation {
  id: string;
  riskId: string;
  title: string;
  actionType: 'EXPEDITE_AIR_FREIGHT' | 'SECONDARY_SUPPLIER' | 'RENEGOTIATE_SLA' | 'DYNAMIC_REALLOCATION' | 'CREDIT_HOLD_INVOICE' | 'FACILITY_OVERTIME';
  description: string;
  rationale: string;
  expectedRiskReduction: number; // e.g. -38 points
  financialProtection: number; // e.g. $980,000 preserved
  estimatedCost: number; // e.g. $42,000
  implementationTimeline: string; // e.g. "12-24 hours"
  requiresHumanApproval: boolean;
  status: RecommendationStatus;
  suggestedBy: 'SentinelAI Autonomous Agent';
  auditNote?: string;
  decisionTimestamp?: string;
  decidedBy?: string;
}

export interface RiskItem {
  id: string;
  title: string;
  category: RiskCategory;
  score: number; // 0-100
  severity: RiskSeverity;
  detectedAt: string;
  status: 'ACTIVE' | 'MITIGATING' | 'RESOLVED';
  summary: string;
  evidenceDataPoints: EvidenceDataPoint[];
  rootCauseAnalysis: {
    primaryCause: string;
    contributingFactors: string[];
    confidenceScore: number;
    explanation: string;
    aiEvidenceSummary: string;
  };
  cascadingImpact: CascadingImpact;
  businessImpact: BusinessImpact;
  recommendations: Recommendation[];
}

export interface AuditEntry {
  id: string;
  recommendationId: string;
  riskId: string;
  riskTitle: string;
  recommendationTitle: string;
  decision: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED';
  decidedBy: string;
  timestamp: string;
  notes: string;
  expectedImpact: string;
  financialProtection: number;
}

export interface CustomerData {
  id: string;
  name: string;
  tier: 'Tier 1 Global' | 'Tier 2 Strategic' | 'Tier 3 Regional';
  contractValue: number;
  activeOrders: number;
  slaCommitmentPct: number;
  slaPenaltyPerDay: number;
  healthStatus: 'Critical Risk' | 'Monitored' | 'Optimal';
}

export interface SupplierData {
  id: string;
  name: string;
  category: string;
  country: string;
  criticality: 'Critical' | 'High' | 'Medium';
  onTimeDeliveryRate: number;
  defectRate: number;
  averageLeadDays: number;
  currentVarianceDays: number;
  activeComponents: string[];
  status: 'Delayed' | 'Operational' | 'Disrupted';
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  productLine: string;
  value: number;
  promisedDate: string;
  predictedDelayDays: number;
  status: 'Stalled: Missing Components' | 'Production Delayed' | 'In Assembly' | 'On Schedule';
  slaPenaltyExposure: number;
}

export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  supplierName: string;
  currentStock: number;
  reorderPoint: number;
  daysOfCover: number;
  status: 'Depleted' | 'Critical Buffer' | 'Healthy';
}

export interface ErpSnapshot {
  systemStatus: {
    connectedErp: string;
    lastSyncTimestamp: string;
    syncStatus: 'HEALTHY' | 'SYNCING' | 'ERROR';
    activeScenario: string;
    bigQueryStatus?: {
      connected: boolean;
      dataset: string;
      project: string;
      tables: { name: string; rows: number }[];
      source: 'bigquery_live' | 'mock_fallback';
      message?: string;
    };
  };
  metrics: {
    overallRiskScore: number;
    riskScoreTrend: { day: string; score: number }[];
    totalRevenueAtRisk: number;
    slaPenaltiesAtRisk: number;
    activeCriticalRisks: number;
    activeHighRisks: number;
    activeMediumRisks: number;
    activeLowRisks: number;
    totalMonitoredOrders: number;
    affectedOrdersCount: number;
    totalSuppliersMonitored: number;
    flaggedSuppliersCount: number;
  };
  risks: RiskItem[];
  customers: CustomerData[];
  suppliers: SupplierData[];
  orders: OrderData[];
  inventory: InventoryItem[];
  auditLog: AuditEntry[];
}

export interface WhatIfSimulationInput {
  supplierDelayDays: number;
  inventoryBufferDays: number;
  customerCancellationRate: number;
  expediteAirFreight: boolean;
  secondarySupplierActivated: boolean;
  scenarioNotes?: string;
}

export interface WhatIfSimulationResult {
  simulatedRiskScore: number;
  riskDelta: number;
  simulatedRevenueExposure: number;
  revenueDelta: number;
  simulatedSlaPenalties: number;
  slaDelta: number;
  impactedOrdersCount: number;
  timelineProjection: {
    dayOffset: number;
    dateLabel: string;
    baseStockLevel: number;
    simulatedStockLevel: number;
    eventMilestone?: string;
  }[];
  aiAssessment: string;
  cascadingForecast: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  sources?: string[];
  suggestedFollowUps?: string[];
}
