# Frontend System Architecture & Domain Context

## 1. System Domain
The **Smart Canteen Waste Analytics Platform** is a production micro-level operational system designed for high-density institutional dining facilities, educational cafeterias, and governmental dining complexes across **Andhra Pradesh** (focusing on the **Amaravati**, **Guntur**, and **Vijayawada** clusters).

Its primary objective is reducing unnecessary kitchen preparation, eliminating food wastage, avoiding landfill-induced greenhouse gas ($CO_2e$) emissions, and protecting kitchen operating margins using machine-learning-driven demand forecasts and stochastic Newsvendor safety buffers.

---

## 2. Component & Folder Hierarchy

```
frontend/
├── src/
│   ├── assets/               # Static icons and branding media
│   ├── components/
│   │   ├── layout/
│   │   │   ├── NavigationRail.jsx   # Floating white pill sidebar with RBAC avatar popover
│   │   │   └── Header.jsx           # Top contextual banner, weather alert, & time filters
│   │   ├── analytics/
│   │   │   ├── ExecutiveKpiStrip.jsx   # Hero impact strip & 4 core metric tiles
│   │   │   ├── ApRegionalMap.jsx       # Vector SVG map of AP & taste comparison showdown
│   │   │   ├── WasteDonutAndSplit.jsx  # Category waste donut & bi-color consumption bars
│   │   │   └── ShiftEfficiencyChart.jsx # 4-shift operational stacked bar chart
│   │   └── operations/
│   │       ├── BatchCookPlanTable.jsx  # Micro-level kitchen floor batch preparation table
│   │       └── InventoryAtRisk.jsx     # Perishable urgency shelf-life radar
│   ├── context/
│   │   └── DashboardContext.jsx     # RBAC global state provider & district synchronization
│   ├── data/
│   │   └── mockCanteenData.js       # Statistical simulation engine & AP culinary datasets
│   ├── pages/
│   │   └── Dashboard.jsx            # Composite micro-analytics dashboard view
│   ├── App.jsx                      # App root with provider wrapping & routing
│   ├── index.css                    # Tailwind v4 theme, Google Stitch tokens, & animations
│   └── main.jsx                     # Vite entry point
├── context.md                       # Architectural domain documentation
├── rules.md                         # Engineering hygiene & design governance rules
└── package.json
```

---

## 3. Feature Schema & Mathematical Models

### A. The 14 Schema Domain Attributes
Derived from `ml_service/schemas.py` and `canteen_demand_synthetic_data_final.csv`:
1. **Calendar Features:**
   - `day_of_week`: Integer index ($0 = \text{Monday}, \dots, 6 = \text{Sunday}$).
   - `is_holiday`: Binary flag ($0$ or $1$) for national/state holidays.
   - `days_to_payday`: Days remaining until the monthly payroll disbursement.
   - `is_long_weekend`: Binary indicator ($0$ or $1$) for multi-day institutional closures.
2. **Weather Features:**
   - `precipitation_mm`: Local precipitation volume in millimeters.
   - `temp_max_c`: Maximum daily temperature in Celsius.
   - `weather_severity_alert`: Binary alert ($0$ or $1$) triggering indoor dining surges.
3. **Institutional & Cultural Features:**
   - `department_meeting_flag`: Influx flag ($0$ or $1$) for planned administrative gatherings.
   - `macro_dietary_period`: Categorical calendar string (`None`, `Kartika_Masam`, `Shravana_Masam`, `Navratri`, `Ramadan`).
   - `recurring_meatless_day`: Binary indicator ($0$ or $1$) for fasting days (e.g., Tuesday/Saturday non-veg abstention).
   - `special_menu_flag`: Binary flag ($0$ or $1$) denoting curated specialty dishes.
4. **Time-Series Lag & Rolling Statistics:**
   - `demand_lag_1`: Demand observed 1 day prior.
   - `demand_lag_7`: Demand observed exactly 7 days prior.
   - `rolling_mean_7d`: 7-day rolling moving average of portions consumed.
   - `rolling_std_7d`: 7-day rolling standard deviation measuring demand volatility.

### B. Rotating Menu Continuity Rule
To preserve valid continuous time-series properties without missing-data distortions, dishes not prepared on a specific date explicitly preserve `is_on_menu = 0` with a 0-portion target demand, ensuring models accurately differentiate between zero preparation and zero customer demand.

### C. Stochastic Newsvendor Safety Buffer Formulation
1. **Critical Ratio ($CR$):**
   $$CR = \frac{\text{shortage\_penalty}}{\text{cost\_per\_portion} + \text{shortage\_penalty}}$$
2. **Inverse Normal CDF ($Z$):**
   Computed via the Abramowitz & Stegun rational approximation (Formula 26.2.23):
   $$Z = \Phi^{-1}(CR)$$
3. **Dynamic Buffer:**
   $$\text{Buffer} = \max\left(0, \text{round}\left(Z \times \text{rolling\_std\_7d} \times \text{multiplier}\right)\right)$$
4. **Optimal Batch Cook Quantity:**
   $$\text{optimal\_cook\_qty} = \text{forecasted\_demand} + \text{Buffer}$$

### D. Dual-Unit Batch Conversions
Kitchen staff operate in physical vessels rather than abstract portion counts:
$$\text{Total Prepared Mass (kg)} = \text{optimal\_cook\_qty} \times \text{portion\_kg}$$
$$\text{Batches Required} = \left\lceil \frac{\text{optimal\_cook\_qty}}{\text{portions\_per\_batch}} \right\rceil$$
*Examples:*
- **Biryani / Pulao:** 50 portions per Handi ($17.5\text{ kg}$ per Handi @ $0.35\text{ kg/portion}$).
- **Idli / Tiffins:** 60 portions per Steamer Rack ($8.4\text{ kg}$ per Rack @ $0.14\text{ kg/portion}$).

---

## 4. Role-Based Access Control (RBAC) Matrix

| Operational Capability | `ADMIN` (AP Regional Head) | `OUTLET_MANAGER` (Kitchen Floor) |
| :--- | :--- | :--- |
| **District Scope** | Global access across Amaravati, Guntur, Vijayawada | Permanently locked to assigned branch |
| **AP Regional Map & Telemetry** | Full interactive SVG vector drilldown | Hidden (Bypassed to reduce noise) |
| **Cross-District Taste Showdown** | Visible (Comparative benchmarking) | Hidden (Focuses on kitchen floor tasks) |
| **Batch Cook Plan & Sliders** | Full override & observation | Full execution & kitchen slip printing |
| **Shelf-Life Radar & Actions** | Regional inventory rebalancing | Local culinary conversion (e.g., batter $\to$ Punugulu) |
| **Shift Waste Analysis** | Multi-branch cross-audit | Single-branch shift leakage mitigation |

---

## 5. Backend Migration Guidelines

To transition `mockCanteenData.js` to live FastAPI/Express backend services:
1. **REST Endpoints:**
   - `GET /api/v1/districts/{districtId}/kpis` $\to$ Replaces `DISTRICT_METADATA`.
   - `GET /api/v1/districts/{districtId}/cook-plan?date=YYYY-MM-DD` $\to$ Ingests live XGBoost inferences.
   - `GET /api/v1/inventory/perishables?district={districtId}` $\to$ Integrates with IoT smart scales / pantry tags.
   - `POST /api/v1/operations/cook-target-override` $\to$ Dispatches thermal printer kitchen prep slips.
2. **WebSocket Integration:**
   - Connect `useDashboard` to `ws://api/v1/kitchen-floor/{districtId}` for real-time scale weigh-in events and shift leftover updates.
