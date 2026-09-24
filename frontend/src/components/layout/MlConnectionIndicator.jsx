// frontend/src/components/layout/MlConnectionIndicator.jsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function MlConnectionIndicator() {
  const { mlHealth, isCheckingMl, setIsMlModalOpen } = useDashboard();

  if (mlHealth.connected) {
    return (
      <button
        onClick={() => setIsMlModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#e5e2e1] bg-white hover:border-[#1c1b1b] text-xs font-mono transition-all text-[#1c1b1b] shadow-2xs cursor-pointer select-none"
        title="ML Microservice is connected. Click to view diagnostics."
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
        <span className="font-bold tracking-tight hidden md:inline">XGBoost Live</span>
        <span className="font-bold tracking-tight md:hidden">ML Live</span>
        {mlHealth.latencyMs && (
          <span className="text-[10px] text-[#777771] hidden lg:inline">
            ({mlHealth.latencyMs}ms)
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => setIsMlModalOpen(true)}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#ffdcc3] bg-[#fffaf5] hover:bg-[#fff0e0] text-xs font-mono transition-all text-[#c76c00] shadow-xs cursor-pointer select-none animate-pulse"
      title="ML Microservice is offline! Click to connect it."
    >
      {isCheckingMl ? (
        <RefreshCw className="w-3 h-3 animate-spin shrink-0 text-[#c76c00]" />
      ) : (
        <AlertTriangle className="w-3 h-3 shrink-0 text-[#c76c00]" />
      )}
      <span className="font-bold tracking-tight">Connect ML</span>
    </button>
  );
}
