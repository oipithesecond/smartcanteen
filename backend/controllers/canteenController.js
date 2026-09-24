const mongoose = require('mongoose');
const DailyLog = require('../models/DailyLog');
const MacroPeriod = require('../models/MacroPeriod');
const { MENU_ITEMS_BY_DISTRICT } = require('../data/menuCatalogue');
const axios = require('axios');
const Holidays = require('date-holidays');
const hd = new Holidays('IN');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// District coordinate mapping for accurate local weather forecast
const DISTRICT_COORDS = {
    amaravati: { lat: 16.5131, lon: 80.5165 },
    guntur: { lat: 16.3067, lon: 80.4365 },
    vijayawada: { lat: 16.5062, lon: 80.6480 }
};

async function fetchWeather(targetDate, district = 'guntur') {
    try {
        const dateStr = targetDate.toISOString().split('T')[0];
        const coords = DISTRICT_COORDS[district] || DISTRICT_COORDS.guntur;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=precipitation_sum,temperature_2m_max&timezone=Asia%2FKolkata&start_date=${dateStr}&end_date=${dateStr}`;
        const response = await axios.get(url);
        const daily = response.data.daily;
        const precip = daily.precipitation_sum?.[0] ?? 0;
        const temp = daily.temperature_2m_max?.[0] ?? 32;
        return { precip, temp };
    } catch (err) {
        console.error("Weather fetch failed, using defaults", err.message);
        return { precip: 0, temp: 32 };
    }
}

async function getActiveMacro(targetDate, district = 'guntur') {
    if (mongoose.connection.readyState !== 1) {
        return "None";
    }
    try {
        const macros = await MacroPeriod.find({
            startDate: { $lte: targetDate },
            endDate: { $gte: targetDate },
            $or: [
                { applicableDistricts: { $in: [district] } },
                { applicableDistricts: { $exists: false } },
                { applicableDistricts: { $size: 0 } }
            ]
        });
        return macros.length > 0 ? macros[0].name : "None";
    } catch (err) {
        console.error("Macro check failed:", err.message);
        return "None";
    }
}

// Normalize categories to match DailyLog enum
function normalizeCategory(cat) {
    if (!cat) return 'Veg_Mains';
    const clean = cat.trim();
    if (['Breakfast_Tiffins', 'Staples_Rice', 'Veg_Mains', 'Non_Veg_Mains', 'Snacks_Evening'].includes(clean)) {
        return clean;
    }
    if (clean.toLowerCase().includes('staple') || clean.toLowerCase().includes('rice')) return 'Staples_Rice';
    if (clean.toLowerCase().includes('non_veg') || clean.toLowerCase().includes('chicken') || clean.toLowerCase().includes('meat') || clean.toLowerCase().includes('fish')) return 'Non_Veg_Mains';
    if (clean.toLowerCase().includes('breakfast') || clean.toLowerCase().includes('tiffin')) return 'Breakfast_Tiffins';
    if (clean.toLowerCase().includes('snack')) return 'Snacks_Evening';
    return 'Veg_Mains';
}

exports.predictDemand = async (req, res) => {
    try {
        const payload = req.body; 
        const targetDate = new Date(payload.targetDate || new Date());
        const district = (payload.district || 'guntur').toLowerCase();
        const mealSlot = (payload.mealSlot || 'lunch').toLowerCase();
        
        // 1. Fetch real-world environmental data
        const weather = await fetchWeather(targetDate, district);
        const macroName = await getActiveMacro(targetDate, district);
        
        // 2. Compute calendar & dietary signals
        const dayOfWeek = targetDate.getDay(); // 0-6 (Sun-Sat)
        const pythonDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // 0:Mon, 6:Sun
        
        const isHoliday = hd.isHoliday(targetDate) ? 1 : 0;
        const recurringMeatless = [1, 3, 5].includes(pythonDayOfWeek) ? 1 : 0; // Tue, Thu, Sat
        
        let nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);
        let daysToPayday = Math.floor((nextMonth - targetDate) / (1000 * 60 * 60 * 24)) % 30;
        let isLongWeekend = ([0, 4].includes(pythonDayOfWeek) && isHoliday) ? 1 : 0;

        let weatherSeverity = (weather.precip > 30 || weather.temp > 42) ? 1 : 0;

        // Construct ML payload
        const mlPayload = {
            ...payload.features,
            category: normalizeCategory(payload.features?.category || payload.category),
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
        const { predicted_demand, optimal_cook_qty, rmse_used } = mlResponse.data;

        const portionWeight = payload.portionWeightKg || 0.35;
        const optimalKg = parseFloat((optimal_cook_qty * portionWeight).toFixed(1));
        const bufferPortions = Math.max(0, optimal_cook_qty - predicted_demand);
        const costPerPortion = Number(mlPayload.cost_per_portion) || 40;
        const shortagePenalty = Number(mlPayload.shortage_penalty) || 80;
        const criticalRatio = parseFloat((shortagePenalty / (costPerPortion + shortagePenalty)).toFixed(3));

        const driverSignal = weatherSeverity 
            ? `🌧️ Weather Alert (${weather.precip}mm)` 
            : (macroName !== 'None' ? `🌙 ${macroName} Dietary Period` : (isHoliday ? '🎉 Public Holiday' : 'Standard Baseline'));

        // Save structured record into upgraded schema
        const newLog = new DailyLog({
            district,
            mealSlot,
            date: targetDate,
            itemName: mlPayload.item_name,
            category: mlPayload.category,
            portionWeightKg: portionWeight,
            batchesRequired: Math.ceil(optimal_cook_qty / (payload.portionsPerBatch || 40)),
            batchUnit: payload.batchUnit || 'Cauldron',
            portionsPerBatch: payload.portionsPerBatch || 40,
            prediction: {
                baselineDemand: predicted_demand,
                safetyBufferPortions: bufferPortions,
                optimalCookPortions: optimal_cook_qty,
                optimalCookKg: optimalKg,
                criticalRatio,
                zScore: payload.zScore || 0.85,
                modelRmseUsed: rmse_used || 14.26,
                bufferMultiplier: payload.bufferMultiplier || 1.0
            },
            contextSnapshot: {
                weatherTempC: weather.temp,
                weatherPrecipMm: weather.precip,
                weatherAlert: Boolean(weatherSeverity),
                isHoliday: Boolean(isHoliday),
                macroDietaryPeriod: macroName,
                driverSignal
            },
            financials: {
                costPerPortion,
                shortagePenalty,
                costOfWaste: 0,
                costOfShortage: 0
            }
        });
        if (mongoose.connection.readyState === 1) {
            await newLog.save();
        }

        res.status(201).json({ 
            message: mongoose.connection.readyState === 1 ? "Prediction successful, log opened." : "Prediction successful (memory mode, MongoDB not connected).", 
            data: newLog, 
            weather, 
            macroName 
        });
    } catch (error) {
        console.error("Error in predictDemand:", error.message);
        res.status(500).json({ error: "Failed to generate prediction", details: error.message });
    }
};

/**
 * Generates Tomorrow's Batch Cook Plan for an entire kitchen branch
 * by running all scheduled menu items through the live XGBoost model
 */
exports.getBatchCookPlan = async (req, res) => {
    try {
        const district = ((req.query?.district) || (req.body?.district) || 'guntur').toLowerCase();
        const bufferMultiplier = parseFloat((req.query?.bufferMultiplier) || (req.body?.bufferMultiplier) || 1.0);
        const targetDate = new Date((req.query?.targetDate) || (req.body?.targetDate) || (Date.now() + 86400000)); // Tomorrow

        // 1. Load active menu catalog for district
        const rawItems = req.body?.items || MENU_ITEMS_BY_DISTRICT[district] || MENU_ITEMS_BY_DISTRICT.guntur;

        // 2. Fetch live real-world environmental signals for targetDate & district
        const weather = await fetchWeather(targetDate, district);
        const macroName = await getActiveMacro(targetDate, district);

        // 3. Compute calendar & dietary logic
        const dayOfWeek = targetDate.getDay();
        const pythonDayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
        const isHoliday = hd.isHoliday(targetDate) ? 1 : 0;
        const recurringMeatless = [1, 3, 5].includes(pythonDayOfWeek) ? 1 : 0;
        
        let nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);
        let daysToPayday = Math.floor((nextMonth - targetDate) / (1000 * 60 * 60 * 24)) % 30;
        let isLongWeekend = ([0, 4].includes(pythonDayOfWeek) && isHoliday) ? 1 : 0;
        let weatherSeverity = (weather.precip > 30 || weather.temp > 42) ? 1 : 0;

        // 4. Build batch payload for ML microservice
        const mlItems = [];
        const offMenuItems = [];

        rawItems.forEach((item, idx) => {
            if (item.isOnMenu === 0) {
                offMenuItems.push({
                    id: item.id || `dish-${idx}`,
                    itemName: item.itemName,
                    category: item.category,
                    mealSlot: item.mealSlot || 'lunch',
                    portionKg: item.portionKg || 0.35,
                    batchUnit: item.batchUnit || 'Cauldron',
                    portionsPerBatch: item.portionsPerBatch || 40,
                    forecastedDemand: 0,
                    criticalRatio: 0,
                    zScore: 0,
                    safetyBufferPortions: 0,
                    optimalCookPortions: 0,
                    optimalCookKg: 0,
                    batchesRequired: 0,
                    batchDisplay: '0 batches (Off-Menu)',
                    shifterReason: item.shifterReason || 'Off-Menu Rotation',
                    shifterBadgeColor: 'slate',
                    status: 'Inactive'
                });
            } else {
                mlItems.push({
                    id: item.id || `dish-${idx}`,
                    item_name: item.itemName,
                    category: normalizeCategory(item.category),
                    meal_slot: item.mealSlot || 'lunch',
                    portion_kg: item.portionKg || 0.35,
                    batch_unit: item.batchUnit || 'Cauldron',
                    portions_per_batch: item.portionsPerBatch || 40,
                    day_of_week: pythonDayOfWeek,
                    is_holiday: isHoliday,
                    days_to_payday: daysToPayday,
                    is_long_weekend: isLongWeekend,
                    precipitation_mm: weather.precip,
                    temp_max_c: weather.temp,
                    weather_severity_alert: weatherSeverity,
                    department_meeting_flag: item.departmentMeetingFlag || 0,
                    leave_rate_percentage: item.leaveRatePercentage || 0.05,
                    macro_dietary_period: macroName,
                    recurring_meatless_day: recurringMeatless,
                    special_menu_flag: item.specialMenuFlag || 0,
                    demand_lag_1: item.demandLag1 || item.rollingMean7d || 300,
                    demand_lag_7: item.demandLag7 || item.rollingMean7d || 300,
                    rolling_mean_7d: item.rollingMean7d || 300,
                    rolling_std_7d: item.rollingStd7d || 25,
                    cost_per_portion: item.costPerPortion || 40,
                    shortage_penalty: item.shortagePenalty || 80,
                    shifter_reason: item.shifterReason,
                    shifter_badge_color: item.shifterBadgeColor,
                    status: item.status || 'Stable'
                });
            }
        });

        // 5. Send to FastAPI /predict-batch
        const mlBatchRes = await axios.post(`${ML_SERVICE_URL}/predict-batch`, {
            items: mlItems,
            buffer_multiplier: bufferMultiplier
        });

        const predictedItems = mlBatchRes.data.items.map(item => ({
            id: item.id,
            itemName: item.item_name,
            category: item.category,
            mealSlot: item.meal_slot,
            portionKg: item.portion_kg,
            batchUnit: item.batch_unit,
            portionsPerBatch: item.portions_per_batch,
            forecastedDemand: item.predicted_demand,
            criticalRatio: item.critical_ratio,
            zScore: item.z_score,
            safetyBufferPortions: item.safety_buffer_portions,
            optimalCookPortions: item.optimal_cook_portions,
            optimalCookKg: item.optimal_cook_kg,
            batchesRequired: item.batches_required,
            batchDisplay: item.batch_display,
            shifterReason: item.shifter_reason || (weatherSeverity ? `🌧️ Rain Surge (+${weather.precip}mm)` : (macroName !== 'None' ? `🌙 ${macroName} Period` : 'Standard Trend')),
            shifterBadgeColor: item.shifter_badge_color || (weatherSeverity ? 'amber' : 'emerald'),
            status: item.status
        }));

        // Merge on-menu predictions + off-menu items
        const allItems = [...predictedItems, ...offMenuItems];

        res.status(200).json({
            district,
            targetDate,
            weather: {
                tempMaxC: weather.temp,
                precipitationMm: weather.precip,
                alert: Boolean(weatherSeverity)
            },
            macroPeriod: macroName,
            isHoliday: Boolean(isHoliday),
            bufferMultiplier,
            modelRmse: mlBatchRes.data.rmse_used,
            modelVersion: mlBatchRes.data.model_version,
            items: allItems
        });
    } catch (error) {
        console.error("Error in getBatchCookPlan:", error.message);
        res.status(500).json({ error: "Failed to generate batch cook plan", details: error.message });
    }
};

exports.logLeftovers = async (req, res) => {
    try {
        const { logId, actualPreparedQty, leftoverQty } = req.body;
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({ 
                message: "Leftovers logged (offline mode: MongoDB not connected).", 
                data: { _id: logId, actualPreparedQty, leftoverQty } 
            });
        }
        const log = await DailyLog.findById(logId);
        if (!log) return res.status(404).json({ error: "Log not found" });
        if (log.isClosed) return res.status(400).json({ error: "Log is already closed" });

        const prepared = Number(actualPreparedQty);
        const leftover = Number(leftoverQty);
        const consumed = Math.max(0, prepared - leftover);
        const portionKg = log.portionWeightKg || 0.35;
        const wasteKg = parseFloat((leftover * portionKg).toFixed(1));
        const costPerPortion = log.financials?.costPerPortion || 40;

        log.actuals = {
            actualPreparedPortions: prepared,
            leftoverPortions: leftover,
            consumedPortions: consumed,
            wasteKg: wasteKg,
            stockoutFlag: leftover === 0 && prepared <= (log.prediction?.baselineDemand || 0)
        };

        if (log.financials) {
            log.financials.costOfWaste = leftover * costPerPortion;
        }

        log.isClosed = true;
        await log.save();

        res.status(200).json({ message: "Leftovers logged and log closed.", data: log });
    } catch (error) {
        console.error("Error in logLeftovers:", error.message);
        res.status(500).json({ error: "Failed to log leftovers", details: error.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({ totalWaste: 0, totalWasteKg: 0, totalCostLost: 0, avgAbsoluteError: 0 });
        }
        const { district } = req.query;
        const match = { isClosed: true };
        if (district && district !== 'all') {
            match.district = district.toLowerCase();
        }

        const stats = await DailyLog.aggregate([
            { $match: match },
            { 
                $group: {
                    _id: null,
                    totalWaste: { $sum: "$actuals.leftoverPortions" },
                    totalWasteKg: { $sum: "$actuals.wasteKg" },
                    totalCostLost: { $sum: "$financials.costOfWaste" },
                    avgAbsoluteError: { 
                        $avg: { 
                            $abs: { 
                                $subtract: [
                                    { $ifNull: ["$prediction.baselineDemand", 0] }, 
                                    { $ifNull: ["$actuals.consumedPortions", 0] }
                                ] 
                            } 
                        } 
                    }
                }
            }
        ]);
        res.status(200).json(stats[0] || { totalWaste: 0, totalWasteKg: 0, totalCostLost: 0, avgAbsoluteError: 0 });
    } catch (error) {
        console.error("Error in getAnalytics:", error.message);
        res.status(500).json({ error: "Failed to fetch analytics", details: error.message });
    }
};

exports.getOpenLogs = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json([]);
        }
        const { district } = req.query;
        const query = { isClosed: false };
        if (district && district !== 'all') {
            query.district = district.toLowerCase();
        }
        const logs = await DailyLog.find(query).sort({ date: -1 });
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error in getOpenLogs:", error.message);
        res.status(500).json({ error: "Failed to fetch open logs", details: error.message });
    }
};
