// frontend/src/components/analytics/DemandForecastHorizon.jsx
import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';
import { 
  ShieldCheck, 
  CheckCircle2,
  Calendar,
  Utensils
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { FORECAST_HORIZON_DATA } from '../../data/mockCanteenData';

// Detailed Technical Tooltip for Data Analysts & Admins (Nerd Mode)
const CustomHorizonTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0]?.payload;
    const isTomorrow = dataPoint?.date === 'Tomorrow';

    return (
      <div className="bg-white/98 backdrop-blur-md border border-slate-300 p-3.5 rounded-xl shadow-xl font-space text-xs z-50 min-w-[210px]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
          <div className="font-bold text-[#1c1b1b]">
            {dataPoint?.day}, {dataPoint?.date}
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f7f3f2] border border-[#e5e2e1] text-[#474741] font-mono">
            {dataPoint?.weather}
          </span>
        </div>

        <div className="space-y-1.5">
          {dataPoint?.actual !== null && (
            <div className="flex items-center justify-between">
              <span className="text-[#474741] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1c1b1b]" />
                Actual Consumed:
              </span>
              <span className="font-bold text-[#1c1b1b]">
                {dataPoint?.actual.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[#474741] flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-[#777771]" />
              XGBoost Baseline:
            </span>
            <span className="font-bold text-[#777771]">
              {dataPoint?.predicted.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#1c1b1b] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#e5e2e1] border border-[#1c1b1b]" />
              Cook Target (+Buffer):
            </span>
            <span className="font-bold text-[#1c1b1b]">
              {dataPoint?.optimalBuffer.toLocaleString()}
            </span>
          </div>

          {dataPoint?.accuracy && (
            <div className="pt-1.5 mt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <span className="text-[#777771]">Model Accuracy:</span>
              <span className="font-bold text-[#1c1b1b]">{dataPoint.accuracy}%</span>
            </div>
          )}

          {isTomorrow && (
            <div className="pt-1.5 mt-1 border-t border-slate-200 text-[#1c1b1b] text-[11px] font-semibold flex items-center gap-1">
              <span>Tomorrow Scheduled Cook Plan</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Clean Visual Tooltip for Floor View (Simple Mode)
const SimpleHorizonTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0]?.payload;
    const isTomorrow = dataPoint?.date === 'Tomorrow' || dataPoint?.day === 'Tomorrow';

    return (
      <div className="bg-white/98 backdrop-blur-md border border-slate-300 p-3 rounded-xl shadow-xl font-space text-xs z-50 min-w-[190px]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
          <div className="font-bold text-[#1c1b1b]">
            {dataPoint?.day} ({dataPoint?.date})
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fdf8f7] border border-[#e5e2e1] text-[#1c1b1b] font-mono">
            {dataPoint?.weather}
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          {dataPoint?.actual !== null && (
            <div className="flex items-center justify-between">
              <span className="text-[#474741]">People Ate:</span>
              <span className="font-bold text-[#1c1b1b]">
                {dataPoint?.actual.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[#1c1b1b]">Food Prepared:</span>
            <span className="font-bold text-[#1c1b1b]">
              {dataPoint?.optimalBuffer.toLocaleString()} plates
            </span>
          </div>

          <div className="pt-1.5 mt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-[#777771]">Safety Margin:</span>
            <span className="font-bold text-[#1c1b1b]">Protected</span>
          </div>

          {isTomorrow && (
            <div className="pt-1.5 mt-1 border-t border-slate-200 text-[#1c1b1b] text-[11px] font-semibold">
              Tomorrow Target
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function DemandForecastHorizon() {
  const { selectedDistrict, currentDistrictMeta, modelMeta, isNerdMode } = useDashboard();

  const horizonList = FORECAST_HORIZON_DATA[selectedDistrict] || FORECAST_HORIZON_DATA.guntur;
  const validDays = horizonList.filter(d => d.accuracy !== null);
  const avgAccuracy = (validDays.reduce((acc, d) => acc + d.accuracy, 0) / validDays.length).toFixed(1);

  const tomorrowData = horizonList.find(d => d.date === 'Tomorrow' || d.day === 'Tomorrow') || horizonList[horizonList.length - 1];

  return (
    <section 
      id="forecast-horizon"
      className="relative bg-white border border-[#e5e2e1] p-6 md:p-8 shadow-[2px_12px_32px_rgba(28,27,27,0.04),0_1px_3px_rgba(28,27,27,0.02)] transition-all hover:shadow-[3px_16px_36px_rgba(28,27,27,0.06)] min-w-0 scroll-mt-24"
      style={{
        borderRadius: '22px 27px 21px 25px'
      }}
    >
      {/* Hand-Penciled Audit Tag */}
      {isNerdMode ? (
        <div 
          aria-hidden="true"
          className="absolute -top-3.5 right-10 px-3 py-0.5 bg-[#f1edec] border border-[#c8c7bf] text-[10px] font-mono tracking-widest text-[#474741] shadow-xs select-none pointer-events-none rotate-[1.2deg] flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1c1b1b]" />
          <span>7-DAY AUDIT • ZERO STOCKOUTS</span>
        </div>
      ) : (
        <div 
          aria-hidden="true"
          className="absolute -top-3.5 right-6 px-3 py-0.5 bg-neutral-100 border border-neutral-300 text-[11px] font-mono font-bold text-[#1c1b1b] shadow-xs select-none pointer-events-none rounded-full"
        >
          ZERO FOOD SHORTAGES
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pt-1">
        <div>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#777771] uppercase flex items-center gap-2">
            <span>{isNerdMode ? "PREDICTIVE ACCURACY TELEMETRY" : "MEAL DEMAND FORECAST"}</span>
            <span className="w-1 h-1 rounded-full bg-[#777771]" />
            <span>{currentDistrictMeta.name.toUpperCase()} FACILITY</span>
          </div>
          <h2 className="text-xl font-semibold text-[#1c1b1b] mt-1 font-space tracking-tight">
            {isNerdMode ? "Actual vs. XGBoost Forecast & Newsvendor Buffer Horizon" : "Expected Diners & Target Prep This Week"}
          </h2>
          <p className="text-xs text-[#474741] mt-1 max-w-2xl leading-relaxed">
            {isNerdMode
              ? "Multi-day tracking comparing real customer turnout against the raw machine baseline and stochastic buffer safety envelope."
              : "Tracking day-by-day guest volume so the kitchen cooks the exact required amount with zero shortages."}
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {isNerdMode ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-space font-medium bg-neutral-100 text-[#1c1b1b] border border-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Avg Accuracy: <strong>{avgAccuracy}%</strong></span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-space font-medium bg-[#f7f3f2] text-[#474741] border border-[#e5e2e1]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Stockout Risk: <strong>0.0%</strong></span>
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-space font-bold bg-[#1c1b1b] text-white shadow-xs">
                <Utensils className="w-3.5 h-3.5" />
                <span>Tomorrow Target: {tomorrowData?.optimalBuffer?.toLocaleString() || '2,630'} Plates</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-space font-medium bg-[#f7f3f2] text-[#1c1b1b] border border-[#e5e2e1]">
                <span>33°C Sunny • Regular Service</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Horizon Composed Chart (Monochrome) */}
      <div className="w-full h-[280px] md:h-[320px] min-w-0 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={horizonList}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="bufferGradientMono" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4d4d4" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#d4d4d4" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e2e1" />

            <XAxis 
              dataKey="day" 
              tick={{ fill: '#777771', fontSize: 11, fontFamily: 'Space Grotesk' }}
              axisLine={{ stroke: '#e5e2e1' }}
              tickLine={false}
            />
            <YAxis 
              domain={['dataMin - 200', 'dataMax + 150']}
              tick={{ fill: '#777771', fontSize: 11, fontFamily: 'Space Grotesk' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />

            <Tooltip content={isNerdMode ? <CustomHorizonTooltip /> : <SimpleHorizonTooltip />} />

            <Area
              type="monotone"
              dataKey="optimalBuffer"
              name={isNerdMode ? "Safety Buffer Zone" : "Food Prepared Target"}
              stroke="#777771"
              strokeWidth={1.5}
              strokeDasharray={isNerdMode ? "4 2" : "0"}
              fill="url(#bufferGradientMono)"
            />

            {isNerdMode && (
              <Line
                type="monotone"
                dataKey="predicted"
                name="XGBoost Baseline"
                stroke="#a3a3a3"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#777771' }}
              />
            )}

            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Diners"
              stroke="#1c1b1b"
              strokeWidth={3}
              dot={{ r: 4, fill: '#1c1b1b', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#1c1b1b' }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Visual Legend (Monochrome) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-[#e5e2e1]/80">
        <div className="flex items-center gap-2.5 text-xs text-[#1c1b1b] font-space bg-[#fcfaf9] p-2.5 rounded-xl border border-[#e5e2e1]">
          <span className="w-3.5 h-3.5 rounded-full bg-[#1c1b1b] shrink-0" />
          <div>
            <div className="font-semibold">Actual Diners</div>
            <div className="text-[11px] text-[#777771]">Turnstile sensor counts</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#1c1b1b] font-space bg-[#fcfaf9] p-2.5 rounded-xl border border-[#e5e2e1]">
          <span className="w-3.5 h-0.5 bg-[#777771] border-b-2 border-dashed border-[#777771] shrink-0" />
          <div>
            <div className="font-semibold">Forecast Baseline</div>
            <div className="text-[11px] text-[#777771]">Predicted volume trend</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#1c1b1b] font-space bg-[#fcfaf9] p-2.5 rounded-xl border border-[#e5e2e1]">
          <span className="w-3.5 h-3.5 rounded-xs bg-[#e5e2e1] border border-[#777771] shrink-0" />
          <div>
            <div className="font-semibold">Prepared Target (With Buffer)</div>
            <div className="text-[11px] text-[#777771]">Prevents kitchen runout</div>
          </div>
        </div>
      </div>

      {/* Tactile Footer */}
      <div className="mt-4 pt-2 flex items-center justify-between text-[10px] font-mono text-[#a8a7a1] border-t border-dashed border-[#e5e2e1] select-none">
        <span>[SCALE CALIBRATED: ISO 22000]</span>
        <div className="hidden sm:flex items-center gap-1 tracking-tighter">
          <span>|···|···|···|···|···|···|···|···|···|···|···|···|···|···|</span>
        </div>
        <span>MODEL RMSE: {modelMeta?.modelRmse || 14.26} PORTIONS</span>
      </div>
    </section>
  );
}