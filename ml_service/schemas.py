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
