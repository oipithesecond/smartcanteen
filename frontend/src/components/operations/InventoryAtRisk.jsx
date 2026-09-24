// frontend/src/components/operations/InventoryAtRisk.jsx
import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { INVENTORY_AT_RISK } from '../../data/mockCanteenData';

export default function InventoryAtRisk() {
  const { isNerdMode } = useDashboard();

  return (
    <div id="inventory" className="h-full bg-white border border-[#e5e2e1] rounded-2xl p-5 md:p-6 shadow-[2px_8px_24px_rgba(28,27,27,0.03),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[2px_12px_28px_rgba(28,27,27,0.055)] transition-all duration-200 flex flex-col justify-between min-w-0 scroll-mt-24">
      <div>
        {/* Header */}
        <div className="mb-4">
          <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase flex items-center justify-between">
            <span>{isNerdMode ? "ITEMS EXPIRING WITHIN 48 HOURS" : "PERISHABLE STOCK ALERT"}</span>
            <span className="text-[10px] font-mono font-bold bg-[#ffdcc3]/60 text-[#c76c00] border border-[#c76c00]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Expiry Watch
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#1c1b1b] mt-0.5 font-space">
            {isNerdMode ? `Inventory at Risk (${INVENTORY_AT_RISK.length} Active Items)` : "Prioritize These Ingredients Today"}
          </h2>
        </div>

        {/* Perishable Stock Item Rows */}
        <div className="space-y-4">
          {INVENTORY_AT_RISK.slice(0, 3).map((item) => {
            const isCritical = item.urgencyLevel === 'CRITICAL';
            const isHigh = item.urgencyLevel === 'HIGH_RISK';
            
            const badgeText = isCritical ? '12h Left' : isHigh ? '24h Left' : '48h Left';
            const nerdBadgeText = isCritical ? 'Critical' : isHigh ? 'High Risk' : 'Overstocked';
            
            const badgeClass = isCritical 
              ? 'bg-[#ffdcc3]/70 text-[#c76c00] border-[#c76c00]/40' 
              : isHigh 
                ? 'bg-[#f5f5f5] text-[#1c1b1b] border-[#c8c7bf]' 
                : 'bg-white text-[#777771] border-[#e5e2e1]';
            
            const progressColor = isCritical ? '#c76c00' : isHigh ? '#1c1b1b' : '#777771';
            const progressBg = isCritical ? '#ffdcc3' : '#e5e2e1';
            const progressPercent = isCritical ? 88 : isHigh ? 65 : 40;

            return (
              <div key={item.id} className="border-b border-[#e5e2e1]/80 pb-3.5 last:border-b-0 last:pb-0">
                {/* Item Title, Stock and Risk Chip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-[#1c1b1b] font-space">
                      {item.item}
                    </span>
                    <span className="text-xs text-[#777771]">({item.quantityKg} kg in stock)</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
                    {isNerdMode ? nerdBadgeText : badgeText}
                  </span>
                </div>

                {/* Subtitle / Expiry Location */}
                <div className="text-xs text-[#777771] mt-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#777771]" />
                  <span>
                    {isNerdMode 
                      ? `Expires in ${item.expiryHours} hours • ${item.category}`
                      : `Expires in ${item.expiryHours} hours • Prep first`}
                  </span>
                </div>

                {/* Progress Bar */}
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
                <div className="mt-2 text-xs text-[#474741] flex items-center justify-between bg-[#fcfaf9] px-3 py-1.5 rounded-xl border border-[#e5e2e1]">
                  <span className="truncate" title={item.actionText}>
                    <strong>Action:</strong> {item.actionText}
                  </span>
                  <button 
                    onClick={() => alert(`Action recorded: ${item.actionText}`)}
                    className="text-[10px] font-bold text-[#1c1b1b] bg-white px-2 py-0.5 rounded-md border border-[#e5e2e1] hover:bg-neutral-100 transition-colors uppercase shrink-0 ml-2 cursor-pointer"
                  >
                    {isNerdMode ? "Apply" : "Cook Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
