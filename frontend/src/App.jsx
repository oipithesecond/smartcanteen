import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MenuPlanner from './pages/MenuPlanner';
import EndOfDay from './pages/EndOfDay';
import MacroPeriods from './pages/MacroPeriods';

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "text-blue-200 border-b-2 border-blue-200 pb-1" : "hover:text-blue-200";

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-wider">Canteen AI System</Link>
        <div className="space-x-6">
          <Link to="/" className={isActive("/")}>Dashboard</Link>
          <Link to="/plan" className={isActive("/plan")}>Menu Planner</Link>
          <Link to="/end-of-day" className={isActive("/end-of-day")}>End of Day (Leftovers)</Link>
          <Link to="/macros" className={isActive("/macros")}>Macro Periods</Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plan" element={<MenuPlanner />} />
            <Route path="/end-of-day" element={<EndOfDay />} />
            <Route path="/macros" element={<MacroPeriods />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
