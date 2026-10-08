// frontend/src/components/analytics/PlateVsPrepTelemetry.jsx
import React, { useState } from 'react';
import { 
  ChefHat, 
  Utensils, 
  Info
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { PLATE_VS_PREP_DATA } from '../../data/mockCanteenData';

export default function PlateVsPrepTelemetry() {
  const { selectedDistrict, currentDistrictMeta, isNerdMode } = useDashboard();
  const [metricMode, setMetricMode] = useState('kg');

  const data = PLATE_VS_PREP_DATA[selectedDistrict] || PLATE_VS_PREP_DATA.guntur;

  const prepRatio = Math.round((data.prepWasteKg / data.totalWasteKg) * 100);
  const plateRatio = 100 - prepRatio;

  return (
    <section 
      id="plate-vs-prep"
      className="relative bg-white border border-[#e5e2e1] p-6 md:p-8 shadow-[3px_12px_32px_rgba(28,27,27,0.04),0_2px_4px_rgba(28,27,27,0.02)] transition-all hover:shadow-[3px_16px_40px_rgba(28,27,27,0.065)] min-w-0 scroll-mt-24"
      style={{
        borderRadius: '26px 20px 25px 21px'
      }}
    >
      {/* Tilted Kraft Masking Tape Sticker - Nerd Mode only */}
      {isNerdMode && (
        <div 
          aria-hidden="true"
          className="absolute -top-3.5 left-8 px-3.5 py-1 bg-[#fef3c7]/85 border-y border-[#d97706]/30 text-[10px] font-mono tracking-widest text-[#92400e] shadow-xs select-none pointer-events-none rotate-[-1.5deg] backdrop-blur-xs flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]" />
          STATION #4 • TELEMETRY LOG • {data.station.toUpperCase()}
        </div>
      )}

      {/* Rubber Stamp - Nerd Mode only */}
      {isNerdMode && (
        <div 
          aria-hidden="true"
          className="hidden sm:flex absolute top-5 right-6 select-none pointer-events-none rotate-[2.5deg] border-2 border-dashed border-[#1c1b1b]/30 px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold tracking-widest text-[#1c1b1b]/60 uppercase"
        >
          [SCALE SENSOR AUDITED]
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pt-1">
        <div>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#777771] uppercase flex items-center gap-2">
            <span>{isNerdMode ? "ROOT-CAUSE ANALYSIS" : "WHERE DOES WASTE HAPPEN?"}</span>
            <span className="w-1 h-1 rounded-full bg-[#777771]" />
            <span>{currentDistrictMeta.name.toUpperCase()} KITCHEN</span>
          </div>
          <h2 className="text-xl font-semibold text-[#1c1b1b] mt-1 font-space tracking-tight flex items-center gap-2">
            {isNerdMode ? "Plate Waste vs. Kitchen Overproduction" : "Pots Overcooked vs. Customer Plates Leftover"}
          </h2>
          <p className="text-xs text-[#474741] mt-1 max-w-2xl leading-relaxed">
            {isNerdMode
              ? "Distinguishing food discarded in cooking cauldrons (forecast overprep) from uneaten portions left on returned diner trays (portion sizing)."
              : "Are cooks preparing too much food in cauldrons, or are diners leaving portions uneaten on trays?"}
          </p>
        </div>

        {/* Metric Mode Switcher - Nerd Mode only */}
        {isNerdMode && (
          <div className="flex items-center gap-1 bg-[#f7f3f2] p-1 rounded-xl border border-[#e5e2e1] self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setMetricMode('kg')}
              className={`px-3 py-1 rounded-lg text-xs font-space font-medium transition-all ${
                metricMode === 'kg'
                  ? 'bg-white text-[#1c1b1b] shadow-xs font-semibold'
                  : 'text-[#777771] hover:text-[#1c1b1b]'
              }`}
            >
              Weight (kg)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('cost')}
              className={`px-3 py-1 rounded-lg text-xs font-space font-medium transition-all ${
                metricMode === 'cost'
                  ? 'bg-white text-[#1c1b1b] shadow-xs font-semibold'
                  : 'text-[#777771] hover:text-[#1c1b1b]'
              }`}
            >
              Cost Lost (₹)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('pct')}
              className={`px-3 py-1 rounded-lg text-xs font-space font-medium transition-all ${
                metricMode === 'pct'
                  ? 'bg-white text-[#1c1b1b] shadow-xs font-semibold'
                  : 'text-[#777771] hover:text-[#1c1b1b]'
              }`}
            >
              Split (%)
            </button>
          </div>
        )}
      </div>

      {/* High-Level Comparison Strip */}
      <div className="bg-[#fcfaf9] border border-[#e5e2e1] p-4 md:p-5 rounded-2xl mb-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          {/* Prep Overproduction KPI */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1c1b1b] text-white flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#777771] uppercase tracking-wide">
                {isNerdMode ? "Kitchen Prep Overproduction" : "Overcooked in Kitchen Pots"}
              </div>
              <div className="text-lg md:text-xl font-bold font-space text-[#1c1b1b]">
                {(!isNerdMode || metricMode === 'pct') ? `${prepRatio}%` : metricMode === 'kg' ? `${data.prepWasteKg} kg` : `₹${data.prepWasteCost.toLocaleString()}`}
                <span className="text-xs font-normal text-[#777771] ml-1.5 font-sans">
                  ({prepRatio}% of waste)
                </span>
              </div>
            </div>
          </div>

          {/* Divergence vs Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#777771] font-mono bg-white px-3 py-1.5 rounded-full border border-[#e5e2e1]">
            <span className="font-bold text-[#1c1b1b]">Prep: {prepRatio}%</span>
            <span>vs</span>
            <span className="font-bold text-[#c76c00]">Plates: {plateRatio}%</span>
          </div>

          {/* Plate Waste Scrapings KPI */}
          <div className="flex items-center gap-3 sm:text-right sm:flex-row-reverse">
            <div className="w-10 h-10 rounded-xl bg-[#ffdcc3] text-[#c76c00] flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#777771] uppercase tracking-wide">
                {isNerdMode ? "Customer Plate Scrapings" : "Left on Returned Plates"}
              </div>
              <div className="text-lg md:text-xl font-bold font-space text-[#c76c00]">
                {(!isNerdMode || metricMode === 'pct') ? `${plateRatio}%` : metricMode === 'kg' ? `${data.plateWasteKg} kg` : `₹${data.plateWasteCost.toLocaleString()}`}
                <span className="text-xs font-normal text-[#777771] ml-1.5 font-sans">
                  ({plateRatio}% of waste)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bi-Color Proportion Bar */}
        <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex ring-1 ring-black/5">
          <div 
            style={{ width: `${prepRatio}%` }} 
            className="h-full bg-[#1c1b1b] transition-all duration-500"
            title={`Kitchen Prep Overproduction: ${prepRatio}%`}
          />
          <div 
            style={{ width: `${plateRatio}%` }} 
            className="h-full bg-[#c76c00] transition-all duration-500"
            title={`Customer Plate Scrapings: ${plateRatio}%`}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-[#777771] mt-2">
          <span>← Left in Pots ({prepRatio}%)</span>
          <span>Scraped from Plates ({plateRatio}%) →</span>
        </div>

        {/* Actionable Kitchen Tip in Simple Mode */}
        {!isNerdMode && (
          <div className="mt-3 pt-3 border-t border-[#e5e2e1] text-xs text-[#1c1b1b] bg-white -mx-4 -mb-4 p-3.5 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#777771] shrink-0" />
            <span>
              <strong>Floor Note:</strong> {plateRatio > prepRatio ? "Most food is being left on customer plates. Keep standard portion scoops consistent." : "Most food is being leftover in pots. Scale back batch volume on final service run."}
            </span>
          </div>
        )}
      </div>

      {/* Service-by-Service Diverging Telemetry (Nerd Mode) */}
      {isNerdMode && (
        <>
          <div className="space-y-4">
            <div className="text-xs font-bold text-[#1c1b1b] uppercase tracking-wider font-space flex items-center justify-between">
              <span>MEAL SERVICE BREAKDOWN</span>
              <span className="text-[11px] font-normal text-[#777771] normal-case">
                Black: Kitchen Prep • Amber: Plate Scraps
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.services.map((item) => (
                <div 
                  key={item.service}
                  className="bg-[#fcfaf9] border border-[#e5e2e1] p-4 rounded-xl flex flex-col justify-between hover:bg-white hover:border-[#c8c7bf] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-space font-bold text-sm text-[#1c1b1b]">
                        {item.service} Shift
                      </span>
                      <span className="text-xs font-mono font-medium text-[#777771]">
                        {metricMode === 'kg' 
                          ? `${item.prepKg + item.plateKg} kg wasted` 
                          : metricMode === 'cost'
                          ? `₹${Math.round((item.prepKg * 80) + (item.plateKg * 80)).toLocaleString()}`
                          : `${item.prepPct}% / ${item.platePct}%`}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex mb-2.5">
                      <div 
                        style={{ width: `${item.prepPct}%` }}
                        className="h-full bg-[#1c1b1b]" 
                      />
                      <div 
                        style={{ width: `${item.platePct}%` }}
                        className="h-full bg-[#c76c00]" 
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#474741] font-space">
                      <span>Prep: <strong>{item.prepKg} kg</strong> ({item.prepPct}%)</span>
                      <span>Plate: <strong>{item.plateKg} kg</strong> ({item.platePct}%)</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#e5e2e1]/70 flex items-start gap-1.5 text-[11px] text-[#777771]">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#1c1b1b]" />
                    <span>{item.driver}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Human-Made Tactile Element: Chef Note */}
          <div 
            className="mt-6 p-4 bg-[#fcfaf9] border border-[#e5e2e1] rounded-xl relative shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-[#1c1b1b] uppercase">
                    Chef Observation Log
                  </span>
                  <span className="text-[11px] font-mono text-[#777771]">
                    Signed: <span className="font-serif italic font-bold text-[#1c1b1b]">{data.chefSigned}</span>
                  </span>
                </div>
                <p className="text-xs text-[#474741] mt-1 font-serif italic leading-relaxed">
                  "{data.chefObservation}"
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}