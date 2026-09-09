// frontend/src/components/analytics/ExecutiveKpiStrip.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function ExecutiveKpiStrip() {
  const { currentDistrictMeta, selectedDistrict } = useDashboard();

  // Baseline values formatted accurately
  const isGuntur = selectedDistrict === 'guntur';
  const wasteTrendFormatted = isGuntur ? '18.4%' : Math.abs(currentDistrictMeta.wasteRateTrend) + '%';
  const mealsVal = currentDistrictMeta.todayMeals ? currentDistrictMeta.todayMeals.toLocaleString() : '2,486';
  const foodPreparedKg = currentDistrictMeta.foodPreparedKg ? currentDistrictMeta.foodPreparedKg.toLocaleString() : '1,920';
  const foodConsumedKg = currentDistrictMeta.foodConsumedKg ? currentDistrictMeta.foodConsumedKg.toLocaleString() : '1,742';
  const wasteRateVal = currentDistrictMeta.wasteRate ? currentDistrictMeta.wasteRate.toFixed(1) + '%' : '9.3%';

  return (
    <section id="dashboard" className="space-y-6 pt-2">
      {/* Editorial Headline & Subtitle */}
      <div>
        <span className="text-[11px] font-bold tracking-[0.14em] text-[#777771] uppercase">
          TODAY'S EXECUTIVE SUMMARY
        </span>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#1c1b1b] mt-1.5 font-space">
          Waste is down {wasteTrendFormatted} this month.
        </h1>
        <p className="text-sm md:text-base text-[#474741] mt-2 max-w-3xl leading-relaxed">
          {currentDistrictMeta.subtext || 'Kitchen efficiency is trending positive across all meal services. Dinner buffet remains the largest opportunity for reduction.'}
        </p>
      </div>

      {/* 4 KPI Cards in a row with Organic Nuances: Alternating p-5 vs p-6, rounded-2xl vs rounded-3xl, warm off-axis shadow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* Card 1: Today's Meals - p-5, rounded-2xl */}
        <div className="bg-white border border-[#e5e2e1] p-5 rounded-2xl shadow-[2px_6px_20px_rgba(28,27,27,0.03),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_10px_26px_rgba(28,27,27,0.055)] transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-[0.08em] text-[#777771] uppercase">
              TODAY'S MEALS
            </div>
            <div className="text-3xl md:text-4xl font-semibold text-[#1c1b1b] mt-2.5 font-space tracking-tight">
              {mealsVal}
            </div>
          </div>
          <div className="text-xs text-[#506354] font-medium mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{currentDistrictMeta.mealsTrendPct || 4.2}% vs yesterday</span>
          </div>
        </div>

        {/* Card 2: Food Prepared - p-6, rounded-3xl */}
        <div className="bg-white border border-[#e5e2e1] p-6 rounded-3xl shadow-[2px_8px_24px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_12px_30px_rgba(28,27,27,0.06)] transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-[0.08em] text-[#777771] uppercase">
              FOOD PREPARED
            </div>
            <div className="text-3xl md:text-4xl font-semibold text-[#1c1b1b] mt-2.5 font-space tracking-tight">
              {foodPreparedKg} <span className="text-lg font-normal text-[#777771]">kg</span>
            </div>
          </div>
          <div className="text-xs text-[#777771] font-medium mt-3">
            Daily target: 2,000 kg
          </div>
        </div>

        {/* Card 3: Food Consumed - p-5, rounded-2xl */}
        <div className="bg-white border border-[#e5e2e1] p-5 rounded-2xl shadow-[2px_6px_20px_rgba(28,27,27,0.03),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_10px_26px_rgba(28,27,27,0.055)] transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-[0.08em] text-[#777771] uppercase">
              FOOD CONSUMED
            </div>
            <div className="text-3xl md:text-4xl font-semibold text-[#1c1b1b] mt-2.5 font-space tracking-tight">
              {foodConsumedKg} <span className="text-lg font-normal text-[#777771]">kg</span>
            </div>
          </div>
          <div className="text-xs text-[#777771] font-medium mt-3">
            90.7% utilization
          </div>
        </div>

        {/* Card 4: Waste Rate - p-6, rounded-3xl (Soft Sage Highlight Container) */}
        <div className="bg-[#d0e5d2] border border-[#506354]/25 p-6 rounded-3xl shadow-[2px_8px_24px_rgba(80,99,84,0.08),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_12px_30px_rgba(80,99,84,0.12)] transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-[0.08em] text-[#0e1f13] uppercase">
              WASTE RATE
            </div>
            <div className="text-3xl md:text-4xl font-semibold text-[#0e1f13] mt-2.5 font-space tracking-tight">
              {wasteRateVal}
            </div>
          </div>
          <div className="text-xs text-[#546758] font-medium mt-3 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-2.1% vs last week</span>
          </div>
        </div>
      </div>
    </section>
  );
}
