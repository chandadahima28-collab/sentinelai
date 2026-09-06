import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  RotateCcw, 
  Play, 
  DollarSign, 
  ShieldAlert, 
  Clock, 
  Package, 
  Plane, 
  Truck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { WhatIfSimulationInput, WhatIfSimulationResult } from '../types';
import { formatCurrency, getScoreColor } from '../utils/formatters';
import { ExplainableAiBadge } from './ExplainableAiBadge';

interface Props {
  onRunSimulation: (input: WhatIfSimulationInput) => Promise<WhatIfSimulationResult>;
}

export const WhatIfSimulator: React.FC<Props> = ({ onRunSimulation }) => {
  const [supplierDelayDays, setSupplierDelayDays] = useState(14);
  const [inventoryBufferDays, setInventoryBufferDays] = useState(3);
  const [customerCancellationRate, setCustomerCancellationRate] = useState(15);
  const [expediteAirFreight, setExpediteAirFreight] = useState(false);
  const [secondarySupplierActivated, setSecondarySupplierActivated] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Result state
  const [result, setResult] = useState<WhatIfSimulationResult | null>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await onRunSimulation({
        supplierDelayDays,
        inventoryBufferDays,
        customerCancellationRate,
        expediteAirFreight,
        secondarySupplierActivated
      });
      setResult(res);
    } catch (err) {
      console.error('Simulation run failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Initial simulation run if empty
  React.useEffect(() => {
    if (!result) {
      handleSimulate();
    }
  }, []);

  const handlePreset = (
    delay: number,
    buffer: number,
    air: boolean,
    secondary: boolean,
    cancel: number
  ) => {
    setSupplierDelayDays(delay);
    setInventoryBufferDays(buffer);
    setExpediteAirFreight(air);
    setSecondarySupplierActivated(secondary);
    setCustomerCancellationRate(cancel);
  };

  const scoreColors = result ? getScoreColor(result.simulatedRiskScore) : { text: '', bg: '', border: '' };

  return (
    <div id="what-if-simulator-container" className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                What-If Autonomous Risk Simulation Engine
              </h2>
              <p className="text-xs text-slate-400">
                Test counterfactual scenarios: Adjust lead times, buffer thresholds, and mitigation toggles to forecast outcomes
              </p>
            </div>
          </div>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] mr-1">Presets:</span>
          <button
            onClick={() => handlePreset(21, 1, false, false, 40)}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Worst Case (+21d)
          </button>
          <button
            onClick={() => handlePreset(14, 3, true, false, 15)}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Air Freight Only
          </button>
          <button
            onClick={() => handlePreset(14, 3, true, true, 5)}
            className="px-2.5 py-1 rounded-md bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 transition-colors cursor-pointer"
          >
            Max Hedging
          </button>
          <button
            onClick={() => handlePreset(14, 3, false, false, 15)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 cursor-pointer"
            title="Reset to current baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Controls Left, Predicted Outcomes Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Scenario Variables (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">
              Operational & Market Variables
            </h3>
            <p className="text-xs text-slate-400">
              Adjust variables to model shockwaves through the production and fulfillment pipeline.
            </p>
          </div>

          {/* Slider 1: Supplier Lead Time Delay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="input-supplier-delay" className="font-bold text-slate-300 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>Supplier Delivery Delay:</span>
              </label>
              <span className="font-mono font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                +{supplierDelayDays} Days
              </span>
            </div>
            <input
              id="input-supplier-delay"
              type="range"
              min={0}
              max={30}
              value={supplierDelayDays}
              onChange={(e) => setSupplierDelayDays(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 (On Time)</span>
              <span>15 Days</span>
              <span>+30 Days (Critical)</span>
            </div>
          </div>

          {/* Slider 2: On-site Inventory Buffer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="input-inventory-buffer" className="font-bold text-slate-300 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-slate-400" />
                <span>On-Hand Safety Stock Buffer:</span>
              </label>
              <span className="font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                {inventoryBufferDays} Days
              </span>
            </div>
            <input
              id="input-inventory-buffer"
              type="range"
              min={0}
              max={30}
              value={inventoryBufferDays}
              onChange={(e) => setInventoryBufferDays(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 (Just-In-Time)</span>
              <span>15 Days</span>
              <span>30 Days (Max Safety)</span>
            </div>
          </div>

          {/* Slider 3: Customer Cancellation Sensitivity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="input-cancel-rate" className="font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <span>Customer Cancellation Sensitivity:</span>
              </label>
              <span className="font-mono font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {customerCancellationRate}%
              </span>
            </div>
            <input
              id="input-cancel-rate"
              type="range"
              min={0}
              max={100}
              step={5}
              value={customerCancellationRate}
              onChange={(e) => setCustomerCancellationRate(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (Patient)</span>
              <span>50%</span>
              <span>100% (Strict Clawback)</span>
            </div>
          </div>

          {/* Toggles: Active Mitigation Levers */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Mitigation Levers
            </span>

            {/* Toggle 1: Air Freight */}
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-850/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Plane className={`w-4 h-4 ${expediteAirFreight ? 'text-indigo-400' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Expedite via Chartered Air Freight
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Saves 8 days transit • Cost: $24,000
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={expediteAirFreight}
                onChange={(e) => setExpediteAirFreight(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>

            {/* Toggle 2: Secondary Supplier */}
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-850/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Truck className={`w-4 h-4 ${secondarySupplierActivated ? 'text-indigo-400' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Activate Secondary Supplier (Arrow Zurich)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Delivers 2,400 units in 36h • Premium: $38,500
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={secondarySupplierActivated}
                onChange={(e) => setSecondarySupplierActivated(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Run Button */}
          <button
            id="btn-run-simulation"
            onClick={handleSimulate}
            disabled={isSimulating}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating Neural Cascade...' : 'Simulate Counterfactual Outcome'}</span>
          </button>
        </div>

        {/* Right Column: Projected Impact Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <>
              {/* Output Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Simulated Risk Score */}
                <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-xs">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                    Simulated Risk Index
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-2xl font-black ${scoreColors.text}`}>
                      {result.simulatedRiskScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                    <span className={`text-xs font-bold ${result.riskDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.riskDelta <= 0 ? `${result.riskDelta} pts` : `+${result.riskDelta} pts`}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Base Risk: 84 / 100
                  </span>
                </div>

                {/* Simulated Revenue Exposure */}
                <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-xs">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                    Projected Revenue Exposure
                  </span>
                  <div className="mt-1">
                    <span className="text-xl font-black text-white block">
                      {formatCurrency(result.simulatedRevenueExposure)}
                    </span>
                    <span className={`text-xs font-bold ${result.revenueDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.revenueDelta <= 0 ? `Saved ${formatCurrency(Math.abs(result.revenueDelta))}` : `+${formatCurrency(result.revenueDelta)} Risk`}
                    </span>
                  </div>
                </div>

                {/* Simulated SLA Penalties */}
                <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-xs">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                    Contractual SLA Penalties
                  </span>
                  <div className="mt-1">
                    <span className="text-xl font-black text-rose-400 block">
                      {formatCurrency(result.simulatedSlaPenalties)}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {result.impactedOrdersCount} orders breach SLA
                    </span>
                  </div>
                </div>
              </div>

              {/* Gemini AI Executive Assessment */}
              <div className="bg-indigo-950/20 rounded-xl border border-indigo-500/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Gemini Neural Scenario Assessment
                    </h4>
                  </div>
                  <ExplainableAiBadge type="PREDICTIVE_CASCADE" />
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal bg-slate-950/70 p-3 rounded-lg border border-indigo-500/20 shadow-2xs">
                  {result.aiAssessment}
                </p>
              </div>

              {/* Cascading Forecast Steps */}
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Predicted Mechanical Ripples in Enterprise Operations
                </h4>
                <div className="space-y-2">
                  {(result.cascadingForecast || []).map((forecast, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                        {idx + 1}
                      </span>
                      <span>{forecast}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 14-Day Stock Depletion & Recovery Projection Timeline */}
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    14-Day Component Inventory Buffer Timeline
                  </h4>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <span className="w-2.5 h-2.5 rounded bg-slate-700 border border-slate-600"></span> Base Buffer
                    </span>
                    <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                      <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Simulated Path
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 pt-2">
                  {(result.timelineProjection || []).slice(0, 10).map((t, i) => (
                    <div key={i} className="flex flex-col items-center text-center p-1.5 rounded bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[9px] text-slate-500 font-mono">{t.dateLabel}</span>
                      <div className="h-14 w-3 bg-slate-800 rounded-full my-1.5 flex flex-col justify-end overflow-hidden">
                        <div 
                          style={{ height: `${Math.min(100, (t.simulatedStockLevel / 2800) * 100)}%` }} 
                          className={`w-full transition-all ${t.simulatedStockLevel === 0 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        ></div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${t.simulatedStockLevel === 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {t.simulatedStockLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-12 text-center text-slate-400">
              Simulating initial conditions...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
