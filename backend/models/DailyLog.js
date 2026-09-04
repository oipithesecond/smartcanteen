const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    predictedDemand: { type: Number, required: true },
    optimalCookQty: { type: Number, required: true },
    actualPreparedQty: { type: Number, default: 0 }, 
    leftoverQty: { type: Number, default: 0 },
    actualDemand: { type: Number, default: 0 }, // actualPreparedQty - leftoverQty
    wasteQty: { type: Number, default: 0 },
    costPerPortion: { type: Number, required: true },
    isClosed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
