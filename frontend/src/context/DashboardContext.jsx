// frontend/src/context/DashboardContext.jsx
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { DISTRICT_METADATA, getAugmentedBatchCookPlan, USERS } from '../data/mockCanteenData';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(USERS[1]); // Default to Guntur Floor Chef to showcase Kitchen Floor experience
  const [selectedDistrict, setSelectedDistrictState] = useState(USERS[1].assignedDistrict);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeMealSlot, setActiveMealSlot] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  const [bufferMultiplier, setBufferMultiplier] = useState(1.0);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  // Safe district updater enforcing RBAC boundaries
  const setSelectedDistrict = useCallback((districtId) => {
    if (currentUser.role === 'OUTLET_MANAGER') {
      // Guard: Managers are permanently locked to their assigned kitchen branch
      console.warn(`Access Denied: Outlet Manager ${currentUser.name} is locked to branch ${currentUser.assignedDistrict}`);
      setSelectedDistrictState(currentUser.assignedDistrict);
      return;
    }
    setSelectedDistrictState(districtId);
  }, [currentUser]);

  // Role switch handler enforcing RBAC synchronization
  const switchUser = useCallback((newUser) => {
    setCurrentUser(newUser);
    if (newUser.role === 'OUTLET_MANAGER') {
      // Critical safeguard: Force selected district to match manager's assigned branch immediately
      setSelectedDistrictState(newUser.assignedDistrict);
    }
    setIsRoleMenuOpen(false);
  }, []);

  const currentDistrictMeta = useMemo(() => {
    return DISTRICT_METADATA[selectedDistrict] || DISTRICT_METADATA.guntur;
  }, [selectedDistrict]);

  const batchCookPlan = useMemo(() => {
    return getAugmentedBatchCookPlan(selectedDistrict, bufferMultiplier);
  }, [selectedDistrict, bufferMultiplier]);

  const value = {
    currentUser,
    currentRole: currentUser.role,
    isAdmin: currentUser.role === 'ADMIN',
    isManager: currentUser.role === 'OUTLET_MANAGER',
    selectedDistrict,
    setSelectedDistrict,
    currentDistrictMeta,
    activeCategory,
    setActiveCategory,
    activeMealSlot,
    setActiveMealSlot,
    timeRange,
    setTimeRange,
    bufferMultiplier,
    setBufferMultiplier,
    activeNav,
    setActiveNav,
    isRoleMenuOpen,
    setIsRoleMenuOpen,
    switchUser,
    usersList: USERS,
    batchCookPlan
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// oxlint-disable-next-line react-refresh/only-export-components
// eslint-disable-next-line react-refresh/only-export-components
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
