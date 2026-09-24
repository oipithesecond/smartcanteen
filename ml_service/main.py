from fastapi import FastAPI, HTTPException
import xgboost as xgb
import pandas as pd
import numpy as np
from scipy.stats import norm
import os
from schemas import (
    PredictionRequest, 
    PredictionResponse,
    BatchPredictionRequest, 
    BatchPredictionResponse, 
    BatchPredictionItemResponse
)

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

def calculate_optimal_quantity(pred, cost, penalty, rmse_val, buffer_multiplier=1.0):
    if pred <= 0: return 0, 0.5, 0.0, 0
    cr = penalty / (cost + penalty)
    z = norm.ppf(cr)
    safety_buffer = int(round(z * rmse_val * buffer_multiplier))
    optimal = max(0, int(round(pred + safety_buffer)))
    return optimal, round(float(cr), 3), round(float(z), 2), max(0, safety_buffer)

TRAINED_CATEGORIES = {
    'item_name': ['Chicken Dum Biryani', 'Chole Soya Chunks Curry', 'Egg Bhurji', 'Masala Fish Fry', 'Mudda Pappu', 'Paneer Butter Masala', 'Pulka', 'White Rice'],
    'category': ['Non_Veg_Mains', 'Staples', 'Veg_Mains'],
    'macro_dietary_period': ['0', 'Navratri', 'Ramadan', 'Shravan']
}
ITEM_CAT_DTYPE = pd.CategoricalDtype(categories=TRAINED_CATEGORIES['item_name'])
CATEGORY_CAT_DTYPE = pd.CategoricalDtype(categories=TRAINED_CATEGORIES['category'])
MACRO_CAT_DTYPE = pd.CategoricalDtype(categories=TRAINED_CATEGORIES['macro_dietary_period'])

def clean_record_for_model(rec: dict) -> dict:
    rec = dict(rec)
    macro = str(rec.get('macro_dietary_period', '0') or '0').strip()
    if macro in ('None', 'none', '', '0', 'null', 'undefined'):
        rec['macro_dietary_period'] = '0'
    elif macro in TRAINED_CATEGORIES['macro_dietary_period']:
        rec['macro_dietary_period'] = macro
    else:
        rec['macro_dietary_period'] = '0'
        
    cat = str(rec.get('category', 'Veg_Mains') or 'Veg_Mains').strip()
    if cat in TRAINED_CATEGORIES['category']:
        rec['category'] = cat
    elif any(k in cat.lower() for k in ['non_veg', 'chicken', 'meat', 'fish', 'egg', 'mutton', 'prawn']):
        rec['category'] = 'Non_Veg_Mains'
    elif any(k in cat.lower() for k in ['staple', 'rice', 'roti', 'pulka', 'bread', 'tiffin', 'breakfast']):
        rec['category'] = 'Staples'
    else:
        rec['category'] = 'Veg_Mains'
        
    name = str(rec.get('item_name', '') or '').strip()
    if name not in TRAINED_CATEGORIES['item_name']:
        matched = None
        for trained in TRAINED_CATEGORIES['item_name']:
            if trained.lower() in name.lower() or name.lower() in trained.lower():
                matched = trained
                break
        rec['item_name'] = matched if matched else None
    return rec

def prepare_dataframe(records: list) -> pd.DataFrame:
    cleaned = [clean_record_for_model(r) for r in records]
    df = pd.DataFrame(cleaned)
    df['item_name'] = df['item_name'].astype(ITEM_CAT_DTYPE)
    df['category'] = df['category'].astype(CATEGORY_CAT_DTYPE)
    df['macro_dietary_period'] = df['macro_dietary_period'].astype(MACRO_CAT_DTYPE)
    return df

@app.get("/health")
def health():
    return {
        "status": "healthy", 
        "model_loaded": model is not None, 
        "rmse": RMSE_ESTIMATE
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_demand(req: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
        
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
    
    df = prepare_dataframe([input_data])
    raw_pred = model.predict(df)[0]
    predicted_demand = int(max(0, round(raw_pred)))
    
    optimal_qty, _, _, _ = calculate_optimal_quantity(
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

@app.post("/predict-batch", response_model=BatchPredictionResponse)
def predict_demand_batch(req: BatchPredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
        
    if not req.items:
        return BatchPredictionResponse(
            items=[],
            rmse_used=RMSE_ESTIMATE,
            model_version="XGBoost v1.0 (enable_categorical)"
        )

    # 1. Assemble single vectorized dataframe
    records = []
    for item in req.items:
        records.append({
            'item_name': item.item_name,
            'category': item.category,
            'day_of_week': item.day_of_week,
            'is_holiday': item.is_holiday,
            'days_to_payday': item.days_to_payday,
            'is_long_weekend': item.is_long_weekend,
            'precipitation_mm': item.precipitation_mm,
            'temp_max_c': item.temp_max_c,
            'weather_severity_alert': item.weather_severity_alert,
            'department_meeting_flag': item.department_meeting_flag,
            'leave_rate_percentage': item.leave_rate_percentage,
            'macro_dietary_period': item.macro_dietary_period,
            'recurring_meatless_day': item.recurring_meatless_day,
            'special_menu_flag': item.special_menu_flag,
            'demand_lag_1': item.demand_lag_1,
            'demand_lag_7': item.demand_lag_7,
            'rolling_mean_7d': item.rolling_mean_7d,
            'rolling_std_7d': item.rolling_std_7d
        })
        
    df = prepare_dataframe(records)
    # 2. Vectorized prediction across all dishes at once
    raw_preds = model.predict(df)
    
    # 3. Newsvendor formulation per dish
    results = []
    multiplier = req.buffer_multiplier if req.buffer_multiplier is not None else 1.0

    for idx, (item, raw_pred) in enumerate(zip(req.items, raw_preds)):
        pred_demand = int(max(0, round(raw_pred)))
        cost = item.cost_per_portion if item.cost_per_portion > 0 else 40.0
        penalty = item.shortage_penalty if item.shortage_penalty > 0 else 80.0
        
        cr = penalty / (cost + penalty)
        z = norm.ppf(cr)
        
        # Use dish-specific stdDev if provided and > 0, else model RMSE
        base_std = item.rolling_std_7d if item.rolling_std_7d > 0 else RMSE_ESTIMATE
        raw_buffer = round(z * base_std * multiplier)
        safety_buffer = max(0, int(raw_buffer))
        optimal_portions = max(0, pred_demand + safety_buffer)
        
        portion_kg = item.portion_kg if item.portion_kg and item.portion_kg > 0 else 0.35
        optimal_kg = round(float(optimal_portions * portion_kg), 1)
        
        per_batch = item.portions_per_batch if item.portions_per_batch and item.portions_per_batch > 0 else 40
        batches = int(np.ceil(optimal_portions / per_batch)) if optimal_portions > 0 else 0
        batch_unit = item.batch_unit or "Cauldron"
        batch_display = f"{optimal_portions} portions ({optimal_kg} kg / {batches} {batch_unit}s)"
        
        results.append(BatchPredictionItemResponse(
            id=item.id or f"dish-{idx}",
            item_name=item.item_name,
            category=item.category,
            meal_slot=item.meal_slot or "lunch",
            portion_kg=portion_kg,
            batch_unit=batch_unit,
            portions_per_batch=per_batch,
            predicted_demand=pred_demand,
            critical_ratio=round(float(cr), 3),
            z_score=round(float(z), 2),
            safety_buffer_portions=safety_buffer,
            optimal_cook_portions=optimal_portions,
            optimal_cook_kg=optimal_kg,
            batches_required=batches,
            batch_display=batch_display,
            shifter_reason=item.shifter_reason,
            shifter_badge_color=item.shifter_badge_color,
            status=item.status or "Stable"
        ))
        
    return BatchPredictionResponse(
        items=results,
        rmse_used=RMSE_ESTIMATE,
        model_version="XGBoost v1.0 (enable_categorical)"
    )
