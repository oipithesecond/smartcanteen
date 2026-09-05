const mongoose = require('mongoose');

const macroSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
});

module.exports = mongoose.model('MacroPeriod', macroSchema);
