// frontend/src/components/layout/Header.jsx
import React from 'react';
import { 
  Bell, 
  User, 
  Lock
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { DISTRICT_METADATA } from '../../data/mockCanteenData';

export default function Header() {
  const { 
    currentUser, 
    isAdmin, 
    selectedDistrict, 
    setSelectedDistrict, 
    currentDistrictMeta,
    setIsRoleMenuOpen,
    isRoleMenuOpen
  } = useDashboard();

  return (
    <header className="w-full border-b border-[#e5e2e1]/80 bg-[#fdf8f7]/90 backdrop-blur-md py-3.5 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Active Subtitle */}
      <div className="flex items-center gap-3">
        <img 
          src="/logo-icon.png" 
          alt="Smart Canteen Logo" 
          className="w-8 h-8 md:w-9 md:h-9 object-contain shrink-0 drop-shadow-xs transition-transform hover:scale-105" 
        />
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-space text-lg font-bold tracking-tight text-[#1c1b1b]">
            Smart Canteen
          </span>
          <span className="text-xs text-[#777771] font-medium flex items-center gap-1.5">
            <span>Central Kitchen • {currentDistrictMeta.fullName}</span>
            {!isAdmin && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#ebe7e6] text-[#474741]">
                <Lock className="w-2.5 h-2.5" /> Locked Branch
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Right Action Icons & District Selector */}
      <div className="flex items-center gap-4">
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

        {/* Notification Bell */}
        <button 
          onClick={() => alert('No unacknowledged food waste alarms.')}
          className="p-1.5 text-[#474741] hover:text-[#1c1b1b] hover:bg-[#f1edec] rounded transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[1.75]" />
        </button>

        {/* Profile Avatar Trigger */}
        <button 
          onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
          className="p-1 rounded-full border border-[#e5e2e1] hover:border-[#1c1b1b] transition-colors"
          title={`Logged in as: ${currentUser.name} (${currentUser.role})`}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}
