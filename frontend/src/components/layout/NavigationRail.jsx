// frontend/src/components/layout/NavigationRail.jsx
import React, { useRef, useEffect } from 'react';
import { 
  LayoutGrid, 
  UtensilsCrossed, 
  Soup, 
  Calendar, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  ChefHat, 
  Check 
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const DOCK_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'waste-split', label: 'Waste Breakdown', icon: Soup },
  { id: 'performance', label: 'Meal Performance', icon: UtensilsCrossed },
  { id: 'batch-plan', label: 'Batch Schedule', icon: Calendar },
  { id: 'analytics', label: 'Shift Telemetry', icon: TrendingUp },
  { id: 'inventory', label: 'Inventory Stock', icon: FileText },
];

export default function NavigationRail() {
  const { 
    activeNav, 
    setActiveNav, 
    currentUser, 
    switchUser, 
    usersList, 
    isRoleMenuOpen, 
    setIsRoleMenuOpen,
    isAdmin
  } = useDashboard();

  const menuRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsRoleMenuOpen(false);
      }
    }
    if (isRoleMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleMenuOpen, setIsRoleMenuOpen]);

  const handleNavClick = (id) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      aria-label="Floating Left Navigation Dock"
      className="fixed left-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3.5 py-3.5 px-2.5 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_40px_-6px_rgba(15,23,42,0.18)] ring-1 ring-white"
    >
      {/* Brand Anchor Logo */}
      <a 
        href="#dashboard" 
        onClick={(e) => { e.preventDefault(); handleNavClick('dashboard'); }}
        className="w-8 h-8 rounded-full flex items-center justify-center p-0.5 hover:scale-110 active:scale-95 transition-transform focus:outline-none"
        title="Smart Canteen Waste Management"
      >
        <img src="/logo-icon.png" alt="Smart Canteen" className="w-full h-full object-contain" />
      </a>

      {/* Hairline Divider */}
      <div className="w-5 h-[1px] bg-slate-200/90 shrink-0" />

      {/* Vertical Icon Buttons */}
      <div className="flex flex-col items-center gap-2">
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={item.label}
              className={`relative p-2.5 rounded-full flex items-center justify-center transition-all duration-200 group ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/90'
              }`}
            >
              <Icon className={`w-4 h-4 stroke-[2] shrink-0 ${isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-950'}`} />

              {/* Tooltip on hover docked to the right of the left rail */}
              <span className="absolute left-full ml-3.5 px-2.5 py-1 text-xs font-space font-medium text-white bg-slate-900 rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hairline Divider */}
      <div className="w-5 h-[1px] bg-slate-200/90 my-0.5 shrink-0" />

      {/* User Avatar with Popover to the right */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
          className="relative p-0.5 rounded-full ring-2 ring-white hover:ring-slate-400 transition-all focus:outline-none flex items-center shadow-xs"
          title="Switch Persona & Branch"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-300/80"
          />
          <span 
            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
              isAdmin ? 'bg-slate-900' : 'bg-[#506354]'
            }`} 
          />
        </button>

        {/* Role Switcher Popover - Floats to the Right of Left Rail */}
        {isRoleMenuOpen && (
          <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.22)] border border-slate-200/90 ring-1 ring-white p-3.5 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
            <div className="px-2 py-1 border-b border-slate-200 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-space font-bold uppercase tracking-wider text-slate-500">
                  Persona & Branch
                </span>
                <span className={`text-[10px] font-space font-bold px-2 py-0.5 rounded-md ${
                  isAdmin ? 'bg-slate-900 text-white' : 'bg-[#d0e5d2] text-[#0e1f13]'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">Toggle between Regional Head & Kitchen Floor</p>
            </div>

            <div className="space-y-1">
              {usersList.map((user) => {
                const isSelected = user.id === currentUser.id;
                const isUserAdmin = user.role === 'ADMIN';

                return (
                  <button
                    key={user.id}
                    onClick={() => switchUser(user)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                      isSelected 
                        ? 'bg-slate-100 text-slate-900 font-semibold' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 truncate">{user.name}</span>
                        {isUserAdmin ? (
                          <ShieldCheck className="w-3 h-3 text-slate-900 shrink-0" />
                        ) : (
                          <ChefHat className="w-3 h-3 text-[#506354] shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{user.roleLabel}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
