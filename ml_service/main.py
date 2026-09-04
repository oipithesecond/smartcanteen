from fastapi import FastAPI, HTTPException
import xgboost as xgb
import pandas as pd
import numpy as np
from scipy.stats import norm
import os
from schemas import PredictionRequest, PredictionResponse

app = FastAPI(title="Canteen Demand ML Microservice")

# Global variables to hold model and RMSE
model = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'canteen_xgboost_model.json')
RMSE_ESTIMATE = 14.26  # From our test set evaluation

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = xgb.XGBRegressor()
        model.load_model(MODEL_PATH)
        print(f"Model loaded successfully from {MODEL_PATH}")
    else:
        print(f"Warning: Model not found at {MODEL_PATH}")

def calculate_optimal_quantity(pred, cost, penalty, rmse_val):
    if pred <= 0: return 0
    z = norm.ppf(penalty / (cost + penalty))
    return max(0, int(round(pred + (z * rmse_val))))

@app.post("/predict", response_model=PredictionResponse)
def predict_demand(req: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
        
    # Prepare data for XGBoost (must match training exactly)
    # The training script used enable_categorical=True, so we need to pass a DataFrame with categorical dtypes
    input_data = {
        'item_name': req.item_name,
        'category': req.category,
        'day_of_week': req.day_of_week,
        'is_holiday': req.is_holiday,
        'days_to_payday': req.days_to_payday,
        'is_long_weekend': req.is_long_weekend,
        'precipitation_mm': req.precipitation_mm,
        'temp_max_c': req.temp_max_c,
        'weather_severity_alert': req.weather_severity_alert,
        'department_meeting_flag': req.department_meeting_flag,
        'leave_rate_percentage': req.leave_rate_percentage,
        'macro_dietary_period': req.macro_dietary_period,
        'recurring_meatless_day': req.recurring_meatless_day,
        'special_menu_flag': req.special_menu_flag,
        'demand_lag_1': req.demand_lag_1,
        'demand_lag_7': req.demand_lag_7,
        'rolling_mean_7d': req.rolling_mean_7d,
        'rolling_std_7d': req.rolling_std_7d
    }
    
    df = pd.DataFrame([input_data])
    
    # Convert text columns to pandas categorical types for XGBoost
    categorical_features = ['item_name', 'category', 'macro_dietary_period']
    for col in categorical_features:
        df[col] = df[col].astype('category')
        
    # Predict raw demand
    raw_pred = model.predict(df)[0]
    predicted_demand = int(max(0, raw_pred))
    
    # Run Phase 4 Newsvendor Optimization
    optimal_qty = calculate_optimal_quantity(
        pred=predicted_demand,
        cost=req.cost_per_portion,
        penalty=req.shortage_penalty,
        rmse_val=RMSE_ESTIMATE
    )
    
    return PredictionResponse(
        item_name=req.item_name,
        predicted_demand=predicted_demand,
        optimal_cook_qty=optimal_qty,
        rmse_used=RMSE_ESTIMATE
    )
