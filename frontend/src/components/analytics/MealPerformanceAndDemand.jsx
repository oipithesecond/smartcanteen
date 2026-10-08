// frontend/src/components/analytics/MealPerformanceAndDemand.jsx
import React, { useMemo } from 'react';
import { 
  Sunrise, 
  Utensils, 
  Coffee, 
  Moon, 
  Info,
  ArrowRight
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { CONSUMPTION_VS_TRASH } from '../../data/mockCanteenData';

const SLOT_ICONS = {
  breakfast: Sunrise,
  lunch: Utensils,
  snacks: Coffee,
  dinner: Moon
};

export default function MealPerformanceAndDemand({ onOpenBatchPlan }) {
  const { selectedDistrict, batchCookPlan, isNerdMode } = useDashboard();

  // Dynamically compute meal performances from CONSUMPTION_VS_TRASH
  const dishes = CONSUMPTION_VS_TRASH[selectedDistrict] || CONSUMPTION_VS_TRASH.guntur;
  
  const rankedPerformances = useMemo(() => {
    return dishes.map((dish, idx) => {
      const totalKg = dish.eatenKg + dish.trashedKg;
      const wasteRatePct = totalKg > 0 ? ((dish.trashedKg / totalKg) * 100).toFixed(1) : '0.0';
      const rateNum = parseFloat(wasteRatePct);
      const isGood = rateNum < 8;

      return {
        dish: dish.name,
        wasteRate: `${wasteRatePct}%`,
        rateNum,
        isGood,
        barWidth: `${Math.min(100, Math.max(15, rateNum * 5))}%`,
        barColor: rateNum < 7 ? '#1c1b1b' : rateNum < 12 ? '#777771' : '#c76c00',
        badge: isNerdMode 
          ? (idx === 0 ? 'MOST EFFICIENT' : rateNum > 13 ? 'NEEDS ATTENTION' : null)
          : (isGood ? 'Eaten Clean' : 'High Scrap'),
        badgeClass: isGood 
          ? 'bg-[#1c1b1b] text-white' 
          : 'bg-[#ffdcc3]/70 text-[#c76c00] border border-[#c76c00]/30',
        meta: isNerdMode 
          ? `Prepared: ${totalKg.toFixed(1)} kg • Wasted: ${dish.trashedKg} kg`
          : (isGood ? 'Diners finished full portions' : 'Portions frequently left uneaten')
      };
    }).sort((a, b) => a.rateNum - b.rateNum).slice(0, 4);
  }, [dishes, isNerdMode]);

  // Dynamically aggregate tomorrow's demand from batchCookPlan
  const demandSlots = useMemo(() => {
    const slots = [
      { id: 'breakfast', label: 'Breakfast' },
      { id: 'lunch', label: 'Lunch' },
      { id: 'snacks', label: 'Snacks' },
      { id: 'dinner', label: 'Dinner' }
    ];

    return slots.map((slot) => {
      const itemsInSlot = (batchCookPlan || []).filter((item) => item.mealSlot === slot.id);
      const totalPortions = itemsInSlot.reduce((sum, item) => sum + (item.optimalCookPortions || item.forecastedDemand || 0), 0);
      return {
        slot: slot.label,
        servings: totalPortions > 0 ? totalPortions.toLocaleString() : '640',
        icon: SLOT_ICONS[slot.id]
      };
    });
  }, [batchCookPlan]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0 items-stretch">
      {/* Left Card: Meal Performance */}
      <div id="performance" className="lg:col-span-5 bg-white border border-[#e5e2e1] rounded-2xl p-5 md:p-6 shadow-[2px_8px_24px_rgba(28,27,27,0.03),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_12px_28px_rgba(28,27,27,0.055)] transition-all duration-200 flex flex-col justify-between min-w-0 scroll-mt-24">
        <div>
          <div className="mb-4">
            <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase flex items-center justify-between">
              <span>{isNerdMode ? "WASTE RATE BY MENU ITEM" : "DISH CONSUMPTION PROFILE"}</span>
              <span className="text-[10px] font-mono font-bold text-[#1c1b1b] bg-neutral-100 px-2 py-0.5 rounded-full">
                Audit Active
              </span>
            </div>
            <h2 className="text-lg font-semibold text-[#1c1b1b] mt-0.5 font-space">
              {isNerdMode ? "Meal Performance" : "Which Dishes Get Eaten Clean?"}
            </h2>
          </div>

          <div className="space-y-4">
            {rankedPerformances.map((meal) => (
              <div key={meal.dish} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#1c1b1b] font-space">{meal.dish}</span>
                    {meal.badge && (
                      <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${meal.badgeClass}`}>
                        {meal.badge}
                      </span>
                    )}
                  </div>
                  {isNerdMode ? (
                    <span className="text-xs font-mono font-bold text-[#1c1b1b]">{meal.wasteRate} scrap</span>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-bold font-space" style={{ color: meal.barColor }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meal.barColor }} />
                      <span>{meal.isGood ? 'POPULAR' : 'WATCH'}</span>
                    </div>
                  )}
                </div>

                <div className="w-full bg-[#f1edec] h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: meal.barWidth,
                      backgroundColor: meal.barColor
                    }}
                  />
                </div>

                {isNerdMode && (
                  <div className="text-[11px] text-[#777771]">
                    {meal.meta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Card: Tomorrow's Demand */}
      <div className="lg:col-span-7 bg-white border border-[#e5e2e1] rounded-3xl p-6 md:p-7 shadow-[2px_10px_28px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_14px_34px_rgba(28,27,27,0.06)] transition-all duration-200 flex flex-col justify-between min-w-0">
        <div>
          <div className="mb-4">
            <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase flex items-center justify-between">
              <span>{isNerdMode ? "FORECASTED SERVINGS BY MEAL SERVICE" : "TOMORROW'S PREP TARGETS"}</span>
              <span className="text-[10px] font-mono font-bold text-[#1c1b1b] bg-neutral-100 px-2 py-0.5 rounded-full">
                4 Meal Services
              </span>
            </div>
            <h2 className="text-lg font-semibold text-[#1c1b1b] mt-0.5 font-space">
              {isNerdMode ? "Tomorrow's Demand" : "Plates to Prepare Tomorrow"}
            </h2>
          </div>

          {/* 4 Demand Column Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {demandSlots.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.slot}
                  className="bg-[#fcfaf9] border border-[#e5e2e1] rounded-2xl p-4 text-center flex flex-col items-center justify-between hover:border-[#c8c7bf] hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[#777771] uppercase">
                    <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span>{item.slot}</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-semibold text-[#1c1b1b] font-space my-2">
                    {item.servings}
                  </div>
                  <span className="text-[10px] text-[#777771] uppercase font-mono">plates</span>
                </div>
              );
            })}
          </div>

          {/* Callout box */}
          <div className="mt-6 bg-[#fcfaf9] border border-[#e5e2e1] p-4 rounded-2xl text-[#1c1b1b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-[#777771] shrink-0" />
              <p className="text-xs font-medium leading-relaxed text-[#474741]">
                {isNerdMode ? (
                  <>Expected demand accuracy: <strong className="font-semibold text-[#1c1b1b]">93.7%</strong> based on historical shift data and academic calendar.</>
                ) : (
                  <><strong>Kitchen Note:</strong> Lunch is the highest-volume service (~1,280 plates). Prep morning base ingredients early.</>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                if (onOpenBatchPlan) onOpenBatchPlan();
                const el = document.getElementById('batch-plan');
                if (el) {
                  const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - 76;
                  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold font-space bg-[#1c1b1b] text-white rounded-xl hover:bg-black transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <span>{isNerdMode ? "View Batch Cook Plan" : "View Batch Schedule"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isNerdMode && (
          <div className="mt-4 pt-3 border-t border-[#e5e2e1] text-xs text-[#777771] flex items-center justify-between font-mono">
            <span>Stochastic Newsvendor dynamic buffers included</span>
          </div>
        )}
      </div>
    </div>
  );
}
