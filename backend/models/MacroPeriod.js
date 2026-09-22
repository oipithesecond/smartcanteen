const mongoose = require('mongoose');

const macroSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  dietaryImpactType: { 
    type: String, 
    enum: ['VEG_SURGE', 'FASTING_DAYTIME', 'FEAST_SURGE', 'GENERAL_HOLIDAY', 'OTHER'],
    default: 'VEG_SURGE'
  },
  description: { type: String, default: '' },
  applicableDistricts: { 
    type: [String], 
    default: ['amaravati', 'guntur', 'vijayawada'] 
  }
}, { timestamps: true });

// Efficient range query index
macroSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('MacroPeriod', macroSchema);
