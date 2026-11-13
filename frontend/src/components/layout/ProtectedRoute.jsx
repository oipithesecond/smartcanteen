// frontend/src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While checking token validity on mount, render a minimal loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdf8f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo-icon.png" alt="Smart Canteen" className="w-10 h-10 object-contain animate-pulse" />
          <span className="text-xs font-space text-[#777771] tracking-wide">Authenticating…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to /login, preserving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
