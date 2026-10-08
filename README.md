# Smart Canteen — Waste Management System

A data-driven food demand forecasting and waste reduction platform for institutional cafeterias and central dining operations. Powered by machine learning demand models, stochastic Newsvendor safety buffers, and a real-time operational dashboard.

---

## Quick Start (Local Frontend Build & Dev)

### 1. Run Local Development Server
To launch the React dashboard locally:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if first time)
npm install

# Start the Vite development server
npm run dev
```

Open your browser and navigate to:
**http://localhost:5173/**

### 2. Build for Production
To generate an optimized production bundle:

```bash
cd frontend
npm run build
```

The compiled assets will be placed in `frontend/dist/`.

### 3. Preview Production Build
To test the built production bundle locally:

```bash
cd frontend
npm run preview
```

---

## Full Stack Setup

### Backend (Node.js & Express)
The backend provides APIs for logging meals, tracking leftovers, and fetching weather data:

```bash
cd backend
npm install
npm start
```
Runs by default on port `5005`.

### ML Service (FastAPI & XGBoost)
The Python ML microservice provides predictive demand forecasting:

```bash
cd ml_service
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```
API docs available at **http://localhost:8000/docs**.

---

## Project Structure

```
smartcanteen/
├── frontend/                     # React 19 + Vite + Tailwind CSS Dashboard
│   ├── public/                   # Static assets (brand logo, favicons, CSV datasets)
│   │   ├── logo.png              # Full brand logo (transparent background)
│   │   ├── logo-icon.png         # Circular emblem mark (512x512)
│   │   ├── favicon.ico           # Multi-size browser favicon
│   │   └── favicon.png           # Modern PNG favicon
│   ├── src/
│   │   ├── components/           # UI components (analytics, operations, layout)
│   │   ├── context/              # Dashboard context & RBAC state
│   │   └── pages/                # Dashboard views
│   └── package.json
├── backend/                      # Express.js REST API & MongoDB models
│   ├── controllers/
│   ├── models/
│   └── server.js
├── ml_service/                   # FastAPI demand prediction service
│   ├── main.py
│   └── schemas.py
├── canteen_xgboost_model.json    # Trained XGBoost model artifact
├── newsvendoroptimization.py     # Newsvendor buffer algorithm
├── xgboosttraining.py            # Model training pipeline
└── README.md
```

---

## Key Features

- **Waste Analytics & Telemetry**: Real-time breakdown of plate waste vs. preparation overproduction.
- **Smart Batch Cook Scheduling**: Dynamic meal prep schedules driven by ML attendance and demand forecasts.
- **Inventory at Risk**: Real-time shelf-life tracking to prevent ingredient spoilage before batch cooking.
- **Role-Based Views**: Instant toggle between Regional Operations Admin and Kitchen Floor Chef personas.
- **Branded Experience**: Crisp vector and transparent brand marks across all viewports, docks, and favicons.

---

## Analytics Dashboard — Graph Reference

All graphs live in `frontend/src/components/analytics/`. Together they form a closed-loop waste-reduction intelligence layer: **predict → prepare → observe → learn**.

| # | Graph / Component | What It Shows | How It Reduces Waste | Variables That Drive It |
|---|---|---|---|---|
| 1 | **Executive KPI Strip** `ExecutiveKpiStrip.jsx` | Four headline numbers: Plates Served, Food Prepared (kg), Food Consumed (kg), Waste Rate (%) | Daily health-check — a growing prep-vs-consumed gap is the first alarm | `todayMeals`, `foodPreparedKg`, `foodConsumedKg`, `wasteRate`, `wasteRateTrend`, `mealsTrendPct` |
| 2 | **Demand Forecast Horizon** `DemandForecastHorizon.jsx` | 7-day composed chart: actual diner count (solid line), XGBoost baseline prediction (dashed line), Newsvendor safety buffer zone (shaded area) | **Core engine** — the buffer prevents both over-cooking (direct waste) and under-cooking (stockouts). Tighter tracking = less waste | `actual` demand, `predicted` (XGBoost), `optimalBuffer` (Newsvendor), `weather`, model RMSE (14.26), `selectedDistrict`, `modelMeta.modelRmse` |
| 3 | **Waste Donut & Category Split** `WasteDonutAndSplit.jsx` | Donut showing which food category (Rice, Curries, Breads…) contributes what % of total waste by kg and cost, plus top 3 most-wasted individual dishes | Tells the kitchen *what* to reduce — e.g. rice = 42% of waste → cut rice batch first. Per-dish ranking shows exact portion-size cuts needed | `CATEGORY_WASTE_DATA` (category, kg/day, cost/day, %), `CONSUMPTION_VS_TRASH` per district (`trashedKg`, `trashedPortions`, `costLost`), `selectedDistrict` |
| 4 | **Plate Waste vs. Kitchen Overproduction** `PlateVsPrepTelemetry.jsx` | Bi-colour bar splitting total waste into two root causes: food left in kitchen pots (overproduction) vs. food left on customer plates (portion sizing), broken down per meal service | Directs the *right* intervention — pot waste → reduce batch size; plate waste → reduce scoop size. Without this split you can't know which lever to pull | `totalWasteKg`, `prepWasteKg`, `prepWasteCost`, `plateWasteKg`, `plateWasteCost`, per-service `prepKg`, `plateKg`, `prepPct`, `platePct`, `driver`, `chefObservation`, `selectedDistrict` |
| 5 | **Shift Efficiency Chart** `ShiftEfficiencyChart.jsx` | Stacked bar across 4 services (Breakfast / Lunch / Snacks / Dinner) showing consumed kg vs. wasted kg, with an efficiency % badge. Auto-flags the worst shift as "Waste Hotspot" | Shows *when* during the day waste spikes so only that service's batch is scaled back, not the whole day | `consumedKg`, `wastedKg`, `preparedKg`, `efficiencyPct` per shift; efficiency threshold 85% flags a problematic shift; `selectedDistrict` |
| 6 | **Meal Performance & Tomorrow's Demand** `MealPerformanceAndDemand.jsx` | Left panel: dishes ranked by waste-rate %, flagging "Eaten Clean" vs. "High Scrap". Right panel: tomorrow's forecasted serving targets broken down by meal slot (Breakfast / Lunch / Snacks / Dinner) | Waste-rate ranking guides menu decisions (drop or resize high-scrap dishes). Tomorrow's targets translate the ML forecast into concrete cook quantities per service | `eatenKg`, `trashedKg` per dish (compute `wasteRate`), `batchCookPlan` filtered by `mealSlot`, `optimalCookPortions`, `forecastedDemand`, `selectedDistrict`, `isNerdMode` |
| 7 | **AP Regional Map & Cross-District Comparison** `ApRegionalMap.jsx` | SVG map of the Krishna-Guntur belt with colour-coded district nodes (green < 8% / amber 8–15% / red > 15% waste), plus a grouped bar chart comparing consumed vs. wasted kg across branches | Lets admins spot which branches have critical waste rates and benchmark low-waste branches against high-waste ones. Admin-only view | `DISTRICT_METADATA` (`wasteRate`, `wasteSeverity`, `coordinates`, `fullName`), `TASTE_SHOWDOWN_DATA` (`district`, `consumedKg`, `wastedKg`), `selectedDistrict`, `isAdmin` |
| 8 | **Impact Summary** `ImpactSummary.jsx` | Three cumulative month-end KPI cards: Food Waste Prevented (kg), Cost Saved (₹), CO₂ Emissions Avoided (tons) | The motivational scoreboard — proves the system is working and shows leadership the tangible financial and environmental ROI of ML-driven operations | `wastePreventedKg`, `estimatedCostSaved`, `estimatedCo2AvoidedTons`, `mealsTrendPct` from `currentDistrictMeta` |

> **Core insight:** Graph 2 (Demand Forecast) is the engine — everything else measures, diagnoses, and validates what that ML prediction drives in the kitchen.
