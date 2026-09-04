import requests
import time
import random

# Base URLs for our services
NODE_API = "http://localhost:5005/api"
FASTAPI_URL = "http://localhost:8000"

def simulate_day(date_str, features, actual_demand):
    print(f"\n--- Simulating Day: {date_str} ---")
    
    # 1. Request Prediction from Node API (which talks to FastAPI)
    print(f"[Morning] Requesting prediction and optimal cook quantity for {features['item_name']}...")
    try:
        res = requests.post(f"{NODE_API}/predict", json=features)
        if res.status_code != 201:
            print(f"Error predicting: {res.text}")
            return
            
        prediction_data = res.json()['data']
        log_id = prediction_data['_id']
        optimal_qty = prediction_data['optimalCookQty']
        
        print(f"[Morning] System recommended cooking {optimal_qty} portions.")
    except Exception as e:
        print(f"Failed to connect to API: {e}")
        return

    # 2. Simulate the day passing...
    time.sleep(1) # Sleep to represent the operating day
    
    # 3. End of day logging
    # We cooked 'optimal_qty'. Real demand was 'actual_demand'.
    # If demand > cooked, we ran out (leftovers = 0).
    # If cooked > demand, we have leftovers.
    leftovers = max(0, optimal_qty - actual_demand)
    
    print(f"[Evening] Logging end of day results. Actual Demand was {actual_demand}. Leftovers: {leftovers}")
    try:
        res = requests.put(f"{NODE_API}/log-leftovers", json={
            "logId": log_id,
            "actualPreparedQty": optimal_qty,
            "leftoverQty": leftovers
        })
        
        if res.status_code == 200:
            print("[Evening] Day closed successfully. Data recorded for future retraining.")
    except Exception as e:
        print(f"Failed to log leftovers: {e}")

if __name__ == "__main__":
    print("Starting Phase 5: Closed-Loop Simulation")
    print("Make sure Node.js (Port 5000) and FastAPI (Port 8000) are running.\n")
    
    # Dummy features for a 3-day simulation loop
    base_features = {
        "item_name": "Chicken Dum Biryani",
        "category": "Non_Veg_Mains",
        "is_on_menu": 1,
        "day_of_week": 2,
        "is_holiday": 0,
        "days_to_payday": 15,
        "is_long_weekend": 0,
        "precipitation_mm": 0.0,
        "temp_max_c": 30.0,
        "weather_severity_alert": 0,
        "department_meeting_flag": 0,
        "leave_rate_percentage": 0.05,
        "macro_dietary_period": "None",
        "recurring_meatless_day": 0,
        "special_menu_flag": 0,
        "demand_lag_1": 150.0,
        "demand_lag_7": 145.0,
        "rolling_mean_7d": 148.0,
        "rolling_std_7d": 5.2,
        "cost_per_portion": 70.0,
        "shortage_penalty": 100.0
    }
    
    # Day 1: Normal day
    simulate_day("2026-04-01", base_features, actual_demand=160)
    
    # Day 2: Surprise rain, demand drops slightly compared to prediction
    rain_features = base_features.copy()
    rain_features["precipitation_mm"] = 25.0
    rain_features["day_of_week"] = 3
    simulate_day("2026-04-02", rain_features, actual_demand=130)
    
    # Day 3: Department meeting, demand spikes
    meeting_features = base_features.copy()
    meeting_features["department_meeting_flag"] = 1
    meeting_features["day_of_week"] = 4
    simulate_day("2026-04-03", meeting_features, actual_demand=190)
    
    print("\nSimulation complete! Check the manager dashboard to see the analytics update in real time.")
