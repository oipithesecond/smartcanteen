// frontend/src/components/layout/MlConnectModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Cpu, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Check, 
  Terminal
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function MlConnectModal() {
  const { 
    mlHealth, 
    checkMlHealth, 
    isCheckingMl, 
    isMlModalOpen, 
    setIsMlModalOpen 
  } = useDashboard();

  const [copied, setCopied] = useState(false);

  // Close on Escape key & prevent background scrolling
  useEffect(() => {
    if (!isMlModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMlModalOpen(false);
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMlModalOpen, setIsMlModalOpen]);

  if (!isMlModalOpen) return null;

  const command = "cd smartcanteen/ml_service && python -m uvicorn main:app --host 127.0.0.1 --port 8000";

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={() => setIsMlModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-lg bg-white border border-[#e5e2e1] rounded-3xl p-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMlModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-[#777771] hover:text-[#1c1b1b] hover:bg-[#f1edec] rounded-full transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#e5e2e1]">
          <div className="w-10 h-10 rounded-2xl bg-[#f7f3f2] border border-[#e5e2e1] flex items-center justify-center text-[#1c1b1b] shrink-0">
            <Cpu className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-[#777771] uppercase">
              SYSTEM DIAGNOSTICS
            </div>
            <h2 className="text-lg font-bold text-[#1c1b1b] font-space">
              ML Model Connection Status
            </h2>
          </div>
        </div>

        {/* Dynamic Connection Status Section */}
        {mlHealth.connected ? (
          /* CONNECTED STATE */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#fcfaf9] border border-[#e5e2e1]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#1c1b1b] uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>XGBoost Microservice Online</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-300 text-[#1c1b1b] font-bold">
                  HTTP 200 OK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-white rounded-xl border border-[#e5e2e1]">
                  <div className="text-[10px] text-[#777771]">ENDPOINT</div>
                  <div className="font-bold text-[#1c1b1b] truncate mt-0.5">{mlHealth.serviceUrl || 'http://127.0.0.1:8000'}</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#e5e2e1]">
                  <div className="text-[10px] text-[#777771]">LATENCY</div>
                  <div className="font-bold text-[#1c1b1b] mt-0.5">{mlHealth.latencyMs ? `${mlHealth.latencyMs} ms` : '< 15 ms'}</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#e5e2e1]">
                  <div className="text-[10px] text-[#777771]">MODEL TYPE</div>
                  <div className="font-bold text-[#1c1b1b] mt-0.5">XGBoost Regressor</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#e5e2e1]">
                  <div className="text-[10px] text-[#777771]">EVAL RMSE</div>
                  <div className="font-bold text-[#1c1b1b] mt-0.5">{mlHealth.rmse || 14.26} portions</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#474741] leading-relaxed">
              Live automated inference is active. Multi-feature demand forecasts and Newsvendor buffer allocations are recalculating on every operational shift.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e5e2e1]">
              <button
                onClick={() => checkMlHealth()}
                disabled={isCheckingMl}
                className="px-3.5 py-2 text-xs font-mono font-medium rounded-xl border border-[#e5e2e1] bg-white text-[#1c1b1b] hover:bg-[#f7f3f2] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingMl ? 'animate-spin' : ''}`} />
                <span>{isCheckingMl ? 'Testing...' : 'Test Live Ping'}</span>
              </button>
              <button
                onClick={() => setIsMlModalOpen(false)}
                className="px-4 py-2 text-xs font-space font-bold rounded-xl bg-[#1c1b1b] text-white hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* DISCONNECTED STATE */
          <div className="space-y-4">
            {/* Warning Alert Box */}
            <div className="p-4 rounded-2xl bg-[#fffaf5] border border-[#ffdcc3] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#c76c00] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-[#c76c00] font-space uppercase tracking-wider">
                  ML Microservice Offline
                </div>
                <p className="text-xs text-[#474741] mt-1 leading-relaxed">
                  The Python ML backend is not responding on <span className="font-mono text-[#1c1b1b]">http://127.0.0.1:8000</span>.
                  The dashboard is currently running in <strong>offline fallback mode</strong> using local baseline estimates.
                </p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <div className="text-xs font-bold text-[#1c1b1b] font-space flex items-center gap-1.5 mb-2">
                <Terminal className="w-3.5 h-3.5 text-[#1c1b1b]" />
                <span>How to Connect the ML Service:</span>
              </div>
              <p className="text-[11px] text-[#777771] mb-2 leading-relaxed">
                Open a terminal window and run the FastAPI server on port 8000:
              </p>

              <div className="bg-[#1c1b1b] text-white p-3 rounded-xl font-mono text-xs flex items-center justify-between gap-3 shadow-inner">
                <code className="truncate select-all text-neutral-200">
                  {command}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-neutral-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0 cursor-pointer"
                  title="Copy command"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-[#e5e2e1]">
              <span className="text-[11px] font-mono text-[#777771]">
                Status: {mlHealth.error || 'Connection refused'}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsMlModalOpen(false)}
                  className="w-1/2 sm:w-auto px-3.5 py-2 text-xs font-space font-medium rounded-xl border border-[#e5e2e1] bg-white text-[#777771] hover:bg-[#f7f3f2] transition-colors cursor-pointer text-center"
                >
                  Continue Offline
                </button>
                <button
                  onClick={() => checkMlHealth()}
                  disabled={isCheckingMl}
                  className="w-1/2 sm:w-auto px-4 py-2 text-xs font-space font-bold rounded-xl bg-[#1c1b1b] text-white hover:bg-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingMl ? 'animate-spin' : ''}`} />
                  <span>{isCheckingMl ? 'Checking...' : 'Retry Connection'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
