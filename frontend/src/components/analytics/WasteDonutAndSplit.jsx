// frontend/src/components/analytics/WasteDonutAndSplit.jsx
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  const leaveTimeoutRef = useRef(null);

  const categories = useMemo(() => {
    return CATEGORY_WASTE_DATA.map((cat, idx) => ({
      ...cat,
      color: ETHOS_SLICE_COLORS[idx % ETHOS_SLICE_COLORS.length]
    }));
  }, []);

  const topCategory = useMemo(() => {
    return categories[0] || { category: 'Rice', percentage: 42 };
  }, [categories]);

  const dishTrashList = useMemo(() => {
    return CONSUMPTION_VS_TRASH[selectedDistrict] || CONSUMPTION_VS_TRASH.guntur;
  }, [selectedDistrict]);

  const sortedDishes = useMemo(() => {
    return [...dishTrashList].sort((a, b) => b.trashedKg - a.trashedKg);
  }, [dishTrashList]);

  const topWastedDishes = useMemo(() => {
    return sortedDishes.slice(0, 3);
  }, [sortedDishes]);

  const totalDishWasteCost = useMemo(() => {
    return dishTrashList.reduce((sum, d) => sum + (d.costLost || 0), 0);
  }, [dishTrashList]);

  const topWastedDish = useMemo(() => {
    return sortedDishes[0] || { name: 'Andhra Veg Thali', trashedKg: 15.75 };
  }, [sortedDishes]);

  const handlePieEnter = useCallback((entry) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    const data = entry?.payload || entry;
    if (data && data.percentage !== undefined) {
      setHoveredSlice(prev => (prev?.category === data.category ? prev : data));
    }
  }, []);

  const handlePieLeave = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredSlice(null);
    }, 80);
  }, []);

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const activeItem = hoveredSlice || topCategory;

  return (
    <div 
      id="waste-split" 
      className="relative h-full bg-white border border-[#e5e2e1] p-6 md:p-7 shadow-[2px_10px_28px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[3px_14px_34px_rgba(28,27,27,0.06)] transition-all duration-200 flex flex-col justify-between min-w-0 scroll-mt-24"
      style={{
        borderRadius: '28px 23px 27px 24px'
      }}
    >
      {/* Tilted Masking Tape Sticker - Human-Made Kitchen Telemetry Tag */}
      <div 
        aria-hidden="true"
        className="absolute -top-3.5 left-8 px-3.5 py-0.5 bg-[#f1edec] border-y border-[#c8c7bf] text-[10px] font-mono tracking-widest text-[#474741] shadow-xs select-none pointer-events-none rotate-[1.1deg] flex items-center gap-1.5 z-20"
        style={{ borderRadius: '3px 2px 4px 3px' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#1c1b1b]" />
        <span>STATION #1 • TELEMETRY RADAR</span>
      </div>

      {/* Rubber Stamp */}
      <div 
        aria-hidden="true"
        className="hidden sm:flex absolute -top-3 right-8 select-none pointer-events-none rotate-[-1.5deg] border border-[#c76c00]/30 bg-[#fff8f2] px-2.5 py-0.5 text-[9px] font-mono font-bold tracking-wider text-[#c76c00] uppercase z-20"
        style={{ borderRadius: '4px 2px 3px 2px' }}
      >
        {isNerdMode ? "[TELUGU CUISINE AUDIT]" : "[RADAR ACTIVE]"}
      </div>

      <div>
        {/* Header */}
        <div className="mb-4 pt-1">
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

        {/* Side-by-Side Donut Telemetry Layout */}
        <div className="flex flex-col sm:flex-row items-center gap-5 my-1">
          {/* Donut Chart Container (Left) */}
          <div className="relative w-[180px] h-[180px] shrink-0 flex items-center justify-center">
            {/* Center Callout: Sits at z-0 behind chart, permanently visible and updates seamlessly without flickering */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <span 
                className="text-2xl sm:text-3xl font-bold font-space leading-none transition-colors duration-150"
                style={{ color: hoveredSlice ? hoveredSlice.color : '#1c1b1b' }}
              >
                {activeItem.percentage}%
              </span>
              <span className="text-[10px] font-bold tracking-wider text-[#777771] uppercase mt-1 text-center max-w-[95px] truncate transition-all duration-150">
                {hoveredSlice 
                  ? (hoveredSlice.category.split('&')[0].trim())
                  : (isNerdMode ? topCategory.category.split(' ')[0] : 'RICE IS #1')}
              </span>
              <span className="text-[9px] font-mono text-[#888881] mt-0.5">
                {activeItem.kg} kg/day
              </span>
            </div>

            {/* Chart rendered at z-10 with tooltip at z-100 */}
            <div className="relative z-10 w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={82}
                    stroke="#ffffff"
                    strokeWidth={2}
                    paddingAngle={2}
                    dataKey="percentage"
                    isAnimationActive={false}
                    onMouseEnter={handlePieEnter}
                    onMouseLeave={handlePieLeave}
                  >
                    {categories.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{
                          opacity: hoveredSlice ? (hoveredSlice.category === entry.category ? 1 : 0.55) : 1,
                          transition: 'opacity 150ms ease'
                        }}
                      />
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

          {/* Ranked Category Telemetry Breakdown (Right) */}
          <div className="flex-1 w-full space-y-1.5 min-w-0">
            {categories.map((cat, idx) => {
              const isHovered = hoveredSlice?.category === cat.category;
              return (
                <div 
                  key={cat.category} 
                  className={`p-2 rounded-xl transition-all cursor-pointer border ${
                    isHovered 
                      ? 'bg-[#fcf7f2] border-[#c76c00]/40 shadow-xs' 
                      : 'bg-[#faf8f6]/70 border-transparent hover:bg-[#f5f2ee] hover:border-[#e5e2e1]'
                  }`}
                  style={{ borderRadius: `${9 + (idx % 2)}px ${12 - (idx % 2)}px ${10 + (idx % 3)}px ${9 + (idx % 2)}px` }}
                  onMouseEnter={() => handlePieEnter(cat)}
                  onMouseLeave={handlePieLeave}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span 
                        className={`font-medium truncate transition-colors text-xs ${
                          isHovered ? 'text-[#c76c00] font-bold' : 'text-[#1c1b1b]'
                        }`} 
                        title={cat.category}
                      >
                        {cat.category.split('&')[0].trim()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-[#777771]">
                        {cat.kg} kg <span className="text-[#a3a39e]">(₹{Number(cat.cost).toLocaleString()})</span>
                      </span>
                      <span className="font-space font-bold text-xs text-[#1c1b1b] min-w-[30px] text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Visual Share Bar */}
                  <div className="w-full bg-[#e8e4e0] h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${cat.percentage}%`, 
                        backgroundColor: cat.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tray-Level Dish Scrap Split - Completely eliminates dead space below chart */}
        <div className="mt-3.5 pt-3 border-t border-[#e5e2e1]/80">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#777771] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c76c00]" />
              {isNerdMode ? "TOP PLATE-SCRAP OFFENDERS (TRAYS)" : "SPECIFIC DISHES LEFT ON PLATES"}
            </span>
            <span className="font-mono text-[10px] text-[#474741]">
              ₹{totalDishWasteCost.toLocaleString()} lost/day
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {topWastedDishes.map((dish, idx) => (
              <div 
                key={dish.name}
                className="bg-[#faf8f6] border border-[#e8e4e0] p-2.5 rounded-xl flex flex-col justify-between transition-colors hover:border-[#c76c00]/40"
                style={{ borderRadius: `${9 + (idx % 2)}px ${12 - (idx % 2)}px ${10 + (idx % 3)}px ${9 + (idx % 2)}px` }}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-medium text-xs text-[#1c1b1b] truncate font-space" title={dish.name}>
                    {dish.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#c76c00] shrink-0">
                    {dish.trashedKg}kg
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#777771]">
                  <span>{dish.trashedPortions} trays</span>
                  <span className="font-mono font-semibold text-[#1c1b1b]">₹{dish.costLost.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Box */}
      <div 
        className="mt-3.5 border-l-2 border-[#c76c00] bg-[#fdf8f7] p-3 rounded-r-xl text-xs text-[#474741] leading-relaxed flex items-start gap-2.5 shadow-2xs"
        style={{ borderRadius: '0 16px 14px 0' }}
      >
        <AlertCircle className="w-4 h-4 text-[#c76c00] shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-xs font-space text-[#1c1b1b]">
            High Rice Waste Alert
          </div>
          <p className="mt-0.5 text-[11px] text-[#474741]">
            {isNerdMode 
              ? `${topWastedDish.name} accounts for ${topWastedDish.trashedKg} kg of daily scrap. Adjust batch portions accordingly.`
              : `Kitchen staff: ${topWastedDish.name} has ${topWastedDish.trashedKg} kg left on diner plates. Reduce batch size by 1 pot.`}
          </p>
        </div>
      </div>
    </div>
  );
}
