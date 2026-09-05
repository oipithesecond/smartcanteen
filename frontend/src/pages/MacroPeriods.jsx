import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5005/api';

function MacroPeriods() {
  const [macros, setMacros] = useState([]);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });

  const fetchMacros = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/macros`);
      setMacros(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMacros();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/macros`, form);
      fetchMacros();
      setForm({ name: '', startDate: '', endDate: '' });
    } catch (err) {
      alert("Failed to add macro period.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/macros/${id}`);
      fetchMacros();
    } catch (err) {
      alert("Failed to delete macro period.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Manage Cultural & Religious Periods</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow border mb-8 flex items-end space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Period Name (e.g. Ramadan)</label>
          <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded p-2" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input required type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full border rounded p-2" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input required type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full border rounded p-2" />
        </div>
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Add</button>
      </form>

      <div className="bg-white rounded shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {macros.map(m => (
              <tr key={m._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{m.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(m.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(m.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {macros.length === 0 && <div className="p-6 text-center text-gray-500">No active macro periods.</div>}
      </div>
    </div>
  );
}

export default MacroPeriods;
