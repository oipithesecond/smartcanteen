from typing import List, Optional
from pydantic import BaseModel

class PredictionRequest(BaseModel):
    # Features required by XGBoost
    item_name: str
    category: str
    day_of_week: int
    is_holiday: int
    days_to_payday: int
    is_long_weekend: int
    precipitation_mm: float
    temp_max_c: float
    weather_severity_alert: int
    department_meeting_flag: int
    leave_rate_percentage: float
    macro_dietary_period: str
    recurring_meatless_day: int
    special_menu_flag: int
    demand_lag_1: float
    demand_lag_7: float
    rolling_mean_7d: float
    rolling_std_7d: float
    
    # Financials for Newsvendor Optimization
    cost_per_portion: float
    shortage_penalty: float

class PredictionResponse(BaseModel):
    item_name: str
    predicted_demand: int
    optimal_cook_qty: int
    rmse_used: float

class PredictionItem(BaseModel):
    id: Optional[str] = None
    item_name: str
    category: str
    meal_slot: Optional[str] = "lunch"
    portion_kg: Optional[float] = 0.35
    batch_unit: Optional[str] = "Cauldron"
    portions_per_batch: Optional[int] = 40
    
    # Features required by XGBoost
    day_of_week: int
    is_holiday: int
    days_to_payday: int
    is_long_weekend: int
    precipitation_mm: float
    temp_max_c: float
    weather_severity_alert: int
    department_meeting_flag: int
    leave_rate_percentage: float
    macro_dietary_period: str
    recurring_meatless_day: int
    special_menu_flag: int
    demand_lag_1: float
    demand_lag_7: float
    rolling_mean_7d: float
    rolling_std_7d: float
    
    # Financials for Newsvendor Optimization
    cost_per_portion: float
    shortage_penalty: float
    
    # Operational metadata
    shifter_reason: Optional[str] = None
    shifter_badge_color: Optional[str] = None
    status: Optional[str] = "Stable"

class BatchPredictionRequest(BaseModel):
    items: List[PredictionItem]
    buffer_multiplier: Optional[float] = 1.0

class BatchPredictionItemResponse(BaseModel):
    id: Optional[str] = None
    item_name: str
    category: str
    meal_slot: str
    portion_kg: float
    batch_unit: str
    portions_per_batch: int
    predicted_demand: int
    critical_ratio: float
    z_score: float
    safety_buffer_portions: int
    optimal_cook_portions: int
    optimal_cook_kg: float
    batches_required: int
    batch_display: str
    shifter_reason: Optional[str] = None
    shifter_badge_color: Optional[str] = None
    status: Optional[str] = "Stable"

class BatchPredictionResponse(BaseModel):
    items: List[BatchPredictionItemResponse]
    rmse_used: float
    model_version: str = "XGBoost v1.0 (enable_categorical)"
