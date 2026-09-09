// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardProvider } from './context/DashboardContext';
import NavigationRail from './components/layout/NavigationRail';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <DashboardProvider>
      <Router>
        <div 
          className="min-h-screen text-[#1c1b1b] flex flex-col selection:bg-[#d0e5d2] relative"
          style={{
            backgroundImage: "url('/dashboard-bg.png')",
            backgroundRepeat: 'repeat',
            backgroundPosition: 'top left',
            backgroundAttachment: 'fixed',
            backgroundSize: '800px auto',
            backgroundColor: '#fdf8f7'
          }}
        >
          {/* Top Full-Width Header with translucent blur */}
          <Header />

          {/* Main Dashboard Canvas - Offset from left rail with pl-24 */}
          <main className="flex-1 w-full max-w-7xl mx-auto pl-24 pr-5 sm:pr-8 md:pr-12 py-8 min-w-0 pb-12">
            <Routes>
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>

          {/* Floating Left Navigation Rail (Vertically Centered) */}
          <NavigationRail />
        </div>
      </Router>
    </DashboardProvider>
  );
}

export default App;
