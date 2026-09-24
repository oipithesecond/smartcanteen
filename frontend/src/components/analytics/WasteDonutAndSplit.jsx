// frontend/src/components/analytics/WasteDonutAndSplit.jsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { CATEGORY_WASTE_DATA, CONSUMPTION_VS_TRASH } from '../../data/mockCanteenData';

// Monochrome palette with singular warm amber accent for the top waste category
const ETHOS_SLICE_COLORS = ['#c76c00', '#1c1b1b', '#404040', '#6e6e6e', '#a3a3a3'];

const CustomDonutTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white/98 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-xl text-xs font-space min-w-[210px] pointer-events-none z-50">
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100">
        <span
          className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
          style={{ backgroundColor: data.color }}
        />
        <span className="font-bold text-[#1c1b1b] text-xs font-space truncate">
          {data.category}
        </span>
      </div>
      <div className="space-y-1.5 text-[11px] font-sans">
        <div className="flex items-center justify-between">
          <span className="text-[#777771] font-medium">Waste Share:</span>
          <span className="font-space font-bold text-[#1c1b1b] text-xs">
            {data.percentage}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#777771] font-medium">Scrap Mass:</span>
          <span className="font-space font-semibold text-[#1c1b1b]">
            {data.kg} kg / day
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#777771] font-medium">Estimated Value:</span>
          <span className="font-space font-bold text-[#c76c00]">
            ₹{Number(data.cost).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function WasteDonutAndSplit() {
  const { selectedDistrict, currentDistrictMeta, isNerdMode } = useDashboard();
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const categories = CATEGORY_WASTE_DATA.map((cat, idx) => ({
    ...cat,
    color: ETHOS_SLICE_COLORS[idx % ETHOS_SLICE_COLORS.length]
  }));

  const topCategory = categories[0] || { category: 'Rice', percentage: 42 };
  const dishTrashList = CONSUMPTION_VS_TRASH[selectedDistrict] || CONSUMPTION_VS_TRASH.guntur;
  const topWastedDish = (dishTrashList && dishTrashList.length > 0)
    ? [...dishTrashList].sort((a, b) => b.trashedKg - a.trashedKg)[0]
    : { name: 'Andhra Veg Thali', trashedKg: 15.75 };

  return (
    <div id="waste-split" className="h-full bg-white border border-[#e5e2e1] rounded-3xl p-6 md:p-7 shadow-[2px_10px_28px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_14px_34px_rgba(28,27,27,0.06)] transition-all duration-200 flex flex-col justify-between min-w-0 scroll-mt-24">
      <div>
        {/* Header */}
        <div className="mb-4">
          <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase flex items-center justify-between">
            <span>{isNerdMode ? "BY FOOD CATEGORY" : "FOOD SCRAP RADAR"} • {currentDistrictMeta.name.toUpperCase()}</span>
            <span className="text-[10px] font-mono font-bold bg-[#ffdcc3]/60 text-[#c76c00] border border-[#c76c00]/30 px-2 py-0.5 rounded-full">
              Rice: 42% of Waste
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#1c1b1b] mt-0.5 font-space">
            {isNerdMode ? "Where is food being wasted?" : "Which food is left in the trash?"}
          </h2>
        </div>

        {/* Donut Chart Container */}
        <div className="relative w-full h-[220px] min-w-0 flex items-center justify-center">
          {/* Center Callout: Sits at z-0 behind chart, and cleanly fades to opacity-0 while hovering any slice */}
          <div 
            className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 transition-opacity duration-150 ${
              hoveredSlice ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <span className="text-3xl font-bold text-[#1c1b1b] font-space leading-none">
              {topCategory.percentage}%
            </span>
            <span className="text-[10px] font-bold tracking-wider text-[#777771] uppercase mt-1">
              {isNerdMode ? topCategory.category.split(' ')[0] : 'RICE IS #1'}
            </span>
          </div>

          {/* Chart rendered at z-10 with tooltip at z-100 to guarantee tooltip is always on top */}
          <div className="relative z-10 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  stroke="#ffffff"
                  strokeWidth={2}
                  paddingAngle={2}
                  dataKey="percentage"
                  onMouseEnter={(entry) => setHoveredSlice(entry)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                  content={<CustomDonutTooltip />} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mt-4 pt-4 border-t border-[#e5e2e1]">
          {categories.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-[#1c1b1b] truncate max-w-[120px]" title={cat.category}>
                  {cat.category.split('&')[0].trim()}
                </span>
              </div>
              <span className="font-space font-semibold text-[#777771] shrink-0">
                {cat.percentage}% {isNerdMode && <span className="text-[10px] font-normal font-sans">({cat.kg}kg)</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Box */}
      <div className="mt-5 border-l-2 border-[#c76c00] bg-[#fdf8f7] p-3.5 rounded-r-xl text-xs text-[#474741] leading-relaxed flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#c76c00] shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-xs font-space text-[#1c1b1b]">
            High Rice Waste Alert
          </div>
          <p className="mt-0.5 text-[11px] text-[#474741]">
            {isNerdMode 
              ? `${topWastedDish.name} accounts for ${topWastedDish.trashedKg} kg of daily scrap. Adjust batch portions accordingly.`
              : 'Kitchen staff: reduce cooked rice batch sizes by 1 pot during afternoon service.'}
          </p>
        </div>
      </div>
    </div>
  );
}
