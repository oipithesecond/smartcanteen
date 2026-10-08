// frontend/src/components/operations/InventoryAtRisk.jsx
import React, { useState } from 'react';
import { Clock, AlertCircle, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { INVENTORY_AT_RISK } from '../../data/mockCanteenData';

export default function InventoryAtRisk() {
  const { isNerdMode } = useDashboard();
  const [appliedItems, setAppliedItems] = useState({});
  const [showAllItems, setShowAllItems] = useState(false);
  const [batchDispatched, setBatchDispatched] = useState(false);

  const urgentPerishables = INVENTORY_AT_RISK.filter(item => item.expiryHours <= 48);
  const displayedItems = showAllItems ? INVENTORY_AT_RISK : urgentPerishables;

  const handleApply = (itemId, actionText) => {
    setAppliedItems(prev => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      // Keep it marked as applied
    }, 500);
  };

  const handleDispatchAll = () => {
    setBatchDispatched(true);
    const allApplied = {};
    INVENTORY_AT_RISK.forEach(item => {
      allApplied[item.id] = true;
    });
    setAppliedItems(allApplied);
  };

  return (
    <div 
      id="inventory" 
      className="relative h-full bg-white border border-[#e5e2e1] p-5 md:p-6 shadow-[2px_10px_28px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] hover:shadow-[3px_14px_34px_rgba(28,27,27,0.06)] transition-all duration-200 flex flex-col justify-between min-w-0 scroll-mt-24"
      style={{
        borderRadius: '24px 28px 23px 27px'
      }}
    >
      {/* Tilted Kraft Masking Tape Sticker - Human-Made Kitchen Note */}
      <div 
        aria-hidden="true"
        className="absolute -top-3.5 left-7 px-3.5 py-0.5 bg-[#fef3c7]/95 border-y border-[#d97706]/35 text-[10px] font-mono tracking-widest text-[#92400e] shadow-xs select-none pointer-events-none rotate-[-1.4deg] backdrop-blur-xs flex items-center gap-1.5 z-20"
        style={{ borderRadius: '2px 4px 3px 2px' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]" />
        <span>COOLER #2 • {isNerdMode ? "FIFO PROTOCOL" : "CHEF'S EXPIRY WATCH"}</span>
      </div>

      {/* Rubber Stamp - Human Kitchen Inspection */}
      <div 
        aria-hidden="true"
        className="hidden sm:flex absolute -top-3 right-6 select-none pointer-events-none rotate-[2deg] border border-[#1c1b1b]/25 bg-[#faf8f5] px-2.5 py-0.5 text-[9px] font-mono font-bold tracking-wider text-[#1c1b1b]/70 uppercase z-20"
        style={{ borderRadius: '3px 2px 4px 2px' }}
      >
        [4°C SENSOR VERIFIED]
      </div>

      <div>
        {/* Header */}
        <div className="mb-3.5 pt-1">
          <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase flex items-center justify-between">
            <span>{isNerdMode ? "PERISHABLE INVENTORY RADAR" : "PERISHABLE STOCK ALERT"}</span>
            <span className="text-[10px] font-mono font-bold bg-[#ffdcc3]/60 text-[#c76c00] border border-[#c76c00]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Expiry Watch
            </span>
          </div>
          <h2 className="text-lg font-semibold text-[#1c1b1b] mt-0.5 font-space flex items-center justify-between">
            <span>
              {isNerdMode ? `Inventory at Risk (${displayedItems.length} Active Items)` : "Prioritize These Ingredients Today"}
            </span>
            <span className="text-xs font-mono font-normal text-[#777771]">
              4 perishables &lt; 48h
            </span>
          </h2>
        </div>

        {/* Perishable Stock Item Rows */}
        <div className="space-y-3">
          {displayedItems.map((item, idx) => {
            const isCritical = item.urgencyLevel === 'CRITICAL';
            const isHigh = item.urgencyLevel === 'HIGH_RISK';
            const isApplied = appliedItems[item.id];
            
            const badgeText = isCritical ? '12h Left' : isHigh ? '24h Left' : item.expiryHours > 48 ? 'Stable' : '48h Left';
            const nerdBadgeText = isCritical ? 'Critical' : isHigh ? 'High Risk' : item.expiryHours > 48 ? 'Overstocked' : 'Moderate';
            
            const badgeClass = isCritical 
              ? 'bg-[#ffdcc3]/70 text-[#c76c00] border-[#c76c00]/40' 
              : isHigh 
                ? 'bg-[#f5f5f5] text-[#1c1b1b] border-[#c8c7bf]' 
                : 'bg-white text-[#777771] border-[#e5e2e1]';
            
            const progressColor = isCritical ? '#c76c00' : isHigh ? '#1c1b1b' : '#777771';
            const progressBg = isCritical ? '#ffdcc3' : '#e5e2e1';
            const progressPercent = isCritical ? 90 : isHigh ? 68 : item.expiryHours > 48 ? 20 : 45;

            // Organic subtle corner radius for individual item card
            const itemBoxRadius = `${11 + (idx % 2)}px ${14 - (idx % 2)}px ${12 + (idx % 3)}px ${10 + (idx % 2)}px`;

            return (
              <div 
                key={item.id} 
                className="border-b border-[#e5e2e1]/70 pb-2.5 last:border-b-0 last:pb-0 transition-opacity duration-200"
              >
                {/* Item Title, Stock and Risk Chip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-[#1c1b1b] font-space flex items-center gap-1.5">
                      {item.item}
                    </span>
                    <span className="text-xs text-[#777771]">({item.quantityKg} kg in stock)</span>
                  </div>
                  <span 
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass} transition-transform`}
                    style={{ borderRadius: '4px 6px 5px 5px' }}
                  >
                    {isNerdMode ? nerdBadgeText : badgeText}
                  </span>
                </div>

                {/* Subtitle / Expiry Location */}
                <div className="text-xs text-[#777771] mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#777771]" />
                  <span>
                    {isNerdMode 
                      ? `Expires in ${item.expiryHours} hours • ${item.category}`
                      : `Expires in ${item.expiryHours} hours • Prep first`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div 
                  className="w-full h-1.5 rounded-full overflow-hidden mt-1.5"
                  style={{ backgroundColor: progressBg }}
                >
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
                  />
                </div>

                {/* Suggestion box with organic, imperfect edges */}
                <div 
                  className={`mt-1.5 text-xs text-[#474741] flex items-center justify-between px-3 py-1.5 border transition-all ${
                    isApplied 
                      ? 'bg-emerald-50/80 border-emerald-300/80 text-emerald-800' 
                      : 'bg-[#faf8f6] border-[#e8e4e1]'
                  }`}
                  style={{ borderRadius: itemBoxRadius }}
                >
                  <span className="truncate pr-2" title={item.actionText}>
                    <strong>Action:</strong> {isApplied ? `Scheduled: ${item.actionText}` : item.actionText}
                  </span>
                  <button 
                    onClick={() => handleApply(item.id, item.actionText)}
                    disabled={isApplied}
                    className={`text-[10px] font-bold px-2 py-0.5 border uppercase shrink-0 cursor-pointer transition-all ${
                      isApplied 
                        ? 'bg-emerald-600 text-white border-emerald-600 cursor-default flex items-center gap-1' 
                        : 'bg-white text-[#1c1b1b] border-[#d8d4cf] hover:bg-neutral-100 hover:border-[#1c1b1b]'
                    }`}
                    style={{ borderRadius: '6px 8px 7px 9px' }}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3 h-3" /> Queued
                      </>
                    ) : (
                      isNerdMode ? "Apply" : "Cook Now"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Toggle for Overstocked Dry Stores (5th item) */}
        {!showAllItems && INVENTORY_AT_RISK.length > urgentPerishables.length && (
          <button
            onClick={() => setShowAllItems(true)}
            className="w-full mt-2.5 py-1 text-[11px] font-mono text-[#777771] hover:text-[#1c1b1b] flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <span>+1 stable overstock item in dry storage (Toor Dal 42kg)</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        )}

        {showAllItems && (
          <button
            onClick={() => setShowAllItems(false)}
            className="w-full mt-2.5 py-1 text-[11px] font-mono text-[#777771] hover:text-[#1c1b1b] flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <span>Show only urgent &lt; 48h perishables</span>
            <ChevronUp className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Handcrafted Bottom Chef's Dispatch Note & Batch Trigger - Eliminates Dead Space */}
      <div 
        className="mt-3.5 pt-3 border-t border-[#e5e2e1]/80 flex items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span 
            className={`w-2 h-2 rounded-full shrink-0 ${
              batchDispatched ? 'bg-emerald-500' : 'bg-[#c76c00] animate-pulse'
            }`} 
          />
          <p className="text-[11px] text-[#474741] leading-tight truncate">
            {batchDispatched ? (
              <span className="text-emerald-700 font-medium">All perishables dispatched to station cooks</span>
            ) : (
              <>
                <strong className="text-[#1c1b1b] font-space">Chef's Queue:</strong> 4 perishables routed to shift cooks.
              </>
            )}
          </p>
        </div>
        <button
          onClick={handleDispatchAll}
          disabled={batchDispatched}
          className={`text-[10px] font-mono font-bold px-3 py-1.5 transition-all uppercase shrink-0 cursor-pointer shadow-xs active:scale-95 ${
            batchDispatched 
              ? 'bg-emerald-600 text-white cursor-default' 
              : 'text-white bg-[#1c1b1b] hover:bg-[#c76c00]'
          }`}
          style={{ borderRadius: '7px 9px 8px 10px' }}
        >
          {batchDispatched ? "All Dispatched" : (isNerdMode ? "Batch Dispatch" : "Cook All")}
        </button>
      </div>
    </div>
  );
}
