// frontend/src/components/analytics/ExecutiveKpiStrip.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Utensils, ChefHat, CheckCircle2, Trash2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function ExecutiveKpiStrip() {
  const { currentDistrictMeta, selectedDistrict, isNerdMode } = useDashboard();

  // Baseline values formatted accurately
  const isGuntur = selectedDistrict === 'guntur';
  const wasteTrendFormatted = isGuntur ? '18.4%' : Math.abs(currentDistrictMeta.wasteRateTrend) + '%';
  const mealsVal = currentDistrictMeta.todayMeals ? currentDistrictMeta.todayMeals.toLocaleString() : '2,486';
  const foodPreparedKg = currentDistrictMeta.foodPreparedKg ? currentDistrictMeta.foodPreparedKg.toLocaleString() : '1,920';
  const foodConsumedKg = currentDistrictMeta.foodConsumedKg ? currentDistrictMeta.foodConsumedKg.toLocaleString() : '1,742';
  const wasteRateVal = currentDistrictMeta.wasteRate ? currentDistrictMeta.wasteRate.toFixed(1) + '%' : '9.3%';

  return (
    <section id="dashboard" className="space-y-6 pt-2 scroll-mt-24">
      {/* Editorial Headline & Subtitle */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[0.14em] text-[#777771] uppercase">
            {isNerdMode ? "TODAY'S EXECUTIVE SUMMARY" : "KITCHEN FLOOR STATUS • " + currentDistrictMeta.name.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#1c1b1b] text-white">
            NORMAL
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#1c1b1b] mt-1.5 font-space">
          Waste is down {wasteTrendFormatted} this month
        </h1>
        {isNerdMode && (
          <p className="text-sm md:text-base text-[#474741] mt-2 max-w-3xl leading-relaxed">
            {currentDistrictMeta.subtext || 'Kitchen efficiency is trending positive across all meal services. Dinner buffet remains the largest opportunity for reduction.'}
          </p>
        )}
      </div>

      {/* 4 KPI Cards in a row */}
      {isNerdMode ? (
        /* ── NERD MODE: full numbers layout ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {/* Card 1: Today's Meals */}
          <div className="bg-white border border-[#e5e2e1] p-5 rounded-2xl shadow-[2px_6px_20px_rgba(28,27,27,0.03),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_10px_26px_rgba(28,27,27,0.055)] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.08em] text-[#777771] uppercase flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>TODAY'S MEALS</span>
                </span>
                <span className="text-[10px] font-mono bg-neutral-100 text-[#1c1b1b] px-2 py-0.5 rounded font-bold">
                  Target Met
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-semibold text-[#1c1b1b] mt-2.5 font-space tracking-tight">
                {mealsVal}
              </div>
            </div>
            <div className="text-xs text-[#1c1b1b] font-medium mt-3 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{currentDistrictMeta.mealsTrendPct || 4.2}% vs yesterday</span>
            </div>
          </div>

          {/* Card 2: Food Prepared */}
          <div className="bg-white border border-[#e5e2e1] p-6 rounded-3xl shadow-[2px_8px_24px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_12px_30px_rgba(28,27,27,0.06)] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.08em] text-[#777771] uppercase flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>FOOD PREPARED</span>
                </span>
                <span className="text-[10px] font-mono text-[#777771]">
                  Capacity 2k
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-semibold text-[#1c1b1b] mt-2.5 font-space tracking-tight">
                {foodPreparedKg} <span className="text-lg font-normal text-[#777771]">kg</span>
              </div>
            </div>
            <div className="text-xs text-[#777771] font-medium mt-3">
              Daily target: 2,000 kg
            </div>
          </div>

          {/* Card 3: Food Consumed */}
          <div className="bg-white border border-[#e5e2e1] p-5 rounded-2xl shadow-[2px_6px_20px_rgba(28,27,27,0.03),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_10px_26px_rgba(28,27,27,0.055)] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.08em] text-[#777771] uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>FOOD CONSUMED</span>
                </span>
                <span className="text-[10px] font-mono bg-neutral-100 text-[#1c1b1b] px-2 py-0.5 rounded font-bold">
                  91% Rate
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-semibold text-[#1c1b1b] mt-2.5 font-space tracking-tight">
                {foodConsumedKg} <span className="text-lg font-normal text-[#777771]">kg</span>
              </div>
            </div>
            <div className="text-xs text-[#777771] font-medium mt-3">
              90.7% utilization
            </div>
          </div>

          {/* Card 4: Waste Rate */}
          <div className="bg-white border border-[#1c1b1b] p-6 rounded-3xl shadow-[2px_8px_24px_rgba(28,27,27,0.04),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_12px_30px_rgba(28,27,27,0.08)] transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.08em] text-[#1c1b1b] uppercase flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>WASTE RATE</span>
                </span>
                <span className="text-[10px] font-mono bg-[#1c1b1b] text-white px-2 py-0.5 rounded font-bold">
                  LOW
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-semibold text-[#1c1b1b] mt-2.5 font-space tracking-tight">
                {wasteRateVal}
              </div>
            </div>
            <div className="text-xs text-[#777771] font-medium mt-3 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-2.1% waste vs last week</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── FLOOR VIEW: big icon cards, no numbers ── */
        (() => {
          const wasteRate = currentDistrictMeta.wasteRate || 9.3;
          const wasteColor = wasteRate < 10 ? '#506354' : wasteRate <= 15 ? '#c76c00' : '#ba1a1a';
          const cards = [
            { Icon: Utensils,    color: '#506354', label: 'SERVED'  },
            { Icon: ChefHat,     color: '#1c1b1b', label: 'COOKED'  },
            { Icon: CheckCircle2,color: '#506354', label: 'EATEN'   },
            { Icon: Trash2,      color: wasteColor,label: 'WASTE'   },
          ];
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {cards.map(({ Icon, color, label }) => (
                <div
                  key={label}
                  className="bg-white border border-[#e5e2e1] rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-[2px_6px_20px_rgba(28,27,27,0.03)] hover:shadow-[2px_10px_26px_rgba(28,27,27,0.055)] transition-all duration-200"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="w-10 h-10 text-white stroke-[1.5]" />
                  </div>
                  <span
                    className="text-xs font-extrabold tracking-[0.15em] uppercase"
                    style={{ color }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          );
        })()
      )}
    </section>
  );
}
