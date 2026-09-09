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
