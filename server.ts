import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getErpSnapshot, recordAuditDecision, setScenario, runWhatIfSimulation, getAuditLog } from './server/erpData.js';
import { analyzeRootCauseWithGemini, askRiskAssistant, explainWhatIfSimulationWithGemini } from './server/geminiService.js';
import { 
  getBigQuerySnapshot, 
  getBigQueryStatus, 
  diagnoseBigQueryConnection, 
  getLatestLiveSnapshot,
  recordBigQueryRecommendationDecision,
  BIGQUERY_PROJECT_ID, 
  BIGQUERY_DATASET 
} from './server/bigqueryService.js';
import { ErpSnapshot } from './src/types.js';

dotenv.config();

// Active scenario tracker ('bigquery_live' by default, or one of the synthetic scenarios)
let activeScenario: 'bigquery_live' | 'semiconductor_crisis' | 'liquidity_cash_crunch' | 'logistics_sorter_failure' | 'nominal_healthy' = 'bigquery_live';

/**
 * Returns the current active snapshot.
 * Prioritizes live BigQuery data whenever available.
 * Falls back safely to synthetic ERP data if BigQuery is unreachable or if a synthetic scenario is active.
 */
async function getActiveSnapshot(): Promise<ErpSnapshot> {
  if (activeScenario === 'bigquery_live') {
    try {
      const bqSnapshot = await getBigQuerySnapshot();
      if (bqSnapshot.systemStatus.bigQueryStatus?.source === 'bigquery_live' || bqSnapshot.systemStatus.bigQueryStatus?.connected) {
        return bqSnapshot;
      }
    } catch (err) {
      console.warn('[Server] BigQuery fetch failed, using fallback snapshot:', err);
    }
  }
  return getErpSnapshot();
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SentinelAI Risk Engine & Decision Support',
      version: '1.0.0',
      activeScenario,
      timestamp: new Date().toISOString()
    });
  });

  // Google Cloud BigQuery Snapshot Endpoint
  // Retrieves live enterprise data from BigQuery dataset sentinelai_data across all 6 tables
  app.get('/api/bigquery/snapshot', async (req, res) => {
    try {
      console.log(`[Server] GET /api/bigquery/snapshot requested. Target: ${BIGQUERY_PROJECT_ID}.${BIGQUERY_DATASET}`);
      const snapshot = await getBigQuerySnapshot();
      res.json(snapshot);
    } catch (error: any) {
      console.error('[Server] BigQuery snapshot endpoint error:', error);
      const fallback = getErpSnapshot();
      res.json(fallback);
    }
  });

  // BigQuery Diagnostic & Status Endpoint
  app.get('/api/bigquery/status', async (req, res) => {
    try {
      const status = await diagnoseBigQueryConnection();
      res.json({
        ...status,
        serviceAccountMethod: 'Application Default Credentials (ADC)',
        deploymentTarget: 'Google Cloud Run Service Identity',
        configuredProject: BIGQUERY_PROJECT_ID,
        configuredDataset: BIGQUERY_DATASET
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve BigQuery status', message: error?.message });
    }
  });

  // Main ERP Data Snapshot endpoint (serves live BigQuery by default)
  app.get('/api/erp/snapshot', async (req, res) => {
    try {
      const source = req.query.source;
      if (source === 'mock') {
        res.json(getErpSnapshot());
        return;
      }

      const snapshot = await getActiveSnapshot();
      res.json(snapshot);
    } catch (error) {
      console.error('Error fetching ERP snapshot:', error);
      res.status(500).json({ error: 'Failed to retrieve ERP snapshot' });
    }
  });

  // ERP Sync Trigger - Refreshes live data from BigQuery or ERP connector
  app.post('/api/erp/sync', async (req, res) => {
    try {
      if (activeScenario === 'bigquery_live') {
        const freshSnapshot = await getBigQuerySnapshot();
        res.json({
          success: true,
          message: `Synchronized 6 tables (customers, suppliers, orders, inventory, invoices, payments) with BigQuery dataset ${BIGQUERY_DATASET}.`,
          syncTimestamp: new Date().toISOString(),
          snapshot: freshSnapshot
        });
      } else {
        const snapshot = getErpSnapshot();
        res.json({
          success: true,
          message: 'Synchronized orders, suppliers, and inventory with synthetic connector.',
          syncTimestamp: new Date().toISOString(),
          snapshot
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to synchronize with ERP' });
    }
  });

  // Switch Scenario or return to BigQuery Live
  app.post('/api/erp/scenario', async (req, res) => {
    try {
      const { scenario } = req.body;
      if (scenario === 'bigquery_live') {
        activeScenario = 'bigquery_live';
        const snapshot = await getBigQuerySnapshot();
        res.json({ success: true, activeScenario: 'bigquery_live', snapshot });
      } else if (['semiconductor_crisis', 'liquidity_cash_crunch', 'logistics_sorter_failure', 'nominal_healthy'].includes(scenario)) {
        activeScenario = scenario;
        setScenario(scenario);
        const snapshot = getErpSnapshot();
        res.json({ success: true, activeScenario: scenario, snapshot });
      } else {
        res.status(400).json({ error: 'Invalid scenario identifier' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to switch scenario' });
    }
  });

  // Recommendation Decision (Approve, Reject, Review) - Human in the Loop
  app.post('/api/recommendations/action', async (req, res) => {
    try {
      const { recommendationId, riskId, action, decidedBy, notes } = req.body;
      if (!recommendationId || !riskId || !action) {
        res.status(400).json({ error: 'Missing required decision fields' });
        return;
      }

      // Check if this recommendation belongs to a BigQuery risk
      const bqAuditEntry = recordBigQueryRecommendationDecision({
        recommendationId,
        riskId,
        action,
        decidedBy: decidedBy || 'Enterprise Risk Officer',
        notes: notes || ''
      });

      if (bqAuditEntry) {
        // Also sync into synthetic audit store for consistency
        recordAuditDecision({
          recommendationId,
          riskId,
          action,
          decidedBy,
          notes
        });

        const liveSnap = getLatestLiveSnapshot();
        res.json({
          success: true,
          auditEntry: bqAuditEntry,
          snapshot: liveSnap || await getActiveSnapshot()
        });
        return;
      }

      // Otherwise record in standard ERP audit store
      const auditEntry = recordAuditDecision({
        recommendationId,
        riskId,
        action,
        decidedBy: decidedBy || 'Enterprise Risk Officer',
        notes: notes || ''
      });

      const updatedSnapshot = await getActiveSnapshot();
      res.json({
        success: true,
        auditEntry,
        snapshot: updatedSnapshot
      });
    } catch (error) {
      console.error('Error recording recommendation decision:', error);
      res.status(500).json({ error: 'Failed to record decision' });
    }
  });

  // Audit Log endpoint
  app.get('/api/audit-log', async (req, res) => {
    const liveSnap = getLatestLiveSnapshot();
    if (liveSnap && liveSnap.auditLog && liveSnap.auditLog.length > 0) {
      res.json(liveSnap.auditLog);
      return;
    }
    res.json(getAuditLog());
  });

  // AI Root-Cause Analysis via Gemini (grounded in active snapshot)
  app.post('/api/ai/analyze-risk', async (req, res) => {
    try {
      const { riskId } = req.body;
      const snapshot = await getActiveSnapshot();
      let risk = snapshot.risks.find(r => r.id === riskId);

      if (!risk) {
        // Check synthetic fallback if not in active
        const fallback = getErpSnapshot();
        risk = fallback.risks.find(r => r.id === riskId);
      }

      if (!risk) {
        res.status(404).json({ error: 'Risk not found' });
        return;
      }

      const analysis = await analyzeRootCauseWithGemini(risk);
      res.json({
        riskId,
        analysis
      });
    } catch (error) {
      console.error('Error in analyze-risk:', error);
      res.status(500).json({ error: 'AI root cause analysis failed' });
    }
  });

  // What-If Simulation endpoint
  app.post('/api/ai/simulate', async (req, res) => {
    try {
      const {
        supplierDelayDays = 14,
        inventoryBufferDays = 3,
        customerCancellationRate = 15,
        expediteAirFreight = false,
        secondarySupplierActivated = false,
        scenarioNotes = ''
      } = req.body;

      const input = {
        supplierDelayDays: Number(supplierDelayDays),
        inventoryBufferDays: Number(inventoryBufferDays),
        customerCancellationRate: Number(customerCancellationRate),
        expediteAirFreight: Boolean(expediteAirFreight),
        secondarySupplierActivated: Boolean(secondarySupplierActivated),
        scenarioNotes
      };

      const result = runWhatIfSimulation(input);
      const enhancedAiSummary = await explainWhatIfSimulationWithGemini(input, result);
      result.aiAssessment = enhancedAiSummary;

      res.json(result);
    } catch (error) {
      console.error('Simulation error:', error);
      res.status(500).json({ error: 'Simulation processing failed' });
    }
  });

  // Conversational Risk Assistant powered by Gemini
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const message = req.body.message || req.body.query;
      const history = req.body.history || [];
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Valid user message or query is required' });
        return;
      }

      const activeSnap = await getActiveSnapshot();
      const response = await askRiskAssistant(message, history, activeSnap);
      res.json(response);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'AI Assistant failed to respond' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SentinelAI Enterprise Risk Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
