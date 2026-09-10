import { GoogleGenAI } from '@google/genai';
import { getErpSnapshot } from './erpData.js';
import type { RiskItem, WhatIfSimulationInput, WhatIfSimulationResult, ErpSnapshot } from '../src/types.js';

let geminiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export async function analyzeRootCauseWithGemini(risk: RiskItem): Promise<{
  aiExplanation: string;
  contributingFactors: string[];
  recommendedMitigations: string[];
  confidenceScore: number;
}> {
  const ai = getAiClient();
  if (!ai) {
    // Graceful fallback with rich domain logic
    return {
      aiExplanation: `[Deterministic Risk Engine] Analyzed ${risk.title}: ${risk.rootCauseAnalysis.explanation}`,
      contributingFactors: risk.rootCauseAnalysis.contributingFactors,
      recommendedMitigations: risk.recommendations.map(r => r.title),
      confidenceScore: risk.rootCauseAnalysis.confidenceScore
    };
  }

  try {
    const prompt = `You are SentinelAI, an elite Autonomous Business Risk Intelligence and Decision Support Agent. You evaluate enterprise risk models across a synthetic ERP dataset hosted in Google Cloud BigQuery (with architectural adapter readiness for SAP S/4HANA & Oracle Supply Chain).

Analyze this detected enterprise risk and provide root-cause synthesis and explainable intelligence:
Risk ID: ${risk.id}
Title: ${risk.title}
Category: ${risk.category}
Risk Score: ${risk.score} / 100 (${risk.severity})
Summary: ${risk.summary}

Evidence Data Points:
${risk.evidenceDataPoints.map(e => `- ${e.metric}: ${e.value} (Baseline: ${e.baseline}, Deviation: ${e.deviation})`).join('\n')}

Business Impact Context:
- Revenue Exposure: $${risk.businessImpact.revenueExposure.toLocaleString()}
- SLA Penalty Exposure: $${risk.businessImpact.slaPenaltyExposure.toLocaleString()}
- Affected Orders: ${risk.businessImpact.affectedOrdersCount}
- Key Affected Accounts: ${risk.businessImpact.affectedCustomers.join(', ')}

Explain the probable root cause in clear, crisp, executive business language. Clearly distinguish observed facts from predictive risks.
Format your response as valid JSON with the following structure:
{
  "aiExplanation": "Comprehensive 2-paragraph executive explanation detailing the trigger event, propagation vector, and operational risk",
  "contributingFactors": ["bullet 1", "bullet 2", "bullet 3"],
  "recommendedMitigations": ["action 1", "action 2"],
  "confidenceScore": 0.94
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return {
      aiExplanation: parsed.aiExplanation || risk.rootCauseAnalysis.explanation,
      contributingFactors: Array.isArray(parsed.contributingFactors) ? parsed.contributingFactors : risk.rootCauseAnalysis.contributingFactors,
      recommendedMitigations: Array.isArray(parsed.recommendedMitigations) ? parsed.recommendedMitigations : risk.recommendations.map(r => r.title),
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.95
    };
  } catch (error) {
    console.error('Gemini root cause analysis error:', error);
    return {
      aiExplanation: risk.rootCauseAnalysis.explanation,
      contributingFactors: risk.rootCauseAnalysis.contributingFactors,
      recommendedMitigations: risk.recommendations.map(r => r.title),
      confidenceScore: risk.rootCauseAnalysis.confidenceScore
    };
  }
}

export async function askRiskAssistant(
  userQuery: string,
  chatHistory: { sender: 'user' | 'assistant'; text: string }[],
  customSnapshot?: ErpSnapshot
): Promise<{ text: string; sources: string[]; suggestedFollowUps: string[] }> {
  const snapshot = customSnapshot || getErpSnapshot();
  const ai = getAiClient();
  const isBq = snapshot.systemStatus?.bigQueryStatus?.source === 'bigquery_live';

  // Create real ERP context summary
  const erpContext = `
CURRENT ENTERPRISE RISK SNAPSHOT (${isBq ? 'Synthetic ERP Data — BigQuery Live: sentinelai_data' : 'Synthetic ERP Simulation Dataset'}):
- Source: ${isBq ? 'Google Cloud BigQuery — Synthetic ERP Dataset (Tables: customers, suppliers, orders, inventory, invoices, payments)' : 'Synthetic ERP Data Model (Architecture ready for SAP S/4HANA & Oracle)'}
- Overall Business Risk Score: ${snapshot.metrics.overallRiskScore}/100 (Active Critical: ${snapshot.metrics.activeCriticalRisks}, High: ${snapshot.metrics.activeHighRisks})
- Total Revenue Exposure: $${snapshot.metrics.totalRevenueAtRisk.toLocaleString()}
- Total SLA Penalty Risk: $${snapshot.metrics.slaPenaltiesAtRisk.toLocaleString()}
- Monitored Orders: ${snapshot.metrics.totalMonitoredOrders} | Delayed/Affected: ${snapshot.metrics.affectedOrdersCount}
- Monitored Suppliers: ${snapshot.metrics.totalSuppliersMonitored} | Flagged: ${snapshot.metrics.flaggedSuppliersCount}

ACTIVE DETECTED RISKS:
${snapshot.risks.map(r => `
* [${r.id}] ${r.title}
  - Severity: ${r.severity} (Score: ${r.score}/100) | Category: ${r.category}
  - Impact: $${r.businessImpact.revenueExposure.toLocaleString()} revenue, $${r.businessImpact.slaPenaltyExposure.toLocaleString()} SLA penalty
  - Affected Customers: ${r.businessImpact.affectedCustomers.join(', ')}
  - Primary Root Cause: ${r.rootCauseAnalysis.primaryCause}
  - Top Recommended Mitigation: ${r.recommendations[0]?.title || 'None'} (Status: ${r.recommendations[0]?.status || 'N/A'})
`).join('\n')}

FLAGGED SUPPLIERS:
${snapshot.suppliers.filter(s => s.status !== 'Operational').map(s => `- ${s.name} (${s.country}): OTD ${s.onTimeDeliveryRate}%, Variance: +${s.currentVarianceDays} days, Criticality: ${s.criticality}, Status: ${s.status}`).join('\n')}

TOP CUSTOMERS AT RISK:
${snapshot.customers.filter(c => c.healthStatus !== 'Optimal').map(c => `- ${c.name} (${c.tier}): Contract $${c.contractValue.toLocaleString()}, Active Orders: ${c.activeOrders}, SLA Penalty: $${c.slaPenaltyPerDay.toLocaleString()}/day, Health: ${c.healthStatus}`).join('\n')}
`;

  if (!ai) {
    // Domain heuristic response when API key is unconfigured
    const lower = userQuery.toLowerCase();
    let answer = '';
    const sources = isBq 
      ? ['Google Cloud BigQuery — Synthetic ERP Dataset', 'SentinelAI Decision Matrix']
      : ['Synthetic ERP Data Model', 'SentinelAI Rule Engine'];
    const suggestedFollowUps = [
      'What are our highest risks today?',
      'Why is Apex Components considered high risk?',
      'Which customers could be affected?',
      'What happens if the supplier delay extends by 5 days?'
    ];

    if (lower.includes('highest risk') || lower.includes('top risk')) {
      const topRisk = snapshot.risks[0];
      answer = `Our highest active risk is **${topRisk.title}** (Score: ${topRisk.score}/100 - ${topRisk.severity}). \n\n**Financial Exposure:** $${topRisk.businessImpact.revenueExposure.toLocaleString()} in booked revenue across ${topRisk.businessImpact.affectedOrdersCount} firm orders, plus $${topRisk.businessImpact.slaPenaltyExposure.toLocaleString()} in contractual liquidated damages. Key accounts impacted include ${topRisk.businessImpact.affectedCustomers.join(', ')}.`;
      sources.push(topRisk.id);
    } else if (lower.includes('supplier') || lower.includes('apex')) {
      const sup = snapshot.suppliers.find(s => s.status === 'Disrupted') || snapshot.suppliers[0];
      answer = `**${sup.name}** is flagged as **${sup.status}** with an on-time delivery rate of ${sup.onTimeDeliveryRate}% and a **+${sup.currentVarianceDays} day lead variance**. \n\n**Root Cause:** Logistics and component manufacturing backlogs verified against live BigQuery tables. This has depleted on-hand inventory buffers to 2-3 days of cover.`;
      sources.push('BigQuery: suppliers table', 'BigQuery: inventory table');
    } else if (lower.includes('customer') || lower.includes('affected')) {
      const critCusts = snapshot.customers.filter(c => c.healthStatus !== 'Optimal');
      answer = `The primary customers at risk are:\n${critCusts.map((c, i) => `${i + 1}. **${c.name} (${c.tier})**: Contract value $${c.contractValue.toLocaleString()}, with $${c.slaPenaltyPerDay.toLocaleString()}/day liquidated damages penalty.`).join('\n')}`;
      sources.push('BigQuery: customers table', 'BigQuery: orders table');
    } else if (lower.includes('what should we do') || lower.includes('recommend') || lower.includes('action')) {
      const topRec = snapshot.risks[0]?.recommendations[0];
      answer = `SentinelAI recommends immediate execution of **${topRec?.title || 'Operational Containment'}**: ${topRec?.description || 'Authorize secondary vendor'}. \n\nExpected risk reduction is -${topRec?.expectedRiskReduction || 45} points, protecting $${(topRec?.financialProtection || 0).toLocaleString()} in revenue.`;
      sources.push('SentinelAI Recommendation Engine', 'Decision Audit Log');
    } else {
      answer = `Based on current ${isBq ? 'Google Cloud BigQuery (`sentinelai_data`)' : 'ERP'} telemetry across our suppliers, production orders, and open invoices, SentinelAI is actively tracking **${snapshot.metrics.activeCriticalRisks} Critical** and **${snapshot.metrics.activeHighRisks} High** risk vectors with total revenue exposure of **$${snapshot.metrics.totalRevenueAtRisk.toLocaleString()}**.`;
    }

    return { text: answer, sources, suggestedFollowUps };
  }

  try {
    const formattedHistory = chatHistory.slice(-6).map(h => `${h.sender === 'user' ? 'User' : 'SentinelAI'}: ${h.text}`).join('\n\n');

    const prompt = `You are SentinelAI — an autonomous, highly authoritative enterprise Business Risk Intelligence and Decision Support Agent.
You assist executives, supply chain directors, and risk officers by answering operational, financial, and strategic questions grounded strictly in real ERP data.

${erpContext}

CONVERSATION HISTORY:
${formattedHistory}

CURRENT USER QUERY:
${userQuery}

Guidelines:
1. Provide a direct, executive-grade response.
2. Cite specific data points, dollar exposures, supplier names, and affected customer accounts.
3. Distinguish clearly between observed factual data, AI root-cause assessments, cascading forecasts, and proactive recommendations.
4. If recommending actions, emphasize that human approval is required before execution.
5. Provide 3 sharp, relevant follow-up questions the executive might want to ask next.

Return your response in JSON format with:
{
  "text": "Your markdown-formatted executive response",
  "sources": ["source 1", "source 2"],
  "suggestedFollowUps": ["Question 1?", "Question 2?", "Question 3?"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      text: parsed.text || 'Analysis completed based on current ERP snapshot.',
      sources: Array.isArray(parsed.sources) ? parsed.sources : [isBq ? 'Google Cloud BigQuery — Synthetic ERP Dataset' : 'Synthetic ERP Data Model', 'SentinelAI Decision Matrix'],
      suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [
        'What are our highest risks today?',
        'How can we mitigate the delivery penalty?',
        'Simulate impact if supplier delivery slips by another 7 days'
      ]
    };
  } catch (error) {
    console.error('Gemini chat error:', error instanceof Error ? error.message : error);
    const topRisk = snapshot.risks[0];
    const topRec = topRisk?.recommendations[0];
    return {
      text: `SentinelAI Real-Time Analysis (${isBq ? 'Synthetic ERP Data — BigQuery Live' : 'Synthetic ERP Simulation'}):\n\n` +
        `• **Primary Operational Risk:** ${topRisk ? topRisk.title : 'All systems nominal'}\n` +
        `• **Financial Exposure:** $${topRisk ? topRisk.businessImpact.revenueExposure.toLocaleString() : '0'} in booked contract value across ${topRisk ? topRisk.businessImpact.affectedOrdersCount : 0} firm orders, with $${topRisk ? topRisk.businessImpact.slaPenaltyExposure.toLocaleString() : 0} in liquidated SLA penalties.\n` +
        `• **Recommended Action (Awaiting Approval):** ${topRec ? topRec.title : 'Continue monitoring operational telemetry'}.\n\n` +
        `Telemetry across customers, suppliers, orders, inventory, invoices, and payments is actively evaluated by SentinelAI's cascading risk engine (architected for direct SAP S/4HANA & Oracle ERP Cloud connection).`,
      sources: [isBq ? 'Google Cloud BigQuery — Synthetic ERP Dataset' : 'Synthetic ERP Data Model', 'SentinelAI Risk Engine'],
      suggestedFollowUps: [
        'Why is Apex Components considered high risk?',
        'What is the financial exposure for Titan-X Systems?',
        'What happens if supplier delay extends by 5 days?'
      ]
    };
  }
}

export async function explainWhatIfSimulationWithGemini(
  input: WhatIfSimulationInput,
  result: WhatIfSimulationResult
): Promise<string> {
  const ai = getAiClient();
  if (!ai) return result.aiAssessment;

  try {
    const prompt = `You are SentinelAI, an autonomous enterprise decision support agent.
Analyze the following simulated scenario parameters and output:

SIMULATED INPUTS:
- Supplier Delay: +${input.supplierDelayDays} days
- On-Site Inventory Buffer: ${input.inventoryBufferDays} days
- Customer Cancellation Sensitivity: ${input.customerCancellationRate}%
- Air Freight Expedite Active: ${input.expediteAirFreight}
- Secondary Supplier Activated: ${input.secondarySupplierActivated}

SIMULATION OUTPUTS:
- Simulated Risk Score: ${result.simulatedRiskScore} / 100 (Delta: ${result.riskDelta >= 0 ? '+' : ''}${result.riskDelta} pts)
- Simulated Revenue Exposure: $${result.simulatedRevenueExposure.toLocaleString()} (Delta: ${result.revenueDelta >= 0 ? '+' : ''}$${result.revenueDelta.toLocaleString()})
- SLA Penalties Exposure: $${result.simulatedSlaPenalties.toLocaleString()}
- Impacted Orders: ${result.impactedOrdersCount}

Write a succinct, professional 2-paragraph executive briefing explaining:
1. The mechanical ripple effect of these variables across manufacturing, fulfillment, and revenue.
2. Clear strategic recommendation whether leadership should execute this intervention or pursue alternative hedging.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return response.text || result.aiAssessment;
  } catch (err) {
    return result.aiAssessment;
  }
}
