import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# ==========================================
# 1. Configuration & Initial Setup
# ==========================================
np.random.seed(42)
DAYS_TO_SIMULATE = 1095  # UPDATED: 3 years (2024 - 2026) for seasonality
START_DATE = datetime(2024, 1, 1)
BASE_FOOTFALL = 1000

MENU_ITEMS = {
    'Staples': ['White Rice', 'Pulka'],
    'Veg_Mains': ['Mudda Pappu', 'Chole Soya Chunks Curry', 'Paneer Butter Masala'],
    'Non_Veg_Mains': ['Chicken Dum Biryani', 'Egg Bhurji', 'Masala Fish Fry']
}

# --- NEW: Rotating Menu Schedule (0:Mon ... 6:Sun) ---
ITEM_SCHEDULE = {
    'White Rice': [0, 1, 2, 3, 4, 5, 6],
    'Pulka': [0, 1, 2, 3, 4, 5, 6],
    'Mudda Pappu': [0, 2, 4, 6],
    'Chole Soya Chunks Curry': [1, 3, 5],
    'Paneer Butter Masala': [0, 2, 5, 6],
    'Chicken Dum Biryani': [2, 6],  # e.g., Wed, Sun
    'Egg Bhurji': [0, 1, 4],        # e.g., Mon, Tue, Fri
    'Masala Fish Fry': [3, 5]       # e.g., Thu, Sat
}

# --- NEW: Financials for Newsvendor Optimization ---
ITEM_FINANCIALS = {
    'White Rice': {'cost_per_portion': 10, 'shortage_penalty': 20},
    'Pulka': {'cost_per_portion': 5, 'shortage_penalty': 10},
    'Mudda Pappu': {'cost_per_portion': 15, 'shortage_penalty': 25},
    'Chole Soya Chunks Curry': {'cost_per_portion': 20, 'shortage_penalty': 30},
    'Paneer Butter Masala': {'cost_per_portion': 40, 'shortage_penalty': 60},
    'Chicken Dum Biryani': {'cost_per_portion': 70, 'shortage_penalty': 100},
    'Egg Bhurji': {'cost_per_portion': 25, 'shortage_penalty': 40},
    'Masala Fish Fry': {'cost_per_portion': 60, 'shortage_penalty': 90}
}

# 0:Mon, 1:Tue, 2:Wed, 3:Thu, 4:Fri, 5:Sat, 6:Sun
BASE_ABSTENTION_BY_DAY = {
    0: 0.15, 1: 0.25, 2: 0.05, 3: 0.20, 4: 0.05, 5: 0.30, 6: 0.02
}

# --- UPDATED: 3-Year Macro Calendar ---
MACRO_PERIODS = [
    # 2024
    {'name': 'Ramadan', 'start': datetime(2024, 3, 10), 'end': datetime(2024, 4, 9), 'fasting_est': 0.15, 'abstention_override': None},
    {'name': 'Shravan', 'start': datetime(2024, 8, 5), 'end': datetime(2024, 9, 3), 'fasting_est': 0.02, 'abstention_override': 0.40},
    {'name': 'Navratri', 'start': datetime(2024, 10, 3), 'end': datetime(2024, 10, 12), 'fasting_est': 0.05, 'abstention_override': 0.45},
    # 2025
    {'name': 'Ramadan', 'start': datetime(2025, 2, 28), 'end': datetime(2025, 3, 30), 'fasting_est': 0.15, 'abstention_override': None},
    {'name': 'Shravan', 'start': datetime(2025, 7, 25), 'end': datetime(2025, 8, 23), 'fasting_est': 0.02, 'abstention_override': 0.40},
    {'name': 'Navratri', 'start': datetime(2025, 9, 22), 'end': datetime(2025, 10, 2), 'fasting_est': 0.05, 'abstention_override': 0.45},
    # 2026
    {'name': 'Ramadan', 'start': datetime(2026, 2, 17), 'end': datetime(2026, 3, 19), 'fasting_est': 0.15, 'abstention_override': None},
    {'name': 'Shravan', 'start': datetime(2026, 8, 1), 'end': datetime(2026, 8, 31), 'fasting_est': 0.02, 'abstention_override': 0.40},
    {'name': 'Navratri', 'start': datetime(2026, 10, 10), 'end': datetime(2026, 10, 19), 'fasting_est': 0.05, 'abstention_override': 0.45}
]

# ==========================================
# 2. Helper Functions
# ==========================================
def generate_weather(month):
    if month in [6, 7, 8, 9]:
        precip, temp = np.random.gamma(2.0, 10.0), np.random.normal(30, 3)
    elif month in [4, 5]:
        precip, temp = np.random.gamma(0.5, 2.0), np.random.normal(40, 2)
    else:
        precip, temp = np.random.gamma(1.0, 3.0), np.random.normal(25, 4)
    return precip, temp, 1 if precip > 40 or temp > 45 else 0

def get_macro_period(current_date):
    for period in MACRO_PERIODS:
        if period['start'] <= current_date <= period['end']:
            return period['name'], period['fasting_est'], period['abstention_override']
    return 'None', 0.0, None

# ==========================================
# 3. Main Data Generation Loop
# ==========================================
data = []

for i in range(DAYS_TO_SIMULATE):
    current_date = START_DATE + timedelta(days=i)
    day_of_week = current_date.weekday()
    month = current_date.month
    
    # --- Temporal & Calendar ---
    is_holiday = np.random.choice([0, 1], p=[0.95, 0.05])
    days_to_payday = (current_date.replace(day=1) + timedelta(days=32)).replace(day=1) - current_date
    days_to_payday = days_to_payday.days % 30
    is_long_weekend = 1 if (day_of_week in [0, 4] and is_holiday) else 0
    
    # --- Environmental ---
    precip_mm, temp_max_c, weather_severity = generate_weather(month)
    
    # --- Organizational ---
    dept_meeting = np.random.choice([0, 1], p=[0.8, 0.2])
    leave_rate = np.random.uniform(0.02, 0.15) if not is_long_weekend else np.random.uniform(0.15, 0.30)
    
    # --- Cultural & Religious ---
    macro_name, fasting_pop, abstention_override = get_macro_period(current_date)
    
    recurring_meatless = 1 if day_of_week in [1, 3, 5] else 0
    
    if abstention_override is not None:
        nonveg_index = abstention_override
    else:
        nonveg_index = BASE_ABSTENTION_BY_DAY[day_of_week]
        
    # Special menus are likely during macro periods, holidays, or random department events
    if macro_name != 'None':
        special_menu = np.random.choice([0, 1], p=[0.2, 0.8]) # 80% chance during festivals
    elif is_holiday:
        special_menu = 1 
    else:
        special_menu = np.random.choice([0, 1], p=[0.95, 0.05]) # 5% chance on random days
    
    # --- Base Demand Calculation ---
    daily_footfall = BASE_FOOTFALL * (1 - leave_rate) * (1 - fasting_pop)
    
    if precip_mm > 20: daily_footfall *= 1.15
    if dept_meeting: daily_footfall *= 1.20
    if day_of_week == 4: daily_footfall *= 0.90
    if is_holiday: daily_footfall *= 0.10

    # --- Item Level Distribution ---
    for category, items in MENU_ITEMS.items():
        for item in items:
            # Check if item is on the menu today
            is_on_menu = 1 if day_of_week in ITEM_SCHEDULE.get(item, []) else 0
            
            if is_on_menu:
                # Calculate demand normally
                if category == 'Staples':
                    base_demand = daily_footfall * 0.8 / len(items)
                elif category == 'Veg_Mains':
                    base_demand = daily_footfall * 0.5 / len(items)
                    base_demand *= (1 + nonveg_index) 
                elif category == 'Non_Veg_Mains':
                    base_demand = daily_footfall * 0.4 / len(items)
                    base_demand *= (1 - nonveg_index)
                
                noise = np.random.normal(0, 0.05 * base_demand)
                final_demand = max(0, int(base_demand + noise))
            else:
                # Force demand to 0 but keep the continuous timeline
                final_demand = 0
            
            # Retrieve financial values for the item
            cost_per_portion = ITEM_FINANCIALS[item]['cost_per_portion']
            shortage_penalty = ITEM_FINANCIALS[item]['shortage_penalty']
            
            data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'item_name': item,
                'category': category,
                'is_on_menu': is_on_menu,
                'day_of_week': day_of_week,
                'is_holiday': is_holiday,
                'days_to_payday': days_to_payday,
                'is_long_weekend': is_long_weekend,
                'precipitation_mm': round(precip_mm, 2),
                'temp_max_c': round(temp_max_c, 2),
                'weather_severity_alert': weather_severity,
                'department_meeting_flag': dept_meeting,
                'leave_rate_percentage': round(leave_rate, 2),
                'macro_dietary_period': macro_name,
                'recurring_meatless_day': recurring_meatless,
                'nonveg_abstention_index': nonveg_index,
                'fasting_population_est': fasting_pop,
                'special_menu_flag': special_menu,
                'cost_per_portion': cost_per_portion,
                'shortage_penalty': shortage_penalty,
                'target_demand': final_demand
            })

# ==========================================
# 4. Final Processing & Export
# ==========================================
df = pd.DataFrame(data)
df.sort_values(by=['item_name', 'date'], inplace=True)
df.reset_index(drop=True, inplace=True)
df.to_csv('canteen_demand_synthetic_data_final.csv', index=False)
print(f"Final synthetic data generated successfully with {len(df)} records!")