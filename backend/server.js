require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { predictDemand, logLeftovers, getAnalytics, getOpenLogs } = require('./controllers/canteenController');
const macroController = require('./controllers/macroController');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/predict', predictDemand);
app.put('/api/log-leftovers', logLeftovers);
app.get('/api/analytics', getAnalytics);
app.get('/api/open-logs', getOpenLogs);

// Macro Period Routes
app.get('/api/macros', macroController.getMacros);
app.post('/api/macros', macroController.addMacro);
app.delete('/api/macros/:id', macroController.deleteMacro);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Node.js API Gateway running on port ${PORT}`);
});
