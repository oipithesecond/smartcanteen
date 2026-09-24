require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { 
    predictDemand, 
    getBatchCookPlan, 
    logLeftovers, 
    getAnalytics, 
    getOpenLogs 
} = require('./controllers/canteenController');
const macroController = require('./controllers/macroController');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas (if URI configured)
const MONGO_URI = process.env.MONGODB_URI;
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('✅ Connected to MongoDB Atlas'))
        .catch(err => console.error('❌ MongoDB connection error:', err.message));
} else {
    mongoose.set('bufferCommands', false);
    console.log('ℹ️  No MONGODB_URI found. Running in local operational mode (ML inference & weather active).');
}

const axios = require('axios');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// Operational & ML Routes
app.post('/api/predict', predictDemand);
app.get('/api/batch-plan', getBatchCookPlan);
app.post('/api/batch-plan', getBatchCookPlan);
app.put('/api/log-leftovers', logLeftovers);
app.get('/api/analytics', getAnalytics);
app.get('/api/open-logs', getOpenLogs);

// Real-time ML Health Check Route
app.get('/api/ml-health', async (req, res) => {
    const startTime = Date.now();
    try {
        await axios.get(`${ML_SERVICE_URL}/docs`, { timeout: 2500 });
        const latencyMs = Date.now() - startTime;
        res.json({
            connected: true,
            status: "online",
            serviceUrl: ML_SERVICE_URL,
            modelName: "XGBoost v1.0 Regressor",
            rmse: 14.26,
            featuresCount: 18,
            latencyMs,
            checkedAt: new Date().toISOString()
        });
    } catch (err) {
        res.json({
            connected: false,
            status: "offline",
            serviceUrl: ML_SERVICE_URL,
            error: err.message,
            command: "python -m uvicorn main:app --host 127.0.0.1 --port 8000",
            checkedAt: new Date().toISOString()
        });
    }
});


// Macro Period Routes
app.get('/api/macros', macroController.getMacros);
app.post('/api/macros', macroController.addMacro);
app.delete('/api/macros/:id', macroController.deleteMacro);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Node.js API Gateway running on port ${PORT}`);
});
