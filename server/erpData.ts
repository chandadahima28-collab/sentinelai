import { ErpSnapshot, RiskItem, AuditEntry, WhatIfSimulationInput, WhatIfSimulationResult } from '../src/types.js';

// Initial audit log
let auditLogStore: AuditEntry[] = [
  {
    id: 'AUDIT-1092',
    recommendationId: 'REC-701',
    riskId: 'RISK-8041',
    riskTitle: 'ASIC Processor Delivery Stalled (Apex Microchip)',
    recommendationTitle: 'Contract Secondary Supplier (TSMC Certified Distributor)',
    decision: 'APPROVED',
    decidedBy: 'Marcus Vance (VP Global Supply Chain)',
    timestamp: '2026-09-04T18:42:00Z',
    notes: 'Approved partial allocation of 5,000 units at $18 premium per unit to guarantee NovaTech SLA delivery.',
    expectedImpact: 'Preserves 85% of NovaTech order timeline; mitigates $680,000 revenue cancellation risk.',
    financialProtection: 680000
  },
  {
    id: 'AUDIT-1091',
    recommendationId: 'REC-698',
    riskId: 'RISK-8039',
    riskTitle: 'Warehouse Automated Sorter Maintenance Bottleneck',
    recommendationTitle: 'Authorize 24/7 Overtime for Weekend Dispatch Crews',
    decision: 'APPROVED',
    decidedBy: 'Elena Rostova (Operations Director)',
    timestamp: '2026-09-03T11:15:00Z',
    notes: 'Authorized $14,500 overtime to clear backlog before carrier cutoff on Monday morning.',
    expectedImpact: 'Clears 1,400 delayed units, prevents 24 customer SLA breaches.',
    financialProtection: 145000
  }
];

// In-memory state holding current scenario and custom modified recommendations
let currentScenario: 'semiconductor_crisis' | 'liquidity_cash_crunch' | 'logistics_sorter_failure' | 'nominal_healthy' = 'semiconductor_crisis';

export function getAuditLog(): AuditEntry[] {
  return auditLogStore;
}

export function recordAuditDecision(decision: {
  recommendationId: string;
  riskId: string;
  action: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED';
  decidedBy: string;
  notes: string;
}): AuditEntry {
  const snapshot = getErpSnapshot();
  const risk = snapshot.risks.find(r => r.id === decision.riskId);
  const rec = risk?.recommendations.find(r => r.id === decision.recommendationId);

  if (rec) {
    if (decision.action === 'APPROVED') {
      rec.status = 'APPROVED';
    } else if (decision.action === 'REJECTED') {
      rec.status = 'REJECTED';
    } else {
      rec.status = 'UNDER_REVIEW';
    }
    rec.auditNote = decision.notes;
    rec.decisionTimestamp = new Date().toISOString();
    rec.decidedBy = decision.decidedBy;
  }

  const newEntry: AuditEntry = {
    id: `AUDIT-${Math.floor(1000 + Math.random() * 9000)}`,
    recommendationId: decision.recommendationId,
    riskId: decision.riskId,
    riskTitle: risk?.title || 'Unknown Risk',
    recommendationTitle: rec?.title || 'Mitigation Action',
    decision: decision.action,
    decidedBy: decision.decidedBy || 'Enterprise Risk Officer',
    timestamp: new Date().toISOString(),
    notes: decision.notes || 'Decision recorded in compliance with SentinelAI Human-in-the-Loop policy.',
    expectedImpact: rec ? `Expected Risk Reduction: -${rec.expectedRiskReduction} pts; Est. Protection: $${rec.financialProtection.toLocaleString()}` : 'Standard operational mitigation',
    financialProtection: rec?.financialProtection || 250000
  };

  auditLogStore = [newEntry, ...auditLogStore];
  return newEntry;
}

export function setScenario(scenario: 'semiconductor_crisis' | 'liquidity_cash_crunch' | 'logistics_sorter_failure' | 'nominal_healthy') {
  currentScenario = scenario;
}

export function getErpSnapshot(): ErpSnapshot {
  const isHealthy = currentScenario === 'nominal_healthy';
  const isLiquidity = currentScenario === 'liquidity_cash_crunch';
  const isLogistics = currentScenario === 'logistics_sorter_failure';

  const riskApex: RiskItem = {
    id: 'RISK-8041',
    title: 'Critical ASIC Microchip Delivery Stalled (Apex Components Munich)',
    category: 'SUPPLY_CHAIN',
    score: 88,
    severity: 'Critical',
    detectedAt: '2026-09-04T08:12:00Z',
    status: 'ACTIVE',
    summary: 'Lead time spiked by +14 days due to Hamburg port strike and Munich fab maintenance. Current safety stock in Munich depleted to 3 days of cover, threatening line shutdown for Titan-X Server production.',
    evidenceDataPoints: [
      {
        metric: 'Supplier Lead Time Variance',
        value: '+14 Days Past Expected EDI Confirmation',
        baseline: '0 to 2 Days historical variance',
        deviation: '+700% above threshold',
        status: 'critical'
      },
      {
        metric: 'Titan-X Microchip Inventory',
        value: '420 Units Remaining (3 Days of Cover)',
        baseline: '2,800 Units (21 Days Safety Buffer)',
        deviation: '85% below reorder threshold',
        status: 'critical'
      },
      {
        metric: 'Assembly Line B Operating Velocity',
        value: 'Impending Line Stoppage in 48 Hours',
        baseline: 'Continuous 120 units/shift',
        deviation: 'Assembly halt imminent',
        status: 'critical'
      },
      {
        metric: 'Firm Customer POs Affected',
        value: '38 Orders ($1,420,000 Booked Value)',
        baseline: '0 delayed orders',
        deviation: 'SLA penalty clauses active',
        status: 'warning'
      }
    ],
    rootCauseAnalysis: {
      primaryCause: 'Single-source dependency compounded by European freight transit bottlenecks and unexpected thermal calibration maintenance at Munich Fab 2.',
      contributingFactors: [
        'Global semiconductor wafer supply backlog at Tier 2 packaging facility',
        'Lean inventory policy adopted in Q1 depleted regional buffer stock by 45%',
        'Absence of pre-qualified secondary distributor with active blanket POs'
      ],
      confidenceScore: 0.96,
      explanation: 'SentinelAI cross-referenced EDI purchase order PO-88902 with logistics telematics and freight forwarder tracking. The delay is not a clerical error: customs clearance at Hamburg Port is halted due to strike action, followed by a confirmed 6-day production backlog in Munich.',
      aiEvidenceSummary: 'Correlated 4 independent data sources: Synthetic ERP MM Purchase Order 88902, DHL Global Forwarding status 408 (Port Stoppage), Manufacturing MES Line B queue velocity, and CRM Sales Order SLA penalty contracts.'
    },
    cascadingImpact: {
      cascadeSummary: 'Apex Supplier Delay (14d) → Assembly Line B Stoppage (3d) → 38 Enterprise Orders Delayed → Customer SLA Breach → $1.42M Revenue & $185k Penalty Exposure',
      stages: [
        {
          id: 'node-sup',
          name: 'Supplier Disruption',
          nodeType: 'supplier',
          entity: 'Apex Components (Munich)',
          metric: '+14 Days Delay on ASIC-920',
          status: 'failed',
          description: 'Shipment PO-88902 halted at Hamburg hub. ETA revised from Sept 6 to Sept 20.'
        },
        {
          id: 'node-prod',
          name: 'Manufacturing Stoppage',
          nodeType: 'production',
          entity: 'Assembly Line B (Titan-X)',
          metric: 'Buffer: 3 Days (Halt in 48h)',
          status: 'critical',
          description: 'Factory will exhaust on-hand component bin by Thursday 14:00.'
        },
        {
          id: 'node-ord',
          name: 'Order Fulfillment Delay',
          nodeType: 'order',
          entity: '38 Enterprise Orders',
          metric: 'Est. Delivery Slip: +11 Days',
          status: 'critical',
          description: 'Promised delivery windows will be breached starting next Tuesday.'
        },
        {
          id: 'node-cust',
          name: 'Customer SLA Breach',
          nodeType: 'customer',
          entity: 'NovaTech Global & Vertex Corp',
          metric: 'Breach of Tier 1 Contract',
          status: 'critical',
          description: 'Contractual daily penalty clauses of $50k/day trigger automatically on Day 4 of delay.'
        },
        {
          id: 'node-fin',
          name: 'Revenue & Margin Risk',
          nodeType: 'financial',
          entity: 'Q3 Enterprise Bookings',
          metric: '$1,420,000 Exposure + $185k Fine',
          status: 'critical',
          description: 'High risk of order cancellation and financial clawbacks from anchor accounts.'
        }
      ],
      links: [
        { from: 'node-sup', to: 'node-prod', label: 'Depletes 21-day buffer to 3 days', severity: 'critical' },
        { from: 'node-prod', to: 'node-ord', label: 'Freezes completion of 38 server racks', severity: 'critical' },
        { from: 'node-ord', to: 'node-cust', label: 'Breaches guaranteed delivery SLA', severity: 'critical' },
        { from: 'node-cust', to: 'node-fin', label: 'Triggers contractual penalty clauses & loss', severity: 'critical' }
      ]
    },
    businessImpact: {
      revenueExposure: 1420000,
      slaPenaltyExposure: 185000,
      affectedCustomersCount: 6,
      affectedOrdersCount: 38,
      affectedCustomers: ['NovaTech Global ($680,000)', 'Vertex Aerospace ($410,000)', 'FinTech Alpha ($330,000)'],
      operationalDaysLost: 9,
      slaRiskPct: 94
    },
    recommendations: [
      {
        id: 'REC-8041-A',
        riskId: 'RISK-8041',
        title: 'Activate Pre-Screened Secondary Distributor (Arrow Micro Zurich)',
        actionType: 'SECONDARY_SUPPLIER',
        description: 'Issue urgent spot purchase for 2,400 units of pin-compatible ASIC-920B from Arrow Electronics Zurich with priority courier delivery within 36 hours.',
        rationale: 'Bypasses the Hamburg sea-freight bottleneck completely. Validated by engineering team in Q2 as certified drop-in replacement.',
        expectedRiskReduction: 42,
        financialProtection: 920000,
        estimatedCost: 38500,
        implementationTimeline: '36 Hours to Delivery',
        requiresHumanApproval: true,
        status: 'PENDING_APPROVAL',
        suggestedBy: 'SentinelAI Autonomous Agent'
      },
      {
        id: 'REC-8041-B',
        riskId: 'RISK-8041',
        title: 'Authorize Chartered Air Freight for Remaining Apex Units',
        actionType: 'EXPEDITE_AIR_FREIGHT',
        description: 'Reroute 1,800 cleared units from Munich directly to Frankfurt International via chartered air courier, bypassing Hamburg customs yard.',
        rationale: 'Cuts transit time from 14 days to 48 hours, keeping final order deliveries within the SLA grace period.',
        expectedRiskReduction: 31,
        financialProtection: 640000,
        estimatedCost: 24000,
        implementationTimeline: '48 Hours',
        requiresHumanApproval: true,
        status: 'PENDING_APPROVAL',
        suggestedBy: 'SentinelAI Autonomous Agent'
      },
      {
        id: 'REC-8041-C',
        riskId: 'RISK-8041',
        title: 'Dynamic Production Reallocation to High-Margin Tier 1 Orders',
        actionType: 'DYNAMIC_REALLOCATION',
        description: 'Reprioritize current in-stock 420 chips exclusively to NovaTech Global and Vertex Aerospace orders, deferring internal testing and demo units.',
        rationale: 'Avoids $185,000 contractual liquidated damages by satisfying the strictest SLA clients first.',
        expectedRiskReduction: 25,
        financialProtection: 450000,
        estimatedCost: 0,
        implementationTimeline: 'Immediate (MES update)',
        requiresHumanApproval: true,
        status: 'PENDING_APPROVAL',
        suggestedBy: 'SentinelAI Autonomous Agent'
      }
    ]
  };

  const riskLiquidity: RiskItem = {
    id: 'RISK-8042',
    title: 'Working Capital Squeeze: Overdue Accounts Receivable (NovaTech Net-60)',
    category: 'FINANCIAL_LIQUIDITY',
    score: isLiquidity ? 86 : 74,
    severity: isLiquidity ? 'Critical' : 'High',
    detectedAt: '2026-09-03T14:20:00Z',
    status: 'ACTIVE',
    summary: 'NovaTech invoice INV-9021 ($820,000) is 24 days overdue against Net-60 terms. Coincides with upcoming $1.15M quarterly raw material vendor payments, tightening operational liquidity.',
    evidenceDataPoints: [
      {
        metric: 'Invoice INV-9021 Aging',
        value: '84 Days (24 Days Past Due)',
        baseline: 'Net-60 days standard terms',
        deviation: '+40% delinquency',
        status: 'critical'
      },
      {
        metric: 'Customer Days Sales Outstanding (DSO)',
        value: '72 Days (NovaTech Profile)',
        baseline: '48 Days historical benchmark',
        deviation: 'Significant deterioration',
        status: 'warning'
      },
      {
        metric: 'Working Capital Coverage Ratio',
        value: '1.08x Cash-to-Short-Term Payables',
        baseline: '1.45x Safety Threshold',
        deviation: 'Covenant alert triggered',
        status: 'critical'
      }
    ],
    rootCauseAnalysis: {
      primaryCause: 'Internal ERP migration delays at NovaTech accounts payable department coupled with disputed billable line item #4.',
      contributingFactors: [
        'Automated collections reminder suppressed due to legacy VIP customer flag',
        'Sales account director failed to escalate payment inquiry at 15-day overdue mark'
      ],
      confidenceScore: 0.92,
      explanation: 'Treasury system logs confirm NovaTech accounts payable has not scheduled wire release. Cross-referencing communication logs shows customer requested credit memorandum for shipping damages.',
      aiEvidenceSummary: 'Analyzed Synthetic ERP FI-AR open items, banking cash concentration balance, and Zendesk finance dispute ticket #FIN-4821.'
    },
    cascadingImpact: {
      cascadeSummary: 'Overdue Receivable ($820k) → Cash Buffer Depletion → Vendor AP Delay Risk → Supplier Credit Hold → Inbound Logistics Freeze',
      stages: [
        {
          id: 'node-rec',
          name: 'Overdue Receivables',
          nodeType: 'financial',
          entity: 'NovaTech Global (INV-9021)',
          metric: '$820,000 (24 Days Late)',
          status: 'critical',
          description: 'Single largest receivables concentration for current month.'
        },
        {
          id: 'node-cash',
          name: 'Liquidity Pressure',
          nodeType: 'financial',
          entity: 'Operating Cash Reserve',
          metric: 'Drops to $310k buffer',
          status: 'critical',
          description: 'Buffer drops below internal 30-day liquidity mandate.'
        },
        {
          id: 'node-pay',
          name: 'Vendor Payables Threat',
          nodeType: 'financial',
          entity: 'Semiconductor Suppliers',
          metric: '$1.15M AP due in 10 days',
          status: 'warning',
          description: 'Risk of failing early-payment discount or triggering credit freeze.'
        },
        {
          id: 'node-sup-freeze',
          name: 'Supplier Credit Hold',
          nodeType: 'supplier',
          entity: 'Key Tier-1 Vendors',
          metric: 'Credit Limit at 92% utilization',
          status: 'warning',
          description: 'Vendors may halt future component dispatches if balance remains unpaid.'
        }
      ],
      links: [
        { from: 'node-rec', to: 'node-cash', label: 'Restricts available operating cash flow', severity: 'critical' },
        { from: 'node-cash', to: 'node-pay', label: 'Forces prioritization of critical vendor disbursements', severity: 'warning' },
        { from: 'node-pay', to: 'node-sup-freeze', label: 'Elevates supplier credit hold exposure', severity: 'warning' }
      ]
    },
    businessImpact: {
      revenueExposure: 820000,
      slaPenaltyExposure: 45000,
      affectedCustomersCount: 1,
      affectedOrdersCount: 14,
      affectedCustomers: ['NovaTech Global ($820,000)'],
      operationalDaysLost: 4,
      slaRiskPct: 65
    },
    recommendations: [
      {
        id: 'REC-8042-A',
        riskId: 'RISK-8042',
        title: 'Issue Expedited Credit Memo & Offer 1.5% Immediate Settlement Discount',
        actionType: 'CREDIT_HOLD_INVOICE',
        description: 'Resolve the $8,400 freight damage dispute immediately via automated credit memo, and extend a 1.5% 48-hour wire settlement concession.',
        rationale: 'NovaTech AP rules release invoices within 24h once disputes are cleared. Unlocks $807,700 cash immediately.',
        expectedRiskReduction: 38,
        financialProtection: 807700,
        estimatedCost: 12300,
        implementationTimeline: '6 Hours',
        requiresHumanApproval: true,
        status: 'PENDING_APPROVAL',
        suggestedBy: 'SentinelAI Autonomous Agent'
      },
      {
        id: 'REC-8042-B',
        riskId: 'RISK-8042',
        title: 'Activate Revolving Credit Facility Tranche B ($500k Bridge)',
        actionType: 'RENEGOTIATE_SLA',
        description: 'Draw 14-day bridge liquidity from Silicon Valley Bank credit line at 4.2% APR to satisfy supplier AP without incurring penalties.',
        rationale: 'Guarantees uninterrupted vendor flow while NovaTech wire clears; total interest cost under $1,200.',
        expectedRiskReduction: 28,
        financialProtection: 500000,
        estimatedCost: 1200,
        implementationTimeline: '12 Hours',
        requiresHumanApproval: true,
        status: 'PENDING_APPROVAL',
        suggestedBy: 'SentinelAI Autonomous Agent'
      }
    ]
  };

  const riskLogistics: RiskItem = {
    id: 'RISK-8043',
    title: 'Automated Sorting Hub Line 3 Motor Failure (Chicago Facility)',
    category: 'OPERATIONAL_FAILURE',
    score: isLogistics ? 85 : 62,
    severity: isLogistics ? 'Critical' : 'Medium',
    detectedAt: '2026-09-04T05:30:00Z',
    status: 'ACTIVE',
    summary: 'High-speed parcel sorter telemetry reported high vibrational anomaly leading to drive-motor seizure. Fulfillment throughput slashed by 38% right ahead of Friday FedEx/UPS carrier pickups.',
    evidenceDataPoints: [
      {
        metric: 'Sorter Line 3 Telemetry',
        value: 'Status: Offline (Bearing Seizure)',
        baseline: '99.4% Uptime',
        deviation: '0 units/hour vs 4,500 standard',
        status: 'critical'
      },
      {
        metric: 'Dispatch Backlog Accumulation',
        value: '1,840 Packages Staged in Buffer',
        baseline: '< 250 Staged packages',
        deviation: '+636% warehouse staging load',
        status: 'critical'
      },
      {
        metric: 'Same-Day SLA Compliance',
        value: 'Current Velocity: 61.2%',
        baseline: '98.5% SLA Target',
        deviation: 'Breach threshold imminent',
        status: 'warning'
      }
    ],
    rootCauseAnalysis: {
      primaryCause: 'Mechanical failure of drive motor bearing assembly caused by delayed predictive lubrication maintenance cycle.',
      contributingFactors: [
        'Maintenance shift skipped preventive greasing window during previous week surge',
        'OEM replacement motor had a 72-hour lead time from OEM warehouse'
      ],
      confidenceScore: 0.95,
      explanation: 'IoT sensor vibration analysis (SCADA stream) recorded 8.4 mm/s RMS vibration for 18 hours preceding seizure. Work order was pending in maintenance queue.',
      aiEvidenceSummary: 'Correlated Siemens PLC telemetry logs with CMMS maintenance backlog and WMS outbound queue volume.'
    },
    cascadingImpact: {
      cascadeSummary: 'Sorter Failure → Warehouse Staging Gridlock → Missed Carrier Dispatch Window → 1,840 Customer Deliveries Delayed 48h',
      stages: [
        {
          id: 'node-mech',
          name: 'Sorter Hardware Failure',
          nodeType: 'production',
          entity: 'Chicago Hub Line 3 Sorter',
          metric: 'Offline 14 Hours',
          status: 'failed',
          description: 'Primary high-speed sorting lane inoperable.'
        },
        {
          id: 'node-backlog',
          name: 'Intralogistics Gridlock',
          nodeType: 'order',
          entity: 'Outbound Staging Bay 4',
          metric: '1,840 Units Backlogged',
          status: 'critical',
          description: 'Secondary manual lanes operating at 100% capacity limit.'
        },
        {
          id: 'node-carrier',
          name: 'Carrier Cutoff Miss',
          nodeType: 'order',
          entity: 'FedEx / UPS Freight Cutoffs',
          metric: '17:00 Cutoff at Risk',
          status: 'critical',
          description: 'Parcels not loaded by 17:00 will sit over the weekend.'
        },
        {
          id: 'node-cust-delay',
          name: 'Customer Delivery Delays',
          nodeType: 'customer',
          entity: 'Midwest Regional Clients',
          metric: '+48 Hours Delivery Slip',
          status: 'warning',
          description: 'Weekend layover delays delivery to Monday afternoon.'
        }
      ],
      links: [
        { from: 'node-mech', to: 'node-backlog', label: 'Diverts volume to manual sort lanes', severity: 'critical' },
        { from: 'node-backlog', to: 'node-carrier', label: 'Processing speed too slow to meet cutoff', severity: 'critical' },
        { from: 'node-carrier', to: 'node-cust-delay', label: 'Pushes deliveries across weekend', severity: 'warning' }
      ]
    },
    businessImpact: {
      revenueExposure: 340000,
      slaPenaltyExposure: 32000,
      affectedCustomersCount: 18,
      affectedOrdersCount: 1840,
      affectedCustomers: ['Midwest Health Systems ($120k)', 'Apex Logistics ($95k)', 'Retail Direct ($125k)'],
      operationalDaysLost: 2,
      slaRiskPct: 78
    },
    recommendations: [
      {
        id: 'REC-8043-A',
        riskId: 'RISK-8043',
        title: 'Dispatch Emergency Mobile Millwright & Local Motor Courier',
        actionType: 'FACILITY_OVERTIME',
        description: 'Contract local industrial repair team (Motion Industries) with same-day certified replacement motor for installation by 13:00.',
        rationale: 'Restores Line 3 functionality 4 hours before carrier cutoff, clearing 85% of staged shipments.',
        expectedRiskReduction: 45,
        financialProtection: 280000,
        estimatedCost: 6800,
        implementationTimeline: '4 Hours',
        requiresHumanApproval: true,
        status: 'PENDING_APPROVAL',
        suggestedBy: 'SentinelAI Autonomous Agent'
      },
      {
        id: 'REC-8043-B',
        riskId: 'RISK-8043',
        title: 'Reroute High-Priority Batches to Indianapolis Sister Facility',
        actionType: 'DYNAMIC_REALLOCATION',
        description: 'Cross-dock 600 critical Tier 1 customer orders to Indianapolis distribution hub via hot-shot courier vans.',
        rationale: 'Indianapolis has 40% spare sorter capacity; guarantees next-morning delivery for priority accounts.',
        expectedRiskReduction: 30,
        financialProtection: 190000,
        estimatedCost: 4500,
        implementationTimeline: '3 Hours',
        requiresHumanApproval: true,
        status: 'PENDING_APPROVAL',
        suggestedBy: 'SentinelAI Autonomous Agent'
      }
    ]
  };

  const riskSlaCustomer: RiskItem = {
    id: 'RISK-8044',
    title: 'Precision Optics Batch Defect Rate Exceeds Customer QA Specification',
    category: 'CUSTOMER_SLA',
    score: isHealthy ? 22 : 58,
    severity: isHealthy ? 'Low' : 'Medium',
    detectedAt: '2026-09-02T19:00:00Z',
    status: 'ACTIVE',
    summary: 'Supplier Kyoto Precision Optics delivered Lot #KP-4091 with 3.8% surface micro-abrasions, breaching Vertex Aerospace 0.5% maximum allowable defect specification.',
    evidenceDataPoints: [
      {
        metric: 'Incoming QA Defect Rate',
        value: '3.8% Optical Aberrations',
        baseline: '< 0.5% Maximum AQL',
        deviation: 'Failed incoming inspection',
        status: 'critical'
      },
      {
        metric: 'Affected Inventory Lot',
        value: '1,200 Optical Assemblies Quarantined',
        baseline: '0 Quarantined units',
        deviation: 'Quarantine lock engaged',
        status: 'warning'
      }
    ],
    rootCauseAnalysis: {
      primaryCause: 'Packaging foam friction during international air cargo transit caused micro-scratching on uncoated lenses.',
      contributingFactors: ['Kyoto Optics switched packaging vendor in August without secondary vibration testing'],
      confidenceScore: 0.89,
      explanation: 'Spectral imaging confirms scratches are superficial and external, consistent with shipping transit friction rather than polishing defects.',
      aiEvidenceSummary: 'Correlated Keyence optical scanner inspection reports with shipment manifest packaging specs.'
    },
    cascadingImpact: {
      cascadeSummary: 'Defective Lot Quarantined → Vertex Subassembly Paused → Delivery Pushed 5 Days',
      stages: [
        {
          id: 'node-qa',
          name: 'QA Inspection Failure',
          nodeType: 'production',
          entity: 'Lot KP-4091',
          metric: '3.8% Defect vs 0.5% Limit',
          status: 'failed',
          description: 'Immediate quarantine lock triggered in ERP QM module.'
        },
        {
          id: 'node-sub',
          name: 'Subassembly Stalled',
          nodeType: 'order',
          entity: 'Vertex Aerospace Guidance Modules',
          metric: '12 Units Paused',
          status: 'warning',
          description: 'Technicians cannot advance assembly without approved optics.'
        },
        {
          id: 'node-cust-opt',
          name: 'Customer Delivery Delay',
          nodeType: 'customer',
          entity: 'Vertex Aerospace',
          metric: 'Risk of 5-Day Delivery Slip',
          status: 'warning',
          description: 'Client notified of inspection quarantine.'
        }
      ],
      links: [
        { from: 'node-qa', to: 'node-sub', label: 'Quarantines raw material feed', severity: 'warning' },
        { from: 'node-sub', to: 'node-cust-opt', label: 'Slows subassembly completion', severity: 'warning' }
      ]
    },
    businessImpact: {
      revenueExposure: 260000,
      slaPenaltyExposure: 25000,
      affectedCustomersCount: 1,
      affectedOrdersCount: 6,
      affectedCustomers: ['Vertex Aerospace ($260,000)'],
      operationalDaysLost: 3,
      slaRiskPct: 48
    },
    recommendations: [
      {
        id: 'REC-8044-A',
        riskId: 'RISK-8044',
        title: 'Conduct Automated On-Site Ultrasonic Buffing & Recertification',
        actionType: 'DYNAMIC_REALLOCATION',
        description: 'Deploy in-house precision buffing cell to polish 85% of superficial scratches, restoring optics to within 0.1% tolerance.',
        rationale: 'Reclaims 1,020 units within 18 hours without waiting for replacement shipment from Japan.',
        expectedRiskReduction: 24,
        financialProtection: 210000,
        estimatedCost: 3200,
        implementationTimeline: '18 Hours',
        requiresHumanApproval: true,
        status: 'PENDING_APPROVAL',
        suggestedBy: 'SentinelAI Autonomous Agent'
      }
    ]
  };

  const allRisks = isHealthy
    ? [
        { ...riskApex, score: 24, severity: 'Low' as const, status: 'RESOLVED' as const },
        { ...riskLiquidity, score: 18, severity: 'Low' as const, status: 'RESOLVED' as const },
        { ...riskLogistics, score: 15, severity: 'Low' as const, status: 'RESOLVED' as const },
        { ...riskSlaCustomer, score: 12, severity: 'Low' as const, status: 'RESOLVED' as const }
      ]
    : [riskApex, riskLiquidity, riskLogistics, riskSlaCustomer];

  const overallScore = isHealthy ? 19 : isLiquidity ? 78 : isLogistics ? 76 : 84;
  const criticalCount = allRisks.filter(r => r.severity === 'Critical').length;
  const highCount = allRisks.filter(r => r.severity === 'High').length;
  const mediumCount = allRisks.filter(r => r.severity === 'Medium').length;
  const lowCount = allRisks.filter(r => r.severity === 'Low').length;

  const totalRevenueAtRisk = allRisks.reduce((acc, r) => acc + (r.status === 'ACTIVE' ? r.businessImpact.revenueExposure : 0), 0);
  const slaPenaltiesAtRisk = allRisks.reduce((acc, r) => acc + (r.status === 'ACTIVE' ? r.businessImpact.slaPenaltyExposure : 0), 0);

  return {
    systemStatus: {
      connectedErp: 'Synthetic ERP Data — BigQuery Live',
      lastSyncTimestamp: new Date().toISOString(),
      syncStatus: 'HEALTHY',
      activeScenario: currentScenario
    },
    metrics: {
      overallRiskScore: overallScore,
      riskScoreTrend: [
        { day: 'Mon', score: isHealthy ? 22 : 44 },
        { day: 'Tue', score: isHealthy ? 21 : 52 },
        { day: 'Wed', score: isHealthy ? 20 : 68 },
        { day: 'Thu', score: isHealthy ? 19 : 79 },
        { day: 'Fri', score: overallScore }
      ],
      totalRevenueAtRisk,
      slaPenaltiesAtRisk,
      activeCriticalRisks: criticalCount,
      activeHighRisks: highCount,
      activeMediumRisks: mediumCount,
      activeLowRisks: lowCount,
      totalMonitoredOrders: 1420,
      affectedOrdersCount: allRisks.reduce((acc, r) => acc + (r.status === 'ACTIVE' ? r.businessImpact.affectedOrdersCount : 0), 0),
      totalSuppliersMonitored: 86,
      flaggedSuppliersCount: isHealthy ? 1 : 4
    },
    risks: allRisks,
    customers: [
      {
        id: 'CUST-001',
        name: 'NovaTech Global Systems',
        tier: 'Tier 1 Global',
        contractValue: 4800000,
        activeOrders: 18,
        slaCommitmentPct: 99.8,
        slaPenaltyPerDay: 50000,
        healthStatus: isHealthy ? 'Optimal' : 'Critical Risk'
      },
      {
        id: 'CUST-002',
        name: 'Vertex Aerospace Defense',
        tier: 'Tier 1 Global',
        contractValue: 3400000,
        activeOrders: 12,
        slaCommitmentPct: 99.5,
        slaPenaltyPerDay: 40000,
        healthStatus: isHealthy ? 'Optimal' : 'Critical Risk'
      },
      {
        id: 'CUST-003',
        name: 'FinTech Alpha Cloud Solutions',
        tier: 'Tier 2 Strategic',
        contractValue: 1950000,
        activeOrders: 8,
        slaCommitmentPct: 98.0,
        slaPenaltyPerDay: 15000,
        healthStatus: isHealthy ? 'Optimal' : 'Monitored'
      },
      {
        id: 'CUST-004',
        name: 'Midwest Health Networks',
        tier: 'Tier 2 Strategic',
        contractValue: 1450000,
        activeOrders: 14,
        slaCommitmentPct: 99.0,
        slaPenaltyPerDay: 20000,
        healthStatus: isLogistics ? 'Critical Risk' : 'Monitored'
      },
      {
        id: 'CUST-005',
        name: 'OmniRetail Direct Corp',
        tier: 'Tier 3 Regional',
        contractValue: 880000,
        activeOrders: 22,
        slaCommitmentPct: 95.0,
        slaPenaltyPerDay: 5000,
        healthStatus: 'Optimal'
      }
    ],
    suppliers: [
      {
        id: 'SUP-01',
        name: 'Apex Components GmbH',
        category: 'Semiconductors & ASICs',
        country: 'Germany (Munich)',
        criticality: 'Critical',
        onTimeDeliveryRate: isHealthy ? 96.4 : 64.2,
        defectRate: 0.28,
        averageLeadDays: 28,
        currentVarianceDays: isHealthy ? 1 : 14,
        activeComponents: ['ASIC-920 Microprocessor', 'Titan Power Controller'],
        status: isHealthy ? 'Operational' : 'Disrupted'
      },
      {
        id: 'SUP-02',
        name: 'Kyoto Precision Optics Ltd',
        category: 'Optical Sensor Assemblies',
        country: 'Japan (Kyoto)',
        criticality: 'High',
        onTimeDeliveryRate: 88.5,
        defectRate: 3.8,
        averageLeadDays: 21,
        currentVarianceDays: 3,
        activeComponents: ['Optic Prism L-4', 'Infrared Receiver Cell'],
        status: 'Delayed'
      },
      {
        id: 'SUP-03',
        name: 'Arrow Electronics Europe',
        category: 'Certified Secondary Distributor',
        country: 'Switzerland (Zurich)',
        criticality: 'Medium',
        onTimeDeliveryRate: 98.1,
        defectRate: 0.12,
        averageLeadDays: 4,
        currentVarianceDays: 0,
        activeComponents: ['ASIC-920B Alternate', 'Power IC-12'],
        status: 'Operational'
      },
      {
        id: 'SUP-04',
        name: 'Siemens Industrial Logistics',
        category: 'Automation & SCADA Robotics',
        country: 'United States (IL)',
        criticality: 'High',
        onTimeDeliveryRate: 94.0,
        defectRate: 0.05,
        averageLeadDays: 14,
        currentVarianceDays: 2,
        activeComponents: ['Sorter Drive Motors', 'Belt Conveyors'],
        status: isLogistics ? 'Disrupted' : 'Operational'
      }
    ],
    orders: [
      {
        id: 'ORD-9912',
        orderNumber: 'SO-9912-NT',
        customerName: 'NovaTech Global Systems',
        productLine: 'Titan-X Enterprise Server Clusters (x12)',
        value: 680000,
        promisedDate: '2026-09-09',
        predictedDelayDays: isHealthy ? 0 : 8,
        status: isHealthy ? 'On Schedule' : 'Stalled: Missing Components',
        slaPenaltyExposure: isHealthy ? 0 : 90000
      },
      {
        id: 'ORD-9915',
        orderNumber: 'SO-9915-VA',
        customerName: 'Vertex Aerospace Defense',
        productLine: 'AeroGuidance Precision Racks (x6)',
        value: 410000,
        promisedDate: '2026-09-12',
        predictedDelayDays: isHealthy ? 0 : 7,
        status: isHealthy ? 'On Schedule' : 'Production Delayed',
        slaPenaltyExposure: isHealthy ? 0 : 60000
      },
      {
        id: 'ORD-9920',
        orderNumber: 'SO-9920-FA',
        customerName: 'FinTech Alpha Cloud Solutions',
        productLine: 'High-Throughput Edge Nodes (x20)',
        value: 330000,
        promisedDate: '2026-09-14',
        predictedDelayDays: isHealthy ? 0 : 6,
        status: isHealthy ? 'On Schedule' : 'Stalled: Missing Components',
        slaPenaltyExposure: isHealthy ? 0 : 35000
      },
      {
        id: 'ORD-9924',
        orderNumber: 'SO-9924-MH',
        customerName: 'Midwest Health Networks',
        productLine: 'Telemetry Telehealth Routers (x500)',
        value: 120000,
        promisedDate: '2026-09-08',
        predictedDelayDays: isLogistics ? 3 : 0,
        status: isLogistics ? 'Production Delayed' : 'On Schedule',
        slaPenaltyExposure: isLogistics ? 20000 : 0
      }
    ],
    inventory: [
      {
        sku: 'IC-ASIC-920',
        name: 'Titan-X ASIC Microprocessor',
        category: 'Semiconductors',
        supplierName: 'Apex Components GmbH',
        currentStock: isHealthy ? 2600 : 420,
        reorderPoint: 1500,
        daysOfCover: isHealthy ? 21 : 3,
        status: isHealthy ? 'Healthy' : 'Critical Buffer'
      },
      {
        sku: 'OPT-PRISM-L4',
        name: 'Optic Prism Sensor Matrix',
        category: 'Optics',
        supplierName: 'Kyoto Precision Optics Ltd',
        currentStock: 1200,
        reorderPoint: 800,
        daysOfCover: 8,
        status: 'Critical Buffer'
      },
      {
        sku: 'PWR-CTRL-800',
        name: 'Redundant Power Distribution Unit',
        category: 'Power Systems',
        supplierName: 'Arrow Electronics Europe',
        currentStock: 3400,
        reorderPoint: 1200,
        daysOfCover: 28,
        status: 'Healthy'
      },
      {
        sku: 'SRT-MTR-450',
        name: 'High-Speed Hub Sorter Drive Motor',
        category: 'Facility Spares',
        supplierName: 'Siemens Industrial Logistics',
        currentStock: isLogistics ? 0 : 2,
        reorderPoint: 2,
        daysOfCover: isLogistics ? 0 : 60,
        status: isLogistics ? 'Depleted' : 'Healthy'
      }
    ],
    auditLog: auditLogStore
  };
}

// What-If Simulation Algorithm
export function runWhatIfSimulation(input: WhatIfSimulationInput): WhatIfSimulationResult {
  const baseDelay = input.supplierDelayDays; // e.g. 14
  const buffer = input.inventoryBufferDays;   // e.g. 3
  const cancelRate = input.customerCancellationRate / 100; // e.g. 0.15
  const expediteAir = input.expediteAirFreight;
  const secondarySup = input.secondarySupplierActivated;

  // Calculate effective delay
  let effectiveDelay = Math.max(0, baseDelay - buffer);
  if (expediteAir) effectiveDelay = Math.max(0, effectiveDelay - 8);
  if (secondarySup) effectiveDelay = Math.max(0, effectiveDelay - 6);

  // Calculate simulated risk score
  let score = 25 + (effectiveDelay * 4.5);
  if (score > 100) score = 100;
  if (score < 15) score = 15;

  // Calculate revenue exposure
  const baseRev = 1420000;
  let simulatedRev = (baseRev * (effectiveDelay / 14)) * (0.8 + cancelRate);
  if (simulatedRev > baseRev * 1.5) simulatedRev = baseRev * 1.5;
  if (simulatedRev < 0) simulatedRev = 0;

  // Calculate SLA penalties
  let simulatedSla = effectiveDelay > 3 ? (effectiveDelay - 3) * 28000 : 0;
  if (simulatedSla > 350000) simulatedSla = 350000;

  const baseScore = 84;
  const riskDelta = Math.round(score - baseScore);
  const revenueDelta = Math.round(simulatedRev - baseRev);
  const slaDelta = Math.round(simulatedSla - 185000);

  // Projected stock timeline
  const today = new Date();
  const timelineProjection = [];
  let currentStock = 420;
  const dailyBurn = 140;

  for (let d = 0; d <= 14; d++) {
    const projectedDate = new Date(today);
    projectedDate.setDate(today.getDate() + d);
    const dateLabel = projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // In base case, incoming stock arrives at day 14
    let baseStock = Math.max(0, 420 - (dailyBurn * d));
    if (d >= baseDelay) baseStock += 2400;

    // In simulated case
    let simStock = Math.max(0, (buffer * dailyBurn) - (dailyBurn * d));
    const arrivalDay = Math.max(1, effectiveDelay);
    if (d >= arrivalDay) {
      simStock += secondarySup ? 2000 : expediteAir ? 2400 : 2400;
    }

    let eventMilestone: string | undefined = undefined;
    if (d === 3 && simStock === 0 && !secondarySup && !expediteAir) {
      eventMilestone = 'Stockout: Line B Halted';
    } else if (d === arrivalDay && (secondarySup || expediteAir)) {
      eventMilestone = 'Expedited Stock Replenished';
    }

    timelineProjection.push({
      dayOffset: d,
      dateLabel,
      baseStockLevel: baseStock,
      simulatedStockLevel: simStock,
      eventMilestone
    });
  }

  const impactedOrders = Math.min(38, Math.max(0, Math.round(effectiveDelay * 2.8)));

  const cascadingForecast = [
    `Supplier Delivery Gap: Expected variance of ${baseDelay} days reduced to ${effectiveDelay} net days of operational latency.`,
    `Assembly Continuity: ${effectiveDelay <= 3 ? 'Line B remains continuous with zero planned downtime.' : `Assembly Line B faces ${effectiveDelay - 3} days of partial starvation.`}`,
    `Customer Contract Vulnerability: ${effectiveDelay > 5 ? `${impactedOrders} orders breach contractual guaranteed window, triggering SLA penalty clauses.` : 'All priority enterprise orders delivered within contracted grace windows.'}`,
    `Executive Financial Risk: Projected exposure stands at $${Math.round(simulatedRev).toLocaleString()} (delta: ${revenueDelta >= 0 ? `+$${revenueDelta.toLocaleString()}` : `-$${Math.abs(revenueDelta).toLocaleString()}`}).`
  ];

  let aiAssessment = `Under this scenario, adjusting supplier delay to +${baseDelay} days and buffer to ${buffer} days with ${expediteAir ? 'Air Freight active' : 'Standard Freight'} and ${secondarySup ? 'Secondary Supplier enabled' : 'Single Sourcing'}: `;
  if (score < 40) {
    aiAssessment += `The combination of proactive mitigations neutralizes cascading line starvation. Safety stocks hold above operational minimums, preserving $${Math.abs(revenueDelta).toLocaleString()} in enterprise margin.`;
  } else if (score < 70) {
    aiAssessment += `Moderate operational friction persists. While catastrophic line shutdown is averted, staggered delays will affect ${impactedOrders} secondary tier orders with an estimated $${simulatedSla.toLocaleString()} in SLA claims.`;
  } else {
    aiAssessment += `Critical operational breach forecasted. Net delay exceeds buffer by ${effectiveDelay - buffer} days. Line B will suffer complete starvation starting Day 3, triggering irreversible customer SLA default clauses.`;
  }

  return {
    simulatedRiskScore: Math.round(score),
    riskDelta,
    simulatedRevenueExposure: Math.round(simulatedRev),
    revenueDelta,
    simulatedSlaPenalties: Math.round(simulatedSla),
    slaDelta,
    impactedOrdersCount: impactedOrders,
    timelineProjection,
    aiAssessment,
    cascadingForecast
  };
}
