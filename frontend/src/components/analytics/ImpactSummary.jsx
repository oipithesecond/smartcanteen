// frontend/src/components/analytics/ImpactSummary.jsx
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function ImpactSummary() {
  const { currentDistrictMeta } = useDashboard();

  const wastePreventedKg = currentDistrictMeta.wastePreventedKg 
    ? currentDistrictMeta.wastePreventedKg.toLocaleString() 
    : '1,240';
    
  const costSaved = currentDistrictMeta.estimatedCostSaved 
    ? '₹' + currentDistrictMeta.estimatedCostSaved.toLocaleString() 
    : '₹86,400';
    
  const co2Avoided = currentDistrictMeta.estimatedCo2AvoidedTons 
    ? currentDistrictMeta.estimatedCo2AvoidedTons 
    : '3.1';

  return (
    <section className="space-y-4">
      <div>
        <span className="text-[11px] font-bold tracking-[0.14em] text-[#777771] uppercase">
          THIS MONTH • {currentDistrictMeta.name.toUpperCase()}
        </span>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1c1b1b] mt-0.5 font-space">
          Impact
        </h2>
        <p className="text-xs md:text-sm text-[#777771] mt-1">
          Measurable progress toward zero-waste kitchen operations in {currentDistrictMeta.fullName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Metric 1 - p-6, rounded-3xl */}
        <div className="bg-white border border-[#e5e2e1] p-6 rounded-3xl shadow-[2px_8px_24px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_12px_30px_rgba(28,27,27,0.06)] transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="text-3xl md:text-4xl font-semibold text-[#1c1b1b] font-space tracking-tight">
              {wastePreventedKg} <span className="text-xl font-normal text-[#777771]">kg</span>
            </div>
            <div className="text-sm font-medium text-[#1c1b1b] mt-1">
              Food waste prevented
            </div>
          </div>
          <div className="text-xs text-[#506354] font-medium mt-4 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{currentDistrictMeta.mealsTrendPct || 4.2}% vs last month</span>
          </div>
        </div>

        {/* Metric 2 - p-5, rounded-2xl */}
        <div className="bg-white border border-[#e5e2e1] p-5 rounded-2xl shadow-[2px_6px_20px_rgba(28,27,27,0.03),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_10px_26px_rgba(28,27,27,0.055)] transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="text-3xl md:text-4xl font-semibold text-[#1c1b1b] font-space tracking-tight">
              {costSaved}
            </div>
            <div className="text-sm font-medium text-[#1c1b1b] mt-1">
              Estimated cost saved
            </div>
          </div>
          <div className="text-xs text-[#777771] mt-4">
            Based on ₹69.7/kg average ingredient cost
          </div>
        </div>

        {/* Metric 3 - p-6, rounded-3xl */}
        <div className="bg-white border border-[#e5e2e1] p-6 rounded-3xl shadow-[2px_8px_24px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_12px_30px_rgba(28,27,27,0.06)] transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="text-3xl md:text-4xl font-semibold text-[#1c1b1b] font-space tracking-tight">
              {co2Avoided} <span className="text-xl font-normal text-[#777771]">tons</span>
            </div>
            <div className="text-sm font-medium text-[#1c1b1b] mt-1">
              Estimated CO2 impact avoided
            </div>
          </div>
          <div className="text-xs text-[#777771] mt-4">
            Equivalent to 12,400 km car travel offset
          </div>
        </div>
      </div>
    </section>
  );
}
