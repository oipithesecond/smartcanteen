// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import NavigationRail from './components/layout/NavigationRail';
import Header from './components/layout/Header';
import MlAlertBanner from './components/layout/MlAlertBanner';
import MlConnectModal from './components/layout/MlConnectModal';
import Dashboard from './pages/Dashboard';
import FoodLogging from './pages/FoodLogging';
import Login from './pages/Login';

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen text-[#1c1b1b] flex flex-col selection:bg-[#d0e5d2] relative bg-[#fdf8f7]">
      {/* Seamless Minimalist Culinary Texture Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-60 transform-gpu"
        style={{
          backgroundImage: "url('/food-pattern.svg')",
          backgroundRepeat: 'repeat',
          backgroundPosition: 'top left',
          backgroundSize: '360px 360px'
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
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/log" 
              element={
                <ProtectedRoute>
                  <FoodLogging />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/logging" 
              element={
                <ProtectedRoute>
                  <FoodLogging />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="*" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>

        {/* Floating Left Navigation Rail (Vertically Centered) */}
        <NavigationRail />

        {/* Interactive ML Connection Diagnostics Modal */}
        <MlConnectModal />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DashboardProvider>
          <AppLayout />
        </DashboardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
