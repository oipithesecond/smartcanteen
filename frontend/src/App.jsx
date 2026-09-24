// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardProvider } from './context/DashboardContext';
import NavigationRail from './components/layout/NavigationRail';
import Header from './components/layout/Header';
import MlAlertBanner from './components/layout/MlAlertBanner';
import MlConnectModal from './components/layout/MlConnectModal';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <DashboardProvider>
      <Router>
        <div className="min-h-screen text-[#1c1b1b] flex flex-col selection:bg-[#d0e5d2] relative bg-[#fdf8f7]">
          {/* Isolated Hardware-Accelerated Fixed Background Layer */}
          <div 
            className="fixed inset-0 pointer-events-none z-0 transform-gpu"
            style={{
              backgroundImage: "url('/dashboard-bg.png')",
              backgroundRepeat: 'repeat',
              backgroundPosition: 'top left',
              backgroundSize: '800px auto'
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col min-h-screen">
            {/* Top Full-Width Header with translucent blur */}
            <Header />

            {/* Real-time ML Connection Warning Banner (if offline) */}
            <MlAlertBanner />

            {/* Main Dashboard Canvas - Responsive offset from left rail */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:pl-24 md:pr-8 lg:pr-12 py-6 md:py-8 min-w-0 pb-16 md:pb-12">
              <Routes>
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </main>

            {/* Floating Left Navigation Rail (Vertically Centered) */}
            <NavigationRail />

            {/* Interactive ML Connection Diagnostics Modal */}
            <MlConnectModal />
          </div>
        </div>
      </Router>
    </DashboardProvider>
  );
}

export default App;
