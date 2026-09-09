// frontend/src/components/operations/InventoryAtRisk.jsx
import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { INVENTORY_AT_RISK } from '../../data/mockCanteenData';

export default function InventoryAtRisk() {
  return (
    <div id="inventory" className="h-full bg-white border border-[#e5e2e1] rounded-2xl p-5 md:p-6 shadow-[2px_8px_24px_rgba(28,27,27,0.03),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_12px_28px_rgba(28,27,27,0.055)] transition-all duration-200 flex flex-col justify-between min-w-0">
      <div>
        {/* Header */}
        <div className="mb-4">
          <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase">
            ITEMS EXPIRING WITHIN 48 HOURS
          </div>
          <h2 className="text-lg font-semibold text-[#1c1b1b] mt-0.5 font-space">
            Inventory at Risk ({INVENTORY_AT_RISK.length} Active Items)
          </h2>
        </div>

        {/* Perishable Stock Item Rows from INVENTORY_AT_RISK */}
        <div className="space-y-4">
          {INVENTORY_AT_RISK.slice(0, 3).map((item) => {
            const isCritical = item.urgencyLevel === 'CRITICAL';
            const isHigh = item.urgencyLevel === 'HIGH_RISK';
            
            const badgeText = isCritical ? 'Critical' : isHigh ? 'High Risk' : 'Overstocked';
            const badgeClass = isCritical 
              ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30' 
              : isHigh 
                ? 'bg-[#ffdcc3] text-[#c76c00] border-[#c76c00]/30' 
                : 'bg-[#ebe7e6] text-[#474741] border-[#c8c7bf]';
            
            const progressColor = isCritical ? '#ba1a1a' : isHigh ? '#c76c00' : '#506354';
            const progressBg = isCritical ? '#ffdad6' : isHigh ? '#ffdcc3' : '#ebe7e6';
            const progressPercent = isCritical ? 88 : isHigh ? 65 : 40;

            return (
              <div key={item.id} className="border-b border-[#e5e2e1]/80 pb-3.5 last:border-b-0 last:pb-0">
                {/* Item Title, Stock and Risk Chip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-[#1c1b1b] font-space flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      <span>{item.item}</span>
                    </span>
                    <span className="text-xs text-[#777771]">({item.quantityKg} kg in stock)</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>

                {/* Subtitle / Expiry Location */}
                <div className="text-xs text-[#777771] mt-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#777771]" />
                  <span>Expires in {item.expiryHours} hours • {item.category}</span>
                </div>

                {/* Dual-color Progress Bar */}
                <div 
                  className="w-full h-1.5 rounded-full overflow-hidden mt-2"
                  style={{ backgroundColor: progressBg }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
                  />
                </div>

                {/* Suggestion box */}
                <div className="mt-2 text-xs text-[#474741] flex items-center justify-between bg-[#fdf8f7] px-3 py-1.5 rounded-xl border border-[#e5e2e1]/70">
                  <span className="truncate" title={item.actionText}>
                    <strong>Action:</strong> {item.actionText}
                  </span>
                  <button 
                    onClick={() => alert(`Action logged: ${item.actionText}`)}
                    className="text-[10px] font-bold text-[#1c1b1b] hover:underline uppercase shrink-0 ml-2"
                  >
                    Apply
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Footer Link */}
      <div className="pt-3 border-t border-[#e5e2e1] text-xs text-[#777771] flex items-center justify-between mt-3">
        <span>{INVENTORY_AT_RISK.length} perishable batches logged in telemetry</span>
        <button 
          onClick={() => {
            const el = document.getElementById('batch-plan');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-[#1c1b1b] font-medium hover:underline flex items-center gap-1 text-xs"
        >
          <span>View stock reconciliation</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
