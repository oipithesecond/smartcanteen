// frontend/src/components/operations/BatchCookPlanTable.jsx
import React, { useState } from 'react';
import { 
  Utensils, 
  Search, 
  Sliders,
  HelpCircle,
  Clock,
  Check,
  ChefHat
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const MEAL_SLOTS = [
  { id: 'all', label: 'All Day' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'dinner', label: 'Dinner' },
];

export default function BatchCookPlanTable() {
  const { 
    batchCookPlan, 
    bufferMultiplier, 
    setBufferMultiplier,
    activeMealSlot,
    setActiveMealSlot,
    activeCategory,
    setActiveCategory,
    isModelLoading,
    modelMeta,
    isLiveModel,
    isNerdMode
  } = useDashboard();

  const [searchTerm, setSearchTerm] = useState('');
  const [unitMode, setUnitMode] = useState('both'); // 'portions', 'kg', 'both'
  const [cookStatus, setCookStatus] = useState({}); // itemId -> 'todo' | 'cooking' | 'ready'

  // Interactive stove status toggle for kitchen floor staff
  const toggleCookStatus = (itemId) => {
    setCookStatus((prev) => {
      const current = prev[itemId] || 'todo';
      const next = current === 'todo' ? 'cooking' : current === 'cooking' ? 'ready' : 'todo';
      return { ...prev, [itemId]: next };
    });
  };

  // Filter items
  const filteredItems = (batchCookPlan || []).filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSlot = activeMealSlot === 'all' || item.mealSlot === activeMealSlot;
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesSlot && matchesCategory;
  });

  // Aggregated totals
  const totalOptimalPortions = filteredItems.reduce((acc, item) => acc + (item.optimalCookPortions || 0), 0);
  const totalOptimalKg = filteredItems.reduce((acc, item) => acc + (item.optimalCookKg || 0), 0).toFixed(1);
  const totalBatches = filteredItems.reduce((acc, item) => acc + (item.batchesRequired || 0), 0);

  return (
    <section id="batch-plan" className="bg-white border border-[#e5e2e1] rounded-3xl p-6 md:p-8 shadow-[2px_12px_32px_rgba(28,27,27,0.04),0_1px_3px_rgba(28,27,27,0.02)] scroll-mt-24">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase">
            OPERATIONAL PREPARATION SCHEDULE
          </div>
          <h2 className="text-xl font-semibold text-[#1c1b1b] mt-0.5 font-space">
            {isNerdMode ? "Tomorrow's Batch Cook Plan" : "Kitchen Prep Schedule (Tomorrow)"}
          </h2>
          <p className="text-xs text-[#777771] mt-1">
            {isNerdMode
              ? "Machine-calculated prep volume using XGBoost baseline demand & Newsvendor stochastic safety buffers."
              : "Calculated preparation volumes and cauldron batch counts for each menu item."}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-neutral-300 bg-neutral-100 text-[#1c1b1b]">
              <span className={`w-1.5 h-1.5 rounded-full bg-[#1c1b1b]`} />
              {isLiveModel ? `Live XGBoost (RMSE: ${modelMeta?.modelRmse || 14.26})` : 'Offline Baseline Active'}
            </span>
            {modelMeta?.weather && (
              <span className="text-[11px] text-[#777771] font-mono bg-[#f7f3f2] px-2 py-0.5 rounded-md border border-[#e5e2e1]">
                Weather: {modelMeta.weather.tempMaxC}°C • {modelMeta.weather.precipitationMm}mm rain
              </span>
            )}
            {modelMeta?.macroPeriod && modelMeta.macroPeriod !== 'None' && (
              <span className="text-[11px] text-[#1c1b1b] font-mono bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-300">
                Period: {modelMeta.macroPeriod} Active
              </span>
            )}
            {isModelLoading && (
              <span className="text-[11px] text-[#1c1b1b] font-mono animate-pulse">
                Inferencing...
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Newsvendor Buffer Slider Controls */}
        <div className="flex items-center gap-3 bg-[#fcfaf9] p-2.5 rounded-2xl border border-[#e5e2e1] self-start lg:self-auto">
          <div className="flex items-center gap-2 text-xs">
            <Sliders className="w-3.5 h-3.5 text-[#777771]" />
            <span className="font-semibold text-[#1c1b1b] font-space">Safety Buffer:</span>
            <span className="font-space text-[#1c1b1b] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#e5e2e1]">
              {bufferMultiplier}x
            </span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.5"
            step="0.1"
            value={bufferMultiplier}
            onChange={(e) => setBufferMultiplier(parseFloat(e.target.value))}
            className="w-24 accent-[#1c1b1b] cursor-pointer h-1 bg-[#e5e2e1] rounded"
            title="Adjust Newsvendor safety margin multiplier"
          />
          <span className="text-[10px] font-mono text-[#777771]">
            {bufferMultiplier === 1.0 ? 'Optimal CR' : bufferMultiplier > 1.0 ? 'Buffer (+)' : 'Lean (-)'}
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        {/* Meal Slot Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {MEAL_SLOTS.map((slot) => {
            const isActive = activeMealSlot === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => setActiveMealSlot(slot.id)}
                className={`px-3 py-1.5 text-xs rounded-xl transition-all font-space cursor-pointer ${
                  isActive
                    ? 'bg-[#1c1b1b] text-white font-medium shadow-xs'
                    : 'bg-[#f7f3f2] text-[#474741] hover:bg-[#ebe7e6]'
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>

        {/* Search & Unit Controls */}
        <div className="flex items-center gap-2">
          {isNerdMode && (
            <div className="flex items-center bg-[#f7f3f2] p-0.5 rounded-xl border border-[#e5e2e1] text-[11px] font-space">
              <button
                onClick={() => setUnitMode('both')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${unitMode === 'both' ? 'bg-[#1c1b1b] text-white font-bold' : 'text-[#777771]'}`}
              >
                Dual
              </button>
              <button
                onClick={() => setUnitMode('portions')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${unitMode === 'portions' ? 'bg-[#1c1b1b] text-white font-bold' : 'text-[#777771]'}`}
              >
                Portions
              </button>
              <button
                onClick={() => setUnitMode('kg')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${unitMode === 'kg' ? 'bg-[#1c1b1b] text-white font-bold' : 'text-[#777771]'}`}
              >
                Kg
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777771]" />
            <input
              type="text"
              placeholder="Find dish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#e5e2e1] bg-white text-[#1c1b1b] focus:outline-none focus:border-[#1c1b1b] w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Aggregate Volume Ribbon (Monochrome) */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 bg-[#fcfaf9] rounded-2xl border border-[#e5e2e1] mb-5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[#777771]">Total Items:</span>
          <strong className="font-space text-[#1c1b1b] text-sm">{filteredItems.length}</strong>
        </div>
        <div className="h-3 w-[1px] bg-[#e5e2e1]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[#777771]">Target Volume:</span>
          <strong className="font-space text-[#1c1b1b] text-sm">{totalOptimalPortions.toLocaleString()} portions</strong>
          <span className="text-[#777771]">({totalOptimalKg} kg)</span>
        </div>
        <div className="h-3 w-[1px] bg-[#e5e2e1]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[#777771]">Batches to Cook:</span>
          <strong className="font-space text-[#1c1b1b] text-sm">{totalBatches} batches</strong>
        </div>
      </div>

      {/* Dual Layout: Floor Card Grid vs. Quantitative Table */}
      {!isNerdMode ? (
        /* SIMPLE / FLOOR VIEW: Clean Monochrome Tactile Cards */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[#777771] bg-[#fdf8f7] rounded-2xl border border-dashed border-[#e5e2e1]">
                <div className="font-semibold text-sm text-[#1c1b1b]">No dishes match this shift or search.</div>
                <div className="text-xs text-[#777771] mt-1">Select "All Day" above to view full menu.</div>
              </div>
            ) : (
              filteredItems.map((item) => {
                const status = cookStatus[item.id] || 'todo';

                return (
                  <div 
                    key={item.id}
                    className={`bg-white border rounded-2xl p-4 transition-all duration-200 shadow-xs hover:shadow-sm flex flex-col justify-between ${
                      status === 'ready'
                        ? 'border-[#1c1b1b] bg-neutral-50/60'
                        : status === 'cooking'
                        ? 'border-[#1c1b1b] bg-[#fcfaf9]'
                        : 'border-[#e5e2e1]'
                    }`}
                  >
                    <div>
                      {/* Top Row: Dish Name & Shift Tag */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-bold text-sm text-[#1c1b1b] font-space leading-snug">
                            {item.itemName}
                          </h3>
                          <span className="text-[11px] text-[#777771] uppercase tracking-wider font-mono">
                            {item.category.replace('_', ' ')}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#e5e2e1] bg-[#f7f3f2] text-[#1c1b1b] uppercase shrink-0">
                          {item.mealSlot}
                        </span>
                      </div>

                      {/* Big Volume Indicator */}
                      <div className="p-3 bg-[#fcfaf9] rounded-xl border border-[#e5e2e1] mb-3">
                        <div className="text-[10px] text-[#777771] uppercase tracking-wider font-mono font-semibold">
                          PREP TARGET:
                        </div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-bold font-space text-[#1c1b1b]">
                            {item.optimalCookPortions}
                          </span>
                          <span className="text-xs font-semibold text-[#777771]">
                            portions ({item.optimalCookKg} kg)
                          </span>
                        </div>
                      </div>

                      {/* Batches / Pots Cadence */}
                      <div className="flex items-center justify-between text-xs py-2 px-1 border-t border-dashed border-[#e5e2e1] mb-3">
                        <div className="font-medium text-[#1c1b1b]">
                          <strong>{item.batchesRequired}</strong> {item.batchUnit}s to prepare
                        </div>
                        <span className="text-[11px] font-mono text-[#777771]">
                          ~{item.portionsPerBatch}/batch
                        </span>
                      </div>
                    </div>

                    {/* Interactive Floor Cook Action Button (Monochrome) */}
                    <button
                      onClick={() => toggleCookStatus(item.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        status === 'ready'
                          ? 'bg-[#1c1b1b] text-white border border-[#1c1b1b]'
                          : status === 'cooking'
                          ? 'bg-neutral-200 text-[#1c1b1b] border border-neutral-400'
                          : 'bg-[#f7f3f2] text-[#474741] border border-[#e5e2e1] hover:bg-neutral-200'
                      }`}
                    >
                      {status === 'ready' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Ready in Warmer</span>
                        </>
                      ) : status === 'cooking' ? (
                        <span>Cooking in Progress...</span>
                      ) : (
                        <span>Mark as Cooking</span>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* NERD MODE: 8-Column Quantitative Engineering Table */
        <div className={`overflow-x-auto rounded-2xl border border-[#e5e2e1] transition-opacity duration-150 ${isModelLoading ? 'opacity-60' : 'opacity-100'}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f3f2] border-b border-[#e5e2e1] text-[#777771] font-space text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Dish / Menu Item</th>
                <th className="py-2.5 px-3 font-semibold">Shift</th>
                <th className="py-2.5 px-3 font-semibold">Baseline Demand</th>
                <th className="py-2.5 px-3 font-semibold">
                  <span className="inline-flex items-center gap-1" title="Critical Ratio = Shortage Penalty / (Cost + Shortage Penalty)">
                    CR & Z-Score <HelpCircle className="w-2.5 h-2.5" />
                  </span>
                </th>
                <th className="py-2.5 px-3 font-semibold">Dynamic Safety Buffer</th>
                <th className="py-2.5 px-3 font-semibold text-[#1c1b1b]">Optimal Cook Target</th>
                <th className="py-2.5 px-3 font-semibold">Batch Cadence</th>
                <th className="py-2.5 px-3 font-semibold">Driver Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e2e1] bg-white">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#777771]">
                    No menu items match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fcfaf9] transition-colors">
                    {/* Dish Name */}
                    <td className="py-3 px-3 font-medium text-[#1c1b1b]">
                      <div className="font-semibold text-xs font-space">{item.itemName}</div>
                      <span className="text-[10px] text-[#777771] uppercase tracking-wider font-mono">{item.category.replace('_', ' ')}</span>
                    </td>

                    {/* Shift */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-[#f1edec] text-[#474741]">
                        {item.mealSlot}
                      </span>
                    </td>

                    {/* Baseline Forecast */}
                    <td className="py-3 px-3 font-space text-[#474741]">
                      <div>{item.forecastedDemand} portions</div>
                      <div className="text-[10px] text-[#777771]">{(item.forecastedDemand * item.portionKg).toFixed(1)} kg</div>
                    </td>

                    {/* CR & Z Score */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[#777771]">
                      <div>CR: {item.criticalRatio}</div>
                      <div className="text-[10px]">Z: {item.zScore}σ</div>
                    </td>

                    {/* Dynamic Safety Buffer */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-neutral-100 text-[#1c1b1b] border border-neutral-300">
                        +{item.safetyBufferPortions} portions
                      </div>
                      <div className="text-[10px] text-[#777771] mt-0.5">+{(item.safetyBufferPortions * item.portionKg).toFixed(1)} kg buffer</div>
                    </td>

                    {/* Optimal Cook Target */}
                    <td className="py-3 px-3">
                      <div className="text-sm font-bold font-space text-[#1c1b1b]">
                        {item.optimalCookPortions} portions
                      </div>
                      <div className="text-[11px] font-semibold text-[#777771]">
                        {item.optimalCookKg} kg total
                      </div>
                    </td>

                    {/* Batch Cadence */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold font-space text-[#1c1b1b]">
                        <Clock className="w-3 h-3 text-[#777771]" />
                        <span>{item.batchesRequired}x {item.batchUnit}</span>
                      </div>
                      <div className="text-[10px] text-[#777771]">{item.portionsPerBatch} portions/batch</div>
                    </td>

                    {/* Driver Signal */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#f1edec] text-[#474741] font-medium inline-block font-mono">
                        {item.shifterReason || 'Standard Trend'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
