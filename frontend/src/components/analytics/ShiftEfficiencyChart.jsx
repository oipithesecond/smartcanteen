// frontend/src/components/analytics/ShiftEfficiencyChart.jsx
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AlertCircle, Grid, SlidersHorizontal } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { SHIFT_EFFICIENCY_DATA } from '../../data/mockCanteenData';

// High-contrast, clean hover tooltip matching the active pattern texture
const CustomShiftTooltip = ({ active, payload, label, patternStyle }) => {
  if (active && payload && payload.length) {
    const consumed = payload.find((p) => p.dataKey === 'consumedKg')?.value || 0;
    const wasted = payload.find((p) => p.dataKey === 'wastedKg')?.value || 0;
    const total = consumed + wasted;
    const eff = total > 0 ? ((consumed / total) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white/98 backdrop-blur-md border border-slate-300/80 rounded-xl p-3.5 shadow-2xl ring-1 ring-black/5 min-w-[190px] text-xs font-space z-50">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
          <span className="font-bold text-slate-900 text-sm">{label} Service</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#d0e5d2] text-[#0e1f13]">
            {eff}% Eff
          </span>
        </div>
        
        <div className="space-y-2">
          {/* Consumed Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 rounded-xs border border-slate-900 shrink-0" viewBox="0 0 14 14">
                {patternStyle === 'dots' ? (
                  <>
                    <rect width="14" height="14" fill="#ffffff" />
                    <circle cx="3.5" cy="3.5" r="1.5" fill="#1c1b1b" />
                    <circle cx="10.5" cy="3.5" r="1.5" fill="#1c1b1b" />
                    <circle cx="3.5" cy="10.5" r="1.5" fill="#1c1b1b" />
                    <circle cx="10.5" cy="10.5" r="1.5" fill="#1c1b1b" />
                  </>
                ) : patternStyle === 'crosshatch' ? (
                  <>
                    <rect width="14" height="14" fill="#ffffff" />
                    <line x1="0" y1="7" x2="14" y2="7" stroke="#1c1b1b" strokeWidth="1.8" />
                    <line x1="7" y1="0" x2="7" y2="14" stroke="#1c1b1b" strokeWidth="1.8" />
                  </>
                ) : (
                  <>
                    <rect width="14" height="14" fill="#ffffff" />
                    <line x1="0" y1="14" x2="14" y2="0" stroke="#1c1b1b" strokeWidth="2.5" />
                    <line x1="-3" y1="7" x2="7" y2="-3" stroke="#1c1b1b" strokeWidth="2.5" />
                    <line x1="7" y1="17" x2="17" y2="7" stroke="#1c1b1b" strokeWidth="2.5" />
                  </>
                )}
              </svg>
              <span className="text-slate-600">Consumed:</span>
            </div>
            <strong className="font-semibold text-slate-900">{consumed} kg</strong>
          </div>

          {/* Wasted Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 rounded-xs border border-[#c76c00] shrink-0" viewBox="0 0 14 14">
                <rect width="14" height="14" fill="#fffaf5" />
                <line x1="0" y1="14" x2="14" y2="0" stroke="#c76c00" strokeWidth="2.5" />
                <line x1="-3" y1="7" x2="7" y2="-3" stroke="#c76c00" strokeWidth="2.5" />
                <line x1="7" y1="17" x2="17" y2="7" stroke="#c76c00" strokeWidth="2.5" />
              </svg>
              <span className="text-slate-600">Wasted:</span>
            </div>
            <strong className="font-semibold text-[#c76c00]">{wasted} kg</strong>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200/80">
            <span className="font-medium text-slate-700">Total Prepared:</span>
            <strong className="font-bold text-slate-950">{total} kg</strong>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ShiftEfficiencyChart() {
  const { selectedDistrict, currentDistrictMeta } = useDashboard();
  const [patternStyle, setPatternStyle] = useState('dots'); // 'dots' | 'slants' | 'crosshatch'

  const shiftsData = SHIFT_EFFICIENCY_DATA[selectedDistrict] || SHIFT_EFFICIENCY_DATA.guntur;

  // Identify lowest efficiency shift
  const lowestEfficiencyShift = [...shiftsData].sort((a, b) => a.efficiencyPct - b.efficiencyPct)[0];

  return (
    <section id="analytics" className="bg-white border border-[#e5e2e1] rounded-3xl p-6 md:p-7 shadow-[2px_10px_28px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase">
            SHIFT OPERATIONS TELEMETRY
          </div>
          <h2 className="text-xl font-semibold text-[#1c1b1b] mt-0.5 font-space">
            Meal-Shift Efficiency Breakdown (4 Operational Slots)
          </h2>
          <p className="text-xs text-[#777771] mt-1">
            Tracking Prepared vs. Consumed vs. Wasted across Breakfast, Lunch, Snacks, and Dinner in {currentDistrictMeta.name}.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdcc3] text-[#c76c00] border border-[#c76c00]/20 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Waste hotspot: <strong className="font-semibold">{lowestEfficiencyShift.shift}</strong> ({lowestEfficiencyShift.wastedKg} kg discarded)</span>
        </div>
      </div>

      {/* Pattern Style Switcher & Scale (Legend) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 text-xs font-space font-medium text-slate-700">
        {/* Interactive Pattern Mode Toggle (Dots, Slant Lines, Crosshatch) */}
        <div className="flex items-center gap-1 bg-[#f7f3f2] p-0.5 rounded-xl border border-[#e5e2e1]">
          <button
            onClick={() => setPatternStyle('dots')}
            className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1.5 ${
              patternStyle === 'dots' 
                ? 'bg-[#1c1b1b] text-white font-bold shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Geometric Dots for Consumed Mass + Stripes for Wasted"
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>Dots & Stripes</span>
          </button>

          <button
            onClick={() => setPatternStyle('slants')}
            className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1.5 ${
              patternStyle === 'slants' 
                ? 'bg-[#1c1b1b] text-white font-bold shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Unified Slanted Line Hatching"
          >
            <span className="font-mono text-xs leading-none">/</span>
            <span>Slant Lines</span>
          </button>

          <button
            onClick={() => setPatternStyle('crosshatch')}
            className={`px-2.5 py-1 rounded-lg transition-all text-[11px] flex items-center gap-1.5 ${
              patternStyle === 'crosshatch' 
                ? 'bg-[#1c1b1b] text-white font-bold shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Woven Crosshatch Grid for Consumed + Stripes for Wasted"
          >
            <Grid className="w-2.5 h-2.5" />
            <span>Grid Matrix</span>
          </button>
        </div>

        {/* Legend / Scale reflecting the selected pattern */}
        <div className="flex items-center gap-5">
          {/* Consumed Mass Swatch */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-3.5 rounded-xs border border-slate-900 shadow-2xs shrink-0" viewBox="0 0 16 14">
              {patternStyle === 'dots' ? (
                <>
                  <rect width="16" height="14" fill="#ffffff" />
                  <circle cx="4" cy="3.5" r="1.5" fill="#1c1b1b" />
                  <circle cx="12" cy="3.5" r="1.5" fill="#1c1b1b" />
                  <circle cx="4" cy="10.5" r="1.5" fill="#1c1b1b" />
                  <circle cx="12" cy="10.5" r="1.5" fill="#1c1b1b" />
                </>
              ) : patternStyle === 'crosshatch' ? (
                <>
                  <rect width="16" height="14" fill="#ffffff" />
                  <line x1="0" y1="7" x2="16" y2="7" stroke="#1c1b1b" strokeWidth="1.6" />
                  <line x1="8" y1="0" x2="8" y2="14" stroke="#1c1b1b" strokeWidth="1.6" />
                </>
              ) : (
                <>
                  <rect width="16" height="14" fill="#ffffff" />
                  <line x1="0" y1="14" x2="14" y2="0" stroke="#1c1b1b" strokeWidth="2.5" />
                  <line x1="-3" y1="7" x2="7" y2="-3" stroke="#1c1b1b" strokeWidth="2.5" />
                  <line x1="7" y1="17" x2="17" y2="7" stroke="#1c1b1b" strokeWidth="2.5" />
                </>
              )}
            </svg>
            <span className="text-slate-800 font-medium">Consumed Mass</span>
          </div>

          {/* Wasted Scrap Swatch */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-3.5 rounded-xs border border-[#c76c00] shadow-2xs shrink-0" viewBox="0 0 16 14">
              <rect width="16" height="14" fill="#fffaf5" />
              <line x1="0" y1="14" x2="14" y2="0" stroke="#c76c00" strokeWidth="2.5" />
              <line x1="-3" y1="7" x2="7" y2="-3" stroke="#c76c00" strokeWidth="2.5" />
              <line x1="7" y1="17" x2="17" y2="7" stroke="#c76c00" strokeWidth="2.5" />
            </svg>
            <span className="text-[#c76c00] font-medium">Wasted Scrap</span>
          </div>
        </div>
      </div>

      {/* Stacked Recharts Bar Chart with SVG Pattern Fills */}
      <div className="w-full h-[280px] min-w-0 pt-2 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={shiftsData}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            {/* SVG Pattern Definitions */}
            <defs>
              {/* 1. Geometric Dot Grid for Consumed Mass */}
              <pattern
                id="pattern-consumed-dots"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <rect width="8" height="8" fill="#ffffff" />
                <circle cx="4" cy="4" r="1.6" fill="#1c1b1b" />
              </pattern>

              {/* 2. Unified Slant Lines for Consumed Mass */}
              <pattern
                id="pattern-consumed-slants"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="8" height="8" fill="#ffffff" />
                <line x1="0" y1="0" x2="0" y2="8" stroke="#1c1b1b" strokeWidth="2.5" />
              </pattern>

              {/* 3. Woven Crosshatch Grid for Consumed Mass */}
              <pattern
                id="pattern-consumed-crosshatch"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <rect width="8" height="8" fill="#ffffff" />
                <line x1="0" y1="4" x2="8" y2="4" stroke="#1c1b1b" strokeWidth="1.2" />
                <line x1="4" y1="0" x2="4" y2="8" stroke="#1c1b1b" strokeWidth="1.2" />
              </pattern>

              {/* Wasted Scrap Diagonal Warning Stripes */}
              <pattern
                id="pattern-wasted-stripes"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="8" height="8" fill="#fffaf5" />
                <line x1="0" y1="0" x2="0" y2="8" stroke="#c76c00" strokeWidth="2.5" />
              </pattern>
            </defs>

            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e2e1" />
            <XAxis dataKey="shift" tick={{ fontSize: 12, fill: '#1c1b1b', fontFamily: 'Space Grotesk' }} />
            <YAxis tick={{ fontSize: 11, fill: '#777771' }} unit=" kg" />
            
            {/* Custom Tooltip with matching pattern context */}
            <Tooltip 
              content={<CustomShiftTooltip patternStyle={patternStyle} />} 
              cursor={{ fill: 'rgba(80, 99, 84, 0.06)', radius: 4 }} 
            />

            {/* Consumed Mass Bar - Dynamically takes active pattern */}
            <Bar 
              dataKey="consumedKg" 
              name="Consumed Mass" 
              stackId="mass" 
              fill={`url(#pattern-consumed-${patternStyle})`} 
              stroke="#1c1b1b" 
              strokeWidth={1.2} 
            />

            {/* Wasted Scrap Bar - Diagonal Stripes */}
            <Bar 
              dataKey="wastedKg" 
              name="Wasted Scrap" 
              stackId="mass" 
              fill="url(#pattern-wasted-stripes)" 
              stroke="#c76c00" 
              strokeWidth={1.2} 
              radius={[3, 3, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4 Shift Cards Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {shiftsData.map((shift) => {
          const isProblematic = shift.efficiencyPct < 85;

          return (
            <div 
              key={shift.shift} 
              className={`p-4 rounded-2xl border transition-all hover:shadow-xs ${
                isProblematic ? 'bg-[#ffdad6]/40 border-[#ba1a1a]/20' : 'bg-[#fdf8f7] border-[#e5e2e1]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#1c1b1b] font-space">{shift.shift}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isProblematic ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#d0e5d2] text-[#0e1f13]'
                }`}>
                  {shift.efficiencyPct}% Eff
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs mt-2.5">
                <span className="text-[#777771]">Prepared:</span>
                <span className="font-space font-semibold text-[#1c1b1b]">{shift.preparedKg} kg</span>
              </div>

              <div className="flex items-baseline justify-between text-xs mt-1">
                <span className="text-[#777771]">Consumed:</span>
                <span className="font-space font-semibold text-[#506354]">{shift.consumedKg} kg</span>
              </div>

              <div className="flex items-baseline justify-between text-xs mt-1">
                <span className="text-[#777771]">Wasted:</span>
                <span className="font-space font-semibold text-[#ba1a1a]">{shift.wastedKg} kg</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
