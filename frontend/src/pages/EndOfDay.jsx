import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005/api';

function EndOfDay() {
  const [openLogs, setOpenLogs] = useState([]);
  const [inputs, setInputs] = useState({});

  const fetchOpenLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/open-logs`);
      setOpenLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOpenLogs();
  }, []);

  const handleInputChange = (id, field, value) => {
    setInputs({
      ...inputs,
      [id]: { ...inputs[id], [field]: Number(value) }
    });
  };

  const handleSubmit = async (logId, preparedQty) => {
    const leftoverQty = inputs[logId]?.leftovers || 0;
    try {
      await axios.put(`${API_BASE_URL}/log-leftovers`, {
        logId,
        actualPreparedQty: preparedQty,
        leftoverQty
      });
      alert("Leftovers logged successfully!");
      fetchOpenLogs();
    } catch (err) {
      alert("Failed to close log.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">End of Day: Log Leftovers</h2>
      {openLogs.length === 0 ? (
        <p className="text-gray-500">No open logs. Plan some menus first!</p>
      ) : (
        <div className="space-y-4">
          {openLogs.map(log => (
            <div key={log._id} className="bg-white p-6 rounded shadow border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{log.itemName}</h3>
                <p className="text-sm text-gray-500">Date: {new Date(log.date).toLocaleDateString()}</p>
                <p className="text-sm font-medium text-blue-600">Optimal Cook Qty: {log.optimalCookQty}</p>
              </div>
              <div className="flex items-end space-x-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Leftovers (Waste)</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="e.g. 5"
                    onChange={(e) => handleInputChange(log._id, 'leftovers', e.target.value)}
                    className="w-24 border rounded p-2 text-center"
                  />
                </div>
                <button 
                  onClick={() => handleSubmit(log._id, log.optimalCookQty)}
                  className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
                >
                  Close Day
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EndOfDay;
