const DailyLog = require('../models/DailyLog');
const MacroPeriod = require('../models/MacroPeriod');
const axios = require('axios');
const Holidays = require('date-holidays');
const hd = new Holidays('IN');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

async function fetchWeather(targetDate) {
    try {
        const dateStr = targetDate.toISOString().split('T')[0];
        // Open-Meteo New Delhi
        const url = `https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&daily=precipitation_sum,temperature_2m_max&timezone=Asia%2FKolkata&start_date=${dateStr}&end_date=${dateStr}`;
        const response = await axios.get(url);
        const daily = response.data.daily;
        const precip = daily.precipitation_sum[0] || 0;
        const temp = daily.temperature_2m_max[0] || 30;
        return { precip, temp };
    } catch (err) {
        console.error("Weather fetch failed, using defaults", err.message);
        return { precip: 0, temp: 30 };
    }
}

async function getActiveMacro(targetDate) {
    const macros = await MacroPeriod.find({
        startDate: { $lte: targetDate },
        endDate: { $gte: targetDate }
    });
    return macros.length > 0 ? macros[0].name : "None";
}

exports.predictDemand = async (req, res) => {
    try {
        const payload = req.body; 
        const targetDate = new Date(payload.targetDate || new Date());
        
        // 1. Fetch real-world data
        const weather = await fetchWeather(targetDate);
        const macroName = await getActiveMacro(targetDate);
        
        // 2. Compute calendar logic
        const dayOfWeek = targetDate.getDay(); // 0-6 (Sun-Sat)
        const pythonDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Python uses 0:Mon, 6:Sun
        
        const isHoliday = hd.isHoliday(targetDate) ? 1 : 0;
        const recurringMeatless = [1, 3, 5].includes(pythonDayOfWeek) ? 1 : 0; // Tue, Thu, Sat
        
        let nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);
        let daysToPayday = Math.floor((nextMonth - targetDate) / (1000 * 60 * 60 * 24)) % 30;
        let isLongWeekend = ([0, 4].includes(pythonDayOfWeek) && isHoliday) ? 1 : 0; // Mon/Fri holiday

        let weatherSeverity = (weather.precip > 40 || weather.temp > 45) ? 1 : 0;

        // Construct final payload for ML
        const mlPayload = {
            ...payload.features,
            day_of_week: pythonDayOfWeek,
            is_holiday: isHoliday,
            days_to_payday: daysToPayday,
            is_long_weekend: isLongWeekend,
            precipitation_mm: weather.precip,
            temp_max_c: weather.temp,
            weather_severity_alert: weatherSeverity,
            macro_dietary_period: macroName,
            recurring_meatless_day: recurringMeatless,
        };

        const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, mlPayload);
        const { predicted_demand, optimal_cook_qty } = mlResponse.data;

        const newLog = new DailyLog({
            date: targetDate,
            itemName: mlPayload.item_name,
            category: mlPayload.category,
            predictedDemand: predicted_demand,
            optimalCookQty: optimal_cook_qty,
            costPerPortion: mlPayload.cost_per_portion,
        });
        await newLog.save();

        res.status(201).json({ message: "Prediction successful, log opened.", data: newLog, weather, macroName });
    } catch (error) {
        console.error("Error in predictDemand:", error.message);
        res.status(500).json({ error: "Failed to generate prediction", details: error.message });
    }
};

exports.logLeftovers = async (req, res) => {
    try {
        const { logId, actualPreparedQty, leftoverQty } = req.body;
        const log = await DailyLog.findById(logId);
        if (!log) return res.status(404).json({ error: "Log not found" });
        if (log.isClosed) return res.status(400).json({ error: "Log is already closed" });

        log.actualPreparedQty = actualPreparedQty;
        log.leftoverQty = leftoverQty;
        log.actualDemand = Math.max(0, actualPreparedQty - leftoverQty);
        log.wasteQty = leftoverQty;
        log.isClosed = true;

        await log.save();
        res.status(200).json({ message: "Leftovers logged.", data: log });
    } catch (error) {
        res.status(500).json({ error: "Failed to log leftovers" });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const stats = await DailyLog.aggregate([
            { $match: { isClosed: true } },
            { 
                $group: {
                    _id: null,
                    totalWaste: { $sum: "$wasteQty" },
                    totalCostLost: { $sum: { $multiply: ["$wasteQty", "$costPerPortion"] } },
                    avgAbsoluteError: { $avg: { $abs: { $subtract: ["$predictedDemand", "$actualDemand"] } } }
                }
            }
        ]);
        res.status(200).json(stats[0] || { totalWaste: 0, totalCostLost: 0, avgAbsoluteError: 0 });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
};

exports.getOpenLogs = async (req, res) => {
    try {
        const logs = await DailyLog.find({ isClosed: false }).sort({ date: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch open logs" });
    }
};
