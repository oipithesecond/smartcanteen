// frontend/src/components/operations/BatchCookPlanTable.jsx
import React, { useState } from 'react';
import { 
  Utensils, 
  Search, 
  Sliders,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const MEAL_SLOTS = [
  { id: 'all', label: 'All Day' },
  { id: 'breakfast', label: 'Breakfast (Tiffins)' },
  { id: 'lunch', label: 'Lunch (Mains)' },
  { id: 'snacks', label: 'Snacks (Chai & Bajjis)' },
  { id: 'dinner', label: 'Dinner (Light & Biryani)' },
];

const CATEGORIES = [
  { id: 'All', label: 'All Food' },
  { id: 'Breakfast_Tiffins', label: 'Tiffins' },
  { id: 'Staples_Rice', label: 'Rice / Staples' },
  { id: 'Veg_Mains', label: 'Veg Mains' },
  { id: 'Non_Veg_Mains', label: 'Non-Veg Mains' },
  { id: 'Snacks_Evening', label: 'Snacks' }
];

export default function BatchCookPlanTable() {
  const { 
    batchCookPlan, 
    bufferMultiplier, 
    setBufferMultiplier,
    activeMealSlot,
    setActiveMealSlot,
    activeCategory,
    setActiveCategory
  } = useDashboard();

  const [searchTerm, setSearchTerm] = useState('');
  const [unitMode, setUnitMode] = useState('both'); // 'portions', 'kg', 'both'

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
    <section id="batch-plan" className="bg-white border border-[#e5e2e1] rounded-3xl p-6 md:p-8 shadow-[2px_12px_32px_rgba(28,27,27,0.04),0_1px_3px_rgba(28,27,27,0.02)]">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase">
            OPERATIONAL PREPARATION SCHEDULE
          </div>
          <h2 className="text-xl font-semibold text-[#1c1b1b] mt-0.5 font-space">
            Tomorrow's Batch Cook Plan
          </h2>
          <p className="text-xs text-[#777771] mt-1">
            Machine-calculated prep volume using XGBoost baseline demand & Newsvendor stochastic safety buffers.
          </p>
        </div>

        {/* Dynamic Newsvendor Buffer Slider Controls */}
        <div className="flex items-center gap-3 bg-[#fdf8f7] p-2.5 rounded-2xl border border-[#e5e2e1]">
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
          <span className="text-[10px] text-[#777771] font-medium">
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
                className={`px-3 py-1.5 text-xs rounded-xl transition-all font-space ${
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
          {/* Dual Unit Mode Switcher */}
          <div className="flex items-center bg-[#f7f3f2] p-0.5 rounded-xl border border-[#e5e2e1] text-[11px] font-space">
            <button
              onClick={() => setUnitMode('both')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${unitMode === 'both' ? 'bg-[#1c1b1b] text-white font-bold' : 'text-[#777771]'}`}
            >
              Dual (kg + portions)
            </button>
            <button
              onClick={() => setUnitMode('portions')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${unitMode === 'portions' ? 'bg-[#1c1b1b] text-white font-bold' : 'text-[#777771]'}`}
            >
              Portions
            </button>
            <button
              onClick={() => setUnitMode('kg')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${unitMode === 'kg' ? 'bg-[#1c1b1b] text-white font-bold' : 'text-[#777771]'}`}
            >
              Kg
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777771]" />
            <input
              type="text"
              placeholder="Search dish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#e5e2e1] bg-white text-[#1c1b1b] focus:outline-none focus:border-[#1c1b1b] w-36 sm:w-44"
            />
          </div>
        </div>
      </div>

      {/* Aggregate Header Chips */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 bg-[#fdf8f7] rounded-2xl border border-[#e5e2e1] mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[#777771]">Total Items:</span>
          <strong className="font-space text-[#1c1b1b]">{filteredItems.length}</strong>
        </div>
        <div className="h-3 w-[1px] bg-[#e5e2e1]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[#777771]">Total Target Volume:</span>
          <strong className="font-space text-[#1c1b1b]">{totalOptimalPortions.toLocaleString()} portions</strong>
          <span className="text-[#777771]">({totalOptimalKg} kg)</span>
        </div>
        <div className="h-3 w-[1px] bg-[#e5e2e1]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[#777771]">Recommended Batches:</span>
          <strong className="font-space text-[#1c1b1b]">{totalBatches} batches</strong>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-[#e5e2e1]">
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
                <tr key={item.id} className="hover:bg-[#fdf8f7] transition-colors">
                  {/* Dish Name */}
                  <td className="py-3 px-3 font-medium text-[#1c1b1b]">
                    <div className="font-semibold text-xs font-space">{item.itemName}</div>
                    <span className="text-[10px] text-[#777771] uppercase tracking-wider">{item.category.replace('_', ' ')}</span>
                  </td>

                  {/* Shift */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#f1edec] text-[#474741]">
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
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold font-space bg-[#d0e5d2] text-[#0e1f13]">
                      +{item.safetyBufferPortions} portions
                    </div>
                    <div className="text-[10px] text-[#777771] mt-0.5">+{(item.safetyBufferPortions * item.portionKg).toFixed(1)} kg buffer</div>
                  </td>

                  {/* Optimal Cook Target */}
                  <td className="py-3 px-3">
                    <div className="text-sm font-bold font-space text-[#1c1b1b]">
                      {item.optimalCookPortions} portions
                    </div>
                    <div className="text-[11px] font-semibold text-[#506354]">
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
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#f1edec] text-[#474741] font-medium inline-block">
                      {item.shifterReason || 'Standard Trend'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
