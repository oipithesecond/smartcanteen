import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function Dashboard() {
  const [analytics, setAnalytics] = useState({ totalWaste: 0, totalCostLost: 0, avgAbsoluteError: 0 });
  const [loading, setLoading] = useState(true);

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

    </div>
  );
}

export default Dashboard;
