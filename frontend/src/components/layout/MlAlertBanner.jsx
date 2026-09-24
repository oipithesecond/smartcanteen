// frontend/src/components/layout/MlAlertBanner.jsx
import React from 'react';
import { AlertTriangle, Terminal, RefreshCw, X } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function MlAlertBanner() {
  const { mlHealth, checkMlHealth, isCheckingMl, setIsMlModalOpen } = useDashboard();
  const [dismissed, setDismissed] = React.useState(false);

  // Only display when ML is confirmed disconnected and user hasn't dismissed this session
  if (mlHealth.connected || dismissed) return null;

  return (
    <div className="w-full bg-[#fffaf5] border-y border-[#ffdcc3] px-4 sm:px-6 md:px-12 py-2.5 flex items-center justify-between text-xs text-[#474741] animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertTriangle className="w-4 h-4 text-[#c76c00] shrink-0" />
        <div className="truncate">
          <span className="font-bold text-[#1c1b1b] font-space mr-1.5">ML Microservice Offline:</span>
          <span>Predictions are using local baseline estimates. Connect the XGBoost engine for live weather & dietary inference.</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        <button
          onClick={() => setIsMlModalOpen(true)}
          className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-[#1c1b1b] text-white hover:bg-black transition-colors cursor-pointer shadow-xs flex items-center gap-1"
        >
          <Terminal className="w-3 h-3" />
          <span>Connect Model</span>
        </button>

        <button
          onClick={() => checkMlHealth()}
          disabled={isCheckingMl}
          className="p-1 text-[#777771] hover:text-[#1c1b1b] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Retry Connection"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCheckingMl ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-[#777771] hover:text-[#1c1b1b] rounded-lg transition-colors cursor-pointer"
          title="Dismiss warning"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
