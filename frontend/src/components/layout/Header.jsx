// frontend/src/components/layout/Header.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Lock,
  Compass,
  ChevronDown,
  Sliders,
  Eye
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { DISTRICT_METADATA } from '../../data/mockCanteenData';
import PersonaSwitcher from './PersonaSwitcher';
import MlConnectionIndicator from './MlConnectionIndicator';

const MOBILE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Executive KPIs' },
  { id: 'waste-split', label: 'Waste Breakdown' },
  { id: 'inventory', label: 'Perishable Stock' },
  { id: 'performance', label: 'Meal Rankings' },
  { id: 'plate-vs-prep', label: 'Plate vs. Prep' },
  { id: 'forecast-horizon', label: 'Forecast Horizon' },
  { id: 'batch-plan', label: 'Batch Schedule' },
  { id: 'ap-map', label: 'Regional Network', adminOnly: true },
  { id: 'analytics', label: 'Shift Telemetry' },
  { id: 'impact', label: 'Impact & Savings' },
];

export default function Header() {
  const { 
    currentUser, 
    isAdmin, 
    selectedDistrict, 
    setSelectedDistrict, 
    currentDistrictMeta,
    isNerdMode,
    toggleNerdMode
  } = useDashboard();

  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isMobileSectionOpen, setIsMobileSectionOpen] = useState(false);
  const headerMenuRef = useRef(null);
  const mobileNavRef = useRef(null);

  const visibleMobileItems = useMemo(() => {
    return MOBILE_NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);
  }, [isAdmin]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
        setIsHeaderMenuOpen(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        setIsMobileSectionOpen(false);
      }
    }
    if (isHeaderMenuOpen || isMobileSectionOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHeaderMenuOpen, isMobileSectionOpen]);

  return (
    <header className="w-full border-b border-[#e5e2e1]/80 bg-[#fdf8f7]/90 backdrop-blur-md py-3 px-4 sm:px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Active Subtitle */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <a href="#dashboard" className="flex items-center gap-2.5">
          <img 
            src="/logo-icon.png" 
            alt="Smart Canteen Logo" 
            className="w-8 h-8 md:w-9 md:h-9 object-contain shrink-0 drop-shadow-xs transition-transform hover:scale-105" 
          />
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2.5">
            <span className="font-space text-base sm:text-lg font-bold tracking-tight text-[#1c1b1b]">
              Smart Canteen
            </span>
            <span className="text-[11px] sm:text-xs text-[#777771] font-medium flex items-center gap-1.5">
              <span>Central Kitchen • {currentDistrictMeta.fullName}</span>
              {!isAdmin && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#ebe7e6] text-[#474741] font-mono">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              )}
            </span>
          </div>
        </a>
      </div>

      {/* Right Action Icons & District Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ML Model Connection Health Indicator */}
        <MlConnectionIndicator />

        {/* Nerd Mode / Floor View Toggle */}
        <button
          type="button"
          onClick={toggleNerdMode}
          title={isNerdMode ? 'Switch to Simple Floor View' : 'Switch to Detailed Telemetry (Nerd Mode)'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-space transition-all duration-200 select-none shadow-2xs cursor-pointer ${
            isNerdMode
              ? 'bg-[#1c1b1b] text-white border-[#1c1b1b] shadow-xs'
              : 'bg-white text-[#1c1b1b] border-[#1c1b1b] hover:bg-neutral-100'
          }`}
        >
          {isNerdMode ? (
            <>
              <Sliders className="w-3.5 h-3.5" />
              <span className="font-bold tracking-tight hidden sm:inline">Nerd Mode</span>
              <span className="text-[10px] font-mono px-1 py-0.2 bg-white/20 text-white rounded font-bold uppercase">
                ON
              </span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span className="font-semibold tracking-tight hidden sm:inline">Floor View</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1c1b1b]" />
            </>
          )}
        </button>

        {/* Admin District Selector Tabs */}
        {isAdmin && (
          <div className="hidden sm:flex items-center bg-[#f1edec] rounded p-0.5 border border-[#e5e2e1] text-xs font-space">
            {Object.keys(DISTRICT_METADATA).map((distKey) => {
              const isSelected = selectedDistrict === distKey;
              return (
                <button
                  key={distKey}
                  onClick={() => setSelectedDistrict(distKey)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-all capitalize ${
                    isSelected
                      ? 'bg-[#1c1b1b] text-white font-bold shadow-2xs'
                      : 'text-[#777771] hover:text-[#1c1b1b]'
                  }`}
                >
                  {distKey}
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile Section Nav Trigger */}
        <div className="relative md:hidden" ref={mobileNavRef}>
          <button
            onClick={() => setIsMobileSectionOpen(!isMobileSectionOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-white border border-[#e5e2e1] rounded-xl text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            title="Jump to Section"
          >
            <Compass className="w-3.5 h-3.5 text-slate-800" />
            <span className="text-[11px] font-space">Menu</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isMobileSectionOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 ring-1 ring-slate-900/5 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Mobile Nerd Mode toggle */}
              <div className="p-2 border-b border-slate-100 flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 font-space flex items-center gap-1.5">
                  {isNerdMode ? <Sliders className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isNerdMode ? 'Nerd Mode' : 'Floor View'}</span>
                </span>
                <button
                  onClick={toggleNerdMode}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase transition-colors ${
                    isNerdMode ? 'bg-[#1c1b1b] text-white' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {isNerdMode ? 'Disable' : 'Enable'}
                </button>
              </div>

              <div className="text-[10px] font-space font-bold uppercase tracking-wider text-slate-400 px-2 py-1 border-b border-slate-100 mb-1">
                Jump to Section
              </div>
              <div className="space-y-0.5 max-h-60 overflow-y-auto">
                {visibleMobileItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsMobileSectionOpen(false);
                      const el = document.getElementById(item.id);
                      if (el) {
                        const offset = el.getBoundingClientRect().top + window.pageYOffset - 76;
                        window.scrollTo({ top: offset, behavior: 'smooth' });
                      }
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button 
          onClick={() => alert('No unacknowledged food waste alarms.')}
          className="p-1.5 text-[#474741] hover:text-[#1c1b1b] hover:bg-[#f1edec] rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[1.75]" />
        </button>

        {/* Profile Avatar Trigger & Dropdown */}
        <div className="relative" ref={headerMenuRef}>
          <button 
            id="header-avatar-btn"
            onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
            className="flex items-center gap-2 p-1 sm:pl-2.5 sm:pr-1 rounded-full border border-[#e5e2e1] hover:border-[#1c1b1b] bg-white/80 hover:bg-white transition-all shadow-xs"
            title={`Logged in as: ${currentUser.name} (${currentUser.role}) - Click to switch persona`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-mono capitalize leading-tight">
                {isAdmin ? '👑 Statewide' : `🔒 ${currentUser.assignedDistrict}`}
              </p>
            </div>
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <span 
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                  isAdmin ? 'bg-slate-900' : 'bg-emerald-600'
                }`} 
              />
            </div>
          </button>

          {isHeaderMenuOpen && (
            <PersonaSwitcher 
              placement="dropdown" 
              onClose={() => setIsHeaderMenuOpen(false)} 
            />
          )}
        </div>
      </div>
    </header>
  );
}
