import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function Dashboard() {
  const [analytics, setAnalytics] = useState({ totalWaste: 0, totalCostLost: 0, avgAbsoluteError: 0 });
  const [loading, setLoading] = useState(true);

  const handleRunPrediction = async () => {
    try {
      const payload = {
        item_name: "Chicken Dum Biryani",
        category: "Non_Veg_Mains",
        is_on_menu: 1,
        day_of_week: 2,
        is_holiday: 0,
        days_to_payday: 15,
        is_long_weekend: 0,
        precipitation_mm: 0,
        temp_max_c: 30,
        weather_severity_alert: 0,
        department_meeting_flag: 0,
        leave_rate_percentage: 0.05,
        macro_dietary_period: "None",
        recurring_meatless_day: 0,
        special_menu_flag: 0,
        demand_lag_1: 150,
        demand_lag_7: 145,
        rolling_mean_7d: 148,
        rolling_std_7d: 5.2,
        cost_per_portion: 70,
        shortage_penalty: 100
      };
      
      const res = await axios.post(`${API_BASE_URL}/predict`, payload);
      alert(`Prediction created! Optimal cook qty: ${res.data.data.optimalCookQty}`);
      // Refresh analytics after prediction
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      alert("Failed to predict. Ensure Python microservice and Node backend are running.");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Canteen Manager Dashboard</h1>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Total Waste (Portions)</h2>
          <p className="text-3xl font-semibold text-red-600">{analytics.totalWaste}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Total Cost Lost</h2>
          <p className="text-3xl font-semibold text-red-600">Rs. {analytics.totalCostLost.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Avg Prediction Error</h2>
          <p className="text-3xl font-semibold text-blue-600">{analytics.avgAbsoluteError.toFixed(1)} portions</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <p className="text-gray-600 mb-4">Run a test prediction to simulate the end-to-end pipeline.</p>
        <button 
          onClick={handleRunPrediction}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Generate Test Prediction
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
