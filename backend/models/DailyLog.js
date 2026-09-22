const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
  // 1. Branch & Operational Identity
  district: { 
    type: String, 
    required: true, 
    enum: ['amaravati', 'guntur', 'vijayawada'],
    index: true 
  },
  mealSlot: { 
    type: String, 
    required: true, 
    enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    index: true 
  },
  date: { type: Date, required: true, index: true },
  itemName: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Breakfast_Tiffins', 'Staples_Rice', 'Veg_Mains', 'Non_Veg_Mains', 'Snacks_Evening'] 
  },

  // 2. Physical Kitchen Quantities (Dual Portions & Kg)
  portionWeightKg: { type: Number, default: 0.35 },
  batchesRequired: { type: Number, default: 1 },
  batchUnit: { type: String, default: 'Cauldron' },
  portionsPerBatch: { type: Number, default: 40 },

  // 3. Machine Learning & Newsvendor Predictions (Morning Phase)
  prediction: {
    baselineDemand: { type: Number, required: true },   // Raw XGBoost output
    safetyBufferPortions: { type: Number, default: 0 }, // Newsvendor buffer
    optimalCookPortions: { type: Number, required: true }, // baseline + buffer
    optimalCookKg: { type: Number, required: true },
    criticalRatio: { type: Number, default: 0.5 },
    zScore: { type: Number, default: 0 },
    modelRmseUsed: { type: Number, default: 14.26 },
    bufferMultiplier: { type: Number, default: 1.0 }
  },

  // 4. Environmental Snapshot at Prediction Time (For Closed-Loop ML Retraining)
  contextSnapshot: {
    weatherTempC: Number,
    weatherPrecipMm: Number,
    weatherAlert: Boolean,
    isHoliday: Boolean,
    macroDietaryPeriod: { type: String, default: 'None' },
    driverSignal: String // e.g., "🌧️ Monsoon Rain Surge (+25%)"
  },

  // 5. Evening Leftovers & Actuals (Evening Closing Phase)
  actuals: {
    actualPreparedPortions: { type: Number, default: 0 },
    leftoverPortions: { type: Number, default: 0 },
    consumedPortions: { type: Number, default: 0 },     // prepared - leftovers
    wasteKg: { type: Number, default: 0 },
    stockoutFlag: { type: Boolean, default: false }      // true if leftovers == 0 and demand exceeded
  },

  // 6. Financial Ledger
  financials: {
    costPerPortion: { type: Number, required: true },
    shortagePenalty: { type: Number, required: true },
    costOfWaste: { type: Number, default: 0 },          // leftoverPortions * costPerPortion
    costOfShortage: { type: Number, default: 0 }
  },

  // 7. Status Flag
  isClosed: { type: Boolean, default: false, index: true }
}, { timestamps: true });

// Compound Indexes for fast dashboard aggregation and filtering
dailyLogSchema.index({ district: 1, date: -1, isClosed: 1 });
dailyLogSchema.index({ district: 1, mealSlot: 1, date: -1 });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
