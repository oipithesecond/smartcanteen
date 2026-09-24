// frontend/src/components/layout/PersonaSwitcher.jsx
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ChefHat, 
  Check, 
  Lock, 
  Globe2, 
  X, 
  UserCheck 
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function PersonaSwitcher({ placement = 'right', onClose }) {
  const { 
    currentUser, 
    switchUser, 
    usersList, 
    isAdmin 
  } = useDashboard();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'admin' | 'kitchen'

  const adminUsers = useMemo(() => usersList.filter(u => u.role === 'ADMIN'), [usersList]);
  const kitchenUsers = useMemo(() => usersList.filter(u => u.role !== 'ADMIN'), [usersList]);

  const filteredUsers = useMemo(() => {
    if (activeTab === 'admin') return adminUsers;
    if (activeTab === 'kitchen') return kitchenUsers;
    return usersList;
  }, [activeTab, usersList, adminUsers, kitchenUsers]);

  const placementClasses = placement === 'dropdown'
    ? 'absolute right-0 top-full mt-2 w-84'
    : 'absolute left-full ml-3.5 bottom-0 w-84';

  return (
    <div 
      className={`${placementClasses} bg-white/98 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.22)] border border-slate-200/90 ring-1 ring-slate-900/5 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[82vh] flex flex-col`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with Title and Close Button */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-space font-bold uppercase tracking-wider text-slate-900">
            Demo Personas & RBAC
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close Switcher"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Persona Banner */}
      <div className="my-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-7 h-7 rounded-full object-cover border border-white shadow-xs shrink-0" 
          />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-900 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{currentUser.title}</p>
          </div>
        </div>
        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
          isAdmin ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {isAdmin ? 'ADMIN' : 'KITCHEN'}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-xl text-[11px] font-medium text-slate-600 mb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-1 rounded-lg transition-all text-center ${
            activeTab === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          All ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`py-1 rounded-lg transition-all text-center ${
            activeTab === 'admin' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          👑 Admins ({adminUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('kitchen')}
          className={`py-1 rounded-lg transition-all text-center ${
            activeTab === 'kitchen' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          👨‍🍳 Users ({kitchenUsers.length})
        </button>
      </div>

      {/* Profiles List with Custom Scrollbar */}
      <div 
        className="space-y-1.5 max-h-72 overflow-y-auto pr-1 flex-1 min-h-0"
        style={{ scrollbarWidth: 'thin' }}
      >
        {filteredUsers.map((user) => {
          const isSelected = user.id === currentUser.id;
          const isUserAdmin = user.role === 'ADMIN';

          return (
            <button
              key={user.id}
              onClick={() => {
                switchUser(user);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                isSelected 
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900' 
                  : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200/80'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <span 
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    isUserAdmin ? 'bg-indigo-600' : 'bg-emerald-500'
                  }`} 
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {user.name}
                    </span>
                    {isUserAdmin ? (
                      <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-300' : 'text-indigo-600'}`} />
                    ) : (
                      <ChefHat className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`} />
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>

                <p className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {user.title}
                </p>

                <div className="flex items-center gap-1 mt-0.5">
                  {isUserAdmin ? (
                    <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      <Globe2 className="w-2.5 h-2.5" /> All AP Districts
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded capitalize ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800'
                    }`}>
                      <Lock className="w-2.5 h-2.5" /> {user.assignedDistrict} Floor
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span>Click to switch RBAC view</span>
        <span className="font-mono text-[9px] text-slate-400">{filteredUsers.length} profiles</span>
      </div>
    </div>
  );
}
