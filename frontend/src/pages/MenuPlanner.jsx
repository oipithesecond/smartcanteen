import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005/api';

const DUMMY_ITEMS = [
  { name: "Chicken Dum Biryani", category: "Non_Veg_Mains", cost: 70, penalty: 100 },
  { name: "Paneer Butter Masala", category: "Veg_Mains", cost: 40, penalty: 60 },
  { name: "White Rice", category: "Staples", cost: 10, penalty: 20 },
  { name: "Mudda Pappu", category: "Veg_Mains", cost: 15, penalty: 25 },
];

function MenuPlanner() {
  const [targetDate, setTargetDate] = useState('');
  const [selectedItem, setSelectedItem] = useState(DUMMY_ITEMS[0].name);
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!targetDate) return alert("Select a date!");
    
    setLoading(true);
    setPredictionResult(null);

    const item = DUMMY_ITEMS.find(i => i.name === selectedItem);

    // We send base features, backend computes weather/holidays/macros
    const payload = {
      targetDate: targetDate,
      features: {
        item_name: item.name,
        category: item.category,
        cost_per_portion: item.cost,
        shortage_penalty: item.penalty,
        department_meeting_flag: 0,
        leave_rate_percentage: 0.05,
        special_menu_flag: 0,
        demand_lag_1: 150, // These would normally be fetched from history
        demand_lag_7: 145, 
        rolling_mean_7d: 148,
        rolling_std_7d: 5.2,
      }
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/predict`, payload);
      setPredictionResult(res.data);
    } catch (err) {
      alert("Failed to predict. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Plan Tomorrow's Menu</h2>
      <form onSubmit={handlePredict} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Target Date</label>
          <input 
            type="date" 
            value={targetDate} 
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Menu Item</label>
          <select 
            value={selectedItem} 
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full border rounded p-2"
          >
            {DUMMY_ITEMS.map(item => (
              <option key={item.name} value={item.name}>{item.name}</option>
            ))}
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Predicting...' : 'Get Optimal Cook Quantity'}
        </button>
      </form>

      {predictionResult && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded">
          <h3 className="text-xl font-bold text-green-800 mb-2">Prediction Success!</h3>
          <p className="mb-2"><strong>Optimal Cook Quantity:</strong> {predictionResult.data.optimalCookQty} portions</p>
          <p className="mb-2"><strong>Raw Predicted Demand:</strong> {predictionResult.data.predictedDemand} portions</p>
          
          <h4 className="font-bold mt-4 mb-1 text-gray-700">Real-World Data Detected:</h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Weather: {predictionResult.weather.temp}°C, {predictionResult.weather.precip}mm rain</li>
            <li>Macro Period: {predictionResult.macroName}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default MenuPlanner;
