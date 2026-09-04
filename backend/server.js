require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { predictDemand, logLeftovers, getAnalytics } = require('./controllers/canteenController');

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.post('/api/predict', predictDemand);
app.put('/api/log-leftovers', logLeftovers);
app.get('/api/analytics', getAnalytics);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Node.js API Gateway running on port ${PORT}`);
});
