// frontend/src/pages/Dashboard.jsx
import React from 'react';
import ExecutiveKpiStrip from '../components/analytics/ExecutiveKpiStrip';
import WasteDonutAndSplit from '../components/analytics/WasteDonutAndSplit';
import InventoryAtRisk from '../components/operations/InventoryAtRisk';
import MealPerformanceAndDemand from '../components/analytics/MealPerformanceAndDemand';
import PlateVsPrepTelemetry from '../components/analytics/PlateVsPrepTelemetry';
import DemandForecastHorizon from '../components/analytics/DemandForecastHorizon';
import ImpactSummary from '../components/analytics/ImpactSummary';
import BatchCookPlanTable from '../components/operations/BatchCookPlanTable';
import ApRegionalMap from '../components/analytics/ApRegionalMap';
import ShiftEfficiencyChart from '../components/analytics/ShiftEfficiencyChart';

export default function Dashboard() {

  return (
    <div className="w-full space-y-10 min-w-0 pb-12">
      {/* 1. Today's Executive Summary & 4 KPI Cards */}
      <ExecutiveKpiStrip />

      {/* 2. Row 2: Asymmetrical 7:5 Grid (Donut 7 cols, Inventory at Risk 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0 items-stretch">
        <div className="lg:col-span-7 min-w-0">
          <WasteDonutAndSplit />
        </div>
        <div className="lg:col-span-5 min-w-0">
          <InventoryAtRisk />
        </div>
      </div>

      {/* 3. Row 3: Inverted Asymmetrical 5:7 Grid (Meal Performance 5 cols, Demand 7 cols) */}
      <MealPerformanceAndDemand />

      {/* 4. Row 4: Plate Waste vs. Kitchen Overproduction Root-Cause Telemetry */}
      <div className="pt-2 border-t border-[#e5e2e1]/80">
        <PlateVsPrepTelemetry />
      </div>

      {/* 5. Row 5: 7-Day Actual vs. XGBoost Forecast & Newsvendor Buffer Horizon */}
      <div className="pt-2 border-t border-[#e5e2e1]/80">
        <DemandForecastHorizon />
      </div>

      {/* 6. Deep Dive Kitchen Floor: Tomorrow's Batch Cook Plan */}
      <div className="pt-2 border-t border-[#e5e2e1]/80">
        <BatchCookPlanTable />
      </div>

      {/* 7. Regional Operations Map & Taste Showdown (Krishna-Guntur Belt) */}
      <div className="pt-2 border-t border-[#e5e2e1]/80">
        <ApRegionalMap />
      </div>

      {/* 8. Operational Meal Shifts Breakdown */}
      <div className="pt-2 border-t border-[#e5e2e1]/80">
        <ShiftEfficiencyChart />
      </div>

      {/* 9. Impact Section (Alternating Cards) */}
      <div className="pt-2 border-t border-[#e5e2e1]/80">
        <ImpactSummary />
      </div>
    </div>
  );
}

