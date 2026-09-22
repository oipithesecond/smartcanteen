// frontend/src/context/DashboardContext.jsx
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import { DISTRICT_METADATA, getAugmentedBatchCookPlan, USERS } from '../data/mockCanteenData';

const DashboardContext = createContext(null);
const API_BASE = 'http://localhost:5005/api';

export function DashboardProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(USERS[1]); // Default to Guntur Floor Chef
  const [selectedDistrict, setSelectedDistrictState] = useState(USERS[1].assignedDistrict);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeMealSlot, setActiveMealSlot] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  const [bufferMultiplier, setBufferMultiplier] = useState(1.0);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  // Live Machine Learning Batch Plan State
  const [liveBatchPlan, setLiveBatchPlan] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelMeta, setModelMeta] = useState(null);

  // Safe district updater enforcing RBAC boundaries
  const setSelectedDistrict = useCallback((districtId) => {
    if (currentUser.role === 'OUTLET_MANAGER') {
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
      setSelectedDistrictState(newUser.assignedDistrict);
    }
    setIsRoleMenuOpen(false);
  }, []);

  const currentDistrictMeta = useMemo(() => {
    return DISTRICT_METADATA[selectedDistrict] || DISTRICT_METADATA.guntur;
  }, [selectedDistrict]);

  // Fetch live XGBoost inference and Newsvendor batch plan from Node.js Gateway
  useEffect(() => {
    let isCancelled = false;
    setIsModelLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      axios.get(`${API_BASE}/batch-plan`, {
        params: {
          district: selectedDistrict,
          bufferMultiplier: bufferMultiplier
        },
        signal: controller.signal
      })
      .then((res) => {
        if (!isCancelled && res.data?.items) {
          setLiveBatchPlan(res.data.items);
          setModelMeta({
            weather: res.data.weather,
            macroPeriod: res.data.macroPeriod,
            isHoliday: res.data.isHoliday,
            modelRmse: res.data.modelRmse,
            modelVersion: res.data.modelVersion
          });
        }
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && !isCancelled) {
          console.warn("Backend batch-plan fetch failed; falling back to local dataset:", err.message);
        }
      })
      .finally(() => {
        if (!isCancelled) setIsModelLoading(false);
      });
    }, 120); // 120ms debounce for smooth slider feedback

    return () => {
      isCancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [selectedDistrict, bufferMultiplier]);

  // Active batch cook plan: prioritize live model prediction, fallback to local dataset
  const batchCookPlan = useMemo(() => {
    if (liveBatchPlan && liveBatchPlan.length > 0) {
      return liveBatchPlan;
    }
    return getAugmentedBatchCookPlan(selectedDistrict, bufferMultiplier);
  }, [liveBatchPlan, selectedDistrict, bufferMultiplier]);

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
    batchCookPlan,
    isModelLoading,
    modelMeta,
    isLiveModel: Boolean(liveBatchPlan && liveBatchPlan.length > 0)
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
