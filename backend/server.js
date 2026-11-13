require('dotenv').config();
const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    // ignore if not supported in environment
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { 
    predictDemand, 
    getBatchCookPlan, 
    logLeftovers, 
    getAnalytics, 
    getOpenLogs,
    logScaleReading,
    getLatestScaleReading,
    resetScaleReading
} = require('./controllers/canteenController');
const macroController = require('./controllers/macroController');
const { login, signup, me } = require('./controllers/authController');
const { authMiddleware } = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas (if URI configured)
const MONGO_URI = process.env.MONGODB_URI;
if (MONGO_URI) {
    mongoose.connect(MONGO_URI, { dbName: 'smartcanteen' })
        .then(() => console.log('✅ Connected to MongoDB Atlas (database: smartcanteen)'))
        .catch(err => console.error('❌ MongoDB connection error:', err.message));
} else {
    mongoose.set('bufferCommands', false);
    console.log('ℹ️  No MONGODB_URI found. Running in local operational mode (ML inference & weather active).');
}

const axios = require('axios');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// ── Auth Routes ────────────────────────────────────────────────────
app.post('/api/auth/login', login);
app.post('/api/auth/signup', signup);
app.get('/api/auth/me', authMiddleware, me);

// Root Landing & Status Route
app.get('/', (req, res) => {
    res.json({
        service: "Smart Canteen Node.js API Gateway",
        status: "online",
        port: PORT,
        frontendUrl: "http://localhost:5173",
        endpoints: {
            auth: { login: "POST /api/auth/login", me: "GET /api/auth/me" },
            mlHealth: "/api/ml-health",
            dbHealth: "/api/db-health",
            batchPlan: "/api/batch-plan?district=amaravati",
            analytics: "/api/analytics",
            openLogs: "/api/open-logs",
            macros: "/api/macros"
        }
    });
});

// Operational & ML Routes
app.post('/api/predict', predictDemand);
app.get('/api/batch-plan', getBatchCookPlan);
app.post('/api/batch-plan', getBatchCookPlan);
app.put('/api/log-leftovers', logLeftovers);
app.get('/api/analytics', getAnalytics);
app.get('/api/open-logs', getOpenLogs);

// IoT Weight Scale Routes (Raspberry Pi)
app.post('/api/scale/log-weight', logScaleReading);
app.get('/api/scale/latest', getLatestScaleReading);
app.post('/api/scale/reset', resetScaleReading);
app.delete('/api/scale/latest', resetScaleReading);

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


// Real-time Database Health Check Route
app.get('/api/db-health', (req, res) => {
    const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    const readyState = mongoose.connection.readyState;
    const isConnected = readyState === 1;
    res.json({
        connected: isConnected,
        status: stateMap[readyState] || 'unknown',
        database: isConnected ? (mongoose.connection.name || 'smartcanteen') : null,
        host: isConnected ? mongoose.connection.host : null,
        readyState,
        checkedAt: new Date().toISOString()
    });
});

app.get('/api/macros', macroController.getMacros);
app.post('/api/macros', macroController.addMacro);
app.delete('/api/macros/:id', macroController.deleteMacro);

const PORT = process.env.PORT || 5005;
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
    console.log(`Node.js API Gateway running on http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
    console.error('API Gateway server error:', err);
});
