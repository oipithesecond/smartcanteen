import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error
from scipy.stats import norm

print("Loading preprocessed dataset...")
df = pd.read_csv('canteen_demand_model_ready.csv')
df['date'] = pd.to_datetime(df['date'])

# --- 1. Prevent Target Leakage ---
# We must drop the variables used to artificially generate the data.
# The model must figure out the demand drops using only the calendar features.
columns_to_drop = ['nonveg_abstention_index', 'fasting_population_est']
df = df.drop(columns=columns_to_drop)

# --- 2. Handle Categorical Data ---
# Convert text columns to pandas categorical types for XGBoost
categorical_features = ['item_name', 'category', 'macro_dietary_period']
for col in categorical_features:
    df[col] = df[col].astype('category')

# --- 3. Time-Based Train/Test Split ---
# Train on 2024 and 2025, Test on 2026
train_df = df[df['date'].dt.year < 2026].copy()
test_df = df[df['date'].dt.year == 2026].copy()

# Define features (X) and target (y)
# We drop 'date' because XGBoost cannot process raw datetime objects, 
# and we drop financial attributes as they are for Phase 4 optimization, not prediction.
features = [col for col in train_df.columns if col not  in [
    'date', 'target_demand', 'cost_per_portion', 'shortage_penalty'
]]

X_train, y_train = train_df[features], train_df['target_demand']
X_test, y_test = test_df[features], test_df['target_demand']

print(f"Training on {len(X_train)} records, Testing on {len(X_test)} records...")

# --- 4. Train the XGBoost Model ---
# enable_categorical=True allows XGBoost to natively handle our string categories
model = xgb.XGBRegressor(
    n_estimators=500,
    learning_rate=0.05,
    max_depth=6,
    enable_categorical=True,
    random_state=42
)

model.fit(
    X_train, y_train,
    eval_set=[(X_train, y_train), (X_test, y_test)],
    verbose=50 # Print progress every 50 trees
)

print("Saving trained model...")
model.save_model('canteen_xgboost_model.json')

# --- 5. Evaluation ---
predictions = model.predict(X_test)
# Ensure predictions aren't negative (you can't have negative food demand)
predictions = np.maximum(predictions, 0) 

mape = mean_absolute_percentage_error(y_test[y_test > 0], predictions[y_test > 0])
rmse = np.sqrt(mean_squared_error(y_test, predictions))

print("\n=== Model Performance on 2026 Test Set ===")
print(f"Mean Absolute Percentage Error (MAPE): {mape * 100:.2f}%")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f} portions")

# Optional: View feature importance to prove it learned the calendar
importance = pd.DataFrame({
    'Feature': features,
    'Importance': model.feature_importances_
}).sort_values(by='Importance', ascending=False)

print("\nTop 5 Most Important Features:")
print(importance.head(5))

# --- PHASE 4: Newsvendor Optimization ---
print("\n=== Phase 4: Newsvendor Optimization ===")
def calculate_optimal_quantity(pred, cost, penalty, rmse_val):
    if pred <= 0: return 0
    z = norm.ppf(penalty / (cost + penalty))
    return max(0, int(round(pred + (z * rmse_val))))

results = test_df[['date', 'item_name', 'target_demand', 'demand_lag_7', 
                   'cost_per_portion', 'shortage_penalty']].copy()
results['xgb_prediction'] = predictions
results['optimal_xgb_qty'] = results.apply(lambda r: 
    calculate_optimal_quantity(r['xgb_prediction'], r['cost_per_portion'], 
                               r['shortage_penalty'], rmse), axis=1)
results['baseline_qty'] = results['demand_lag_7'].astype(int)

def calc_financial_impact(cooked, actual, cost, penalty):
    return (max(0, cooked - actual) * cost) + (max(0, actual - cooked) * penalty)

results['baseline_cost'] = results.apply(lambda r: 
    calc_financial_impact(r['baseline_qty'], r['target_demand'], 
                          r['cost_per_portion'], r['shortage_penalty']), axis=1)

results['xgb_cost'] = results.apply(lambda r: 
    calc_financial_impact(r['optimal_xgb_qty'], r['target_demand'], 
                          r['cost_per_portion'], r['shortage_penalty']), axis=1)

print(f"Total Expected Savings (2026 Test Year): Rs. {results['baseline_cost'].sum() - results['xgb_cost'].sum():,.2f}")