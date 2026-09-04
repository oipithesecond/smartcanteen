import pandas as pd
import numpy as np

print("Loading synthetic data...")
# 1. Load the generated dataset
df = pd.read_csv('canteen_demand_synthetic_data_final.csv')

# Ensure the date column is explicitly parsed as a datetime object
df['date'] = pd.to_datetime(df['date'])

# IMPORTANT: Ensure the data is strictly sorted chronologically per item.
# If this is out of order, the `.shift()` function will pull the wrong days.
df.sort_values(by=['item_name', 'date'], inplace=True)
df.reset_index(drop=True, inplace=True)

print("Engineering time-series features...")

# --- 2. Historical Lag Features ---
# Demand from exactly 1 day ago (captures immediate momentum)
df['demand_lag_1'] = df.groupby('item_name')['target_demand'].shift(1)

# Demand from exactly 7 days ago (captures strict weekly seasonality)
df['demand_lag_7'] = df.groupby('item_name')['target_demand'].shift(7)


# --- 3. Rolling Window Features ---
# 7-day rolling mean (smooths out daily noise)
# We MUST use .shift(1) before .rolling() to prevent target leakage. 
# (i.e., The model cannot use today's demand to calculate today's rolling mean).
df['rolling_mean_7d'] = df.groupby('item_name')['target_demand'].transform(
    lambda x: x.shift(1).rolling(window=7, min_periods=1).mean()
)

# 7-day rolling standard deviation (captures volatility for the Newsvendor model)
df['rolling_std_7d'] = df.groupby('item_name')['target_demand'].transform(
    lambda x: x.shift(1).rolling(window=7, min_periods=1).std()
)


# --- 4. Handle Missing Values ---
# Because we are looking 7 days into the past, the first 7 days of our dataset 
# will naturally have NaN (Not a Number) values. We fill them with 0.
df.fillna(0, inplace=True)

# Save the final, model-ready dataset
output_file = 'canteen_demand_model_ready.csv'
df.to_csv(output_file, index=False)
print(f"Feature engineering complete! Model-ready dataset saved to: {output_file}")