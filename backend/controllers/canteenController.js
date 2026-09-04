const axios = require('axios');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

let logs = [];
let nextId = 1;

exports.predictDemand = async (req, res) => {
    try {
        const payload = req.body; 
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, payload);
        const { predicted_demand, optimal_cook_qty } = mlResponse.data;

        const newLog = {
            _id: nextId++,
            date: new Date(),
            itemName: payload.item_name,
            category: payload.category,
            predictedDemand: predicted_demand,
            optimalCookQty: optimal_cook_qty,
            costPerPortion: payload.cost_per_portion,
            actualPreparedQty: 0,
            leftoverQty: 0,
            actualDemand: 0,
            wasteQty: 0,
            isClosed: false
        };
        logs.push(newLog);

        res.status(201).json({ message: "Prediction successful, log opened.", data: newLog });
    } catch (error) {
        console.error("Error in predictDemand:", error.message);
        res.status(500).json({ error: "Failed to generate prediction", details: error.message, stack: error.stack });
    }
};

exports.logLeftovers = async (req, res) => {
    try {
        const { logId, actualPreparedQty, leftoverQty } = req.body;
        const log = logs.find(l => l._id == logId);
        if (!log) return res.status(404).json({ error: "Log not found" });
        if (log.isClosed) return res.status(400).json({ error: "Log is already closed" });

        log.actualPreparedQty = actualPreparedQty;
        log.leftoverQty = leftoverQty;
        log.actualDemand = Math.max(0, actualPreparedQty - leftoverQty);
        log.wasteQty = leftoverQty;
        log.isClosed = true;

        res.status(200).json({ message: "Leftovers logged and day closed for item.", data: log });
    } catch (error) {
        res.status(500).json({ error: "Failed to log leftovers" });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const closedLogs = logs.filter(l => l.isClosed);
        let totalWaste = 0;
        let totalCostLost = 0;
        let errorSum = 0;
        
        closedLogs.forEach(l => {
            totalWaste += l.wasteQty;
            totalCostLost += (l.wasteQty * l.costPerPortion);
            errorSum += Math.abs(l.predictedDemand - l.actualDemand);
        });

        const avgAbsoluteError = closedLogs.length ? (errorSum / closedLogs.length) : 0;
        res.status(200).json({ totalWaste, totalCostLost, avgAbsoluteError });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
};
