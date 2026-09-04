import pandas as pd
import numpy as np
from scipy.stats import norm

# Assume 'test_results_df' is a DataFrame containing your XGBoost predictions
# from the 2026 test set, merged back with the financial attributes.
# Columns: ['date', 'item_name', 'actual_demand', 'xgb_prediction', 'cost_per_portion', 'shortage_penalty']

def calculate_optimal_quantity(prediction, cost, penalty, prediction_rmse=14.26):
    """
    Applies the Newsvendor model to find the optimal cooking quantity.
    """
    # 1. Calculate the Critical Ratio
    critical_ratio = penalty / (cost + penalty)
    
    # 2. Get the Z-score for this ratio
    z_score = norm.ppf(critical_ratio)
    
    # 3. Calculate Optimal Quantity (Q)
    # Using the XGBoost RMSE (14.26) as our standard deviation / uncertainty margin
    optimal_q = prediction + (z_score * prediction_rmse)
    
    return max(0, int(round(optimal_q)))

# Example application on a dummy row
prediction = 100
cost_per_portion = 70      # Chicken Biryani is expensive to waste
shortage_penalty = 100     # High penalty for running out

optimal_cook_qty = calculate_optimal_quantity(prediction, cost_per_portion, shortage_penalty)

print(f"XGBoost Predicted Demand: {prediction}")
print(f"Critical Ratio: {shortage_penalty / (cost_per_portion + shortage_penalty):.2f}")
print(f"Optimal Quantity to Cook: {optimal_cook_qty}")