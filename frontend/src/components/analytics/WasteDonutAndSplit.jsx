// frontend/src/components/analytics/WasteDonutAndSplit.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboard } from '../../context/DashboardContext';
import { CATEGORY_WASTE_DATA, CONSUMPTION_VS_TRASH } from '../../data/mockCanteenData';

const ETHOS_SLICE_COLORS = ['#1c1b1b', '#506354', '#c76c00', '#c8c7bf', '#858481'];

export default function WasteDonutAndSplit() {
  const { selectedDistrict, currentDistrictMeta } = useDashboard();

  // Colorized with Ethos palette
  const categories = CATEGORY_WASTE_DATA.map((cat, idx) => ({
    ...cat,
    color: ETHOS_SLICE_COLORS[idx % ETHOS_SLICE_COLORS.length]
  }));

  const topCategory = categories[0] || { category: 'Rice', percentage: 42 };
  const dishTrashList = CONSUMPTION_VS_TRASH[selectedDistrict] || CONSUMPTION_VS_TRASH.guntur;
  const topWastedDish = [...dishTrashList].sort((a, b) => b.trashedKg - a.trashedKg)[0];

  return (
    <div id="waste-split" className="h-full bg-white border border-[#e5e2e1] rounded-3xl p-6 md:p-7 shadow-[2px_10px_28px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_14px_34px_rgba(28,27,27,0.06)] transition-all duration-200 flex flex-col justify-between min-w-0">
      <div>
        {/* Header */}
        <div className="mb-4">
          <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase">
            BY FOOD CATEGORY • {currentDistrictMeta.name.toUpperCase()}
          </div>
          <h2 className="text-lg font-semibold text-[#1c1b1b] mt-0.5 font-space">
            Where is food being wasted?
          </h2>
        </div>

        {/* Donut Chart Container */}
        <div className="relative w-full h-[220px] min-w-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                stroke="none"
                paddingAngle={2}
                dataKey="percentage"
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1b1b',
                  borderRadius: '6px',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: 'Space Grotesk'
                }}
                formatter={(val, name, item) => [`${val}% (${item.payload.kg} kg • ₹${item.payload.cost})`, item.payload.category]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout: Top category & percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-[#1c1b1b] font-space leading-tight">
              {topCategory.percentage}%
            </span>
            <span className="text-[10px] font-bold tracking-wider text-[#777771] uppercase">
              {topCategory.category.split(' ')[0]}
            </span>
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
                <span className="font-medium text-[#1c1b1b] truncate max-w-[110px]" title={cat.category}>
                  {cat.category}
                </span>
              </div>
              <span className="font-space font-semibold text-[#777771] shrink-0">
                {cat.percentage}% <span className="text-[10px] font-normal font-sans">({cat.kg}kg)</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial Quote Box at Bottom - Dynamically derived from district's highest scrap dish */}
      <div className="mt-5 border-l-2 border-[#c76c00] bg-[#fdf8f7] p-4 rounded-r-xl text-xs text-[#474741] italic leading-relaxed">
        &ldquo;{topWastedDish.name} accounts for {topWastedDish.trashedKg} kg of daily waste in {currentDistrictMeta.name}. Consider reducing batch volume for this service.&rdquo;
      </div>
    </div>
  );
}
