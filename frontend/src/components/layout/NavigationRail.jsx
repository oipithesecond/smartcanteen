import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutGrid, 
  UtensilsCrossed, 
  PieChart, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Scale,
  Activity,
  MapPin,
  Leaf
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import PersonaSwitcher from './PersonaSwitcher';

const DOCK_ITEMS = [
  { id: 'dashboard', label: 'Executive KPIs', subtitle: "Today's Summary", icon: LayoutGrid },
  { id: 'waste-split', label: 'Waste Breakdown', subtitle: 'By Food Category', icon: PieChart },
  { id: 'inventory', label: 'Inventory Stock', subtitle: 'Perishable Shelf Radar', icon: FileText, badge: 'alert' },
  { id: 'performance', label: 'Meal Performance', subtitle: 'Dish Waste Rankings', icon: UtensilsCrossed },
  { id: 'plate-vs-prep', label: 'Plate vs. Prep', subtitle: 'Root-Cause Telemetry', icon: Scale, badge: 'telemetry' },
  { id: 'forecast-horizon', label: 'Forecast Horizon', subtitle: '7-Day XGBoost Accuracy', icon: Activity, badge: 'ml' },
  { id: 'batch-plan', label: 'Batch Schedule', subtitle: "Tomorrow's Cook Plan", icon: Calendar, badge: 'ml' },
  { id: 'ap-map', label: 'Regional Network', subtitle: 'AP Cluster & Taste Map', icon: MapPin, adminOnly: true },
  { id: 'analytics', label: 'Shift Telemetry', subtitle: '4 Meal Shift Operations', icon: TrendingUp },
  { id: 'impact', label: 'Impact & Savings', subtitle: 'Financial & CO₂ Saved', icon: Leaf },
];

export default function NavigationRail() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const { 
    currentUser, 
    isRoleMenuOpen, 
    setIsRoleMenuOpen,
    isAdmin,
    isLiveModel,
    selectedDistrict
  } = useDashboard();

  const menuRef = useRef(null);
  const activeNavRef = useRef(activeNav);
  const isClickScrollingRef = useRef(null);
  const scrollEndTimerRef = useRef(null);
  const sectionsCacheRef = useRef([]);

  useEffect(() => {
    activeNavRef.current = activeNav;
  }, [activeNav]);

  // Filter dock items: ap-map is admin-only
  const visibleDockItems = useMemo(() => {
    return DOCK_ITEMS.filter(item => !item.adminOnly || isAdmin);
  }, [isAdmin]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        const headerAvatarBtn = document.getElementById('header-avatar-btn');
        if (headerAvatarBtn && headerAvatarBtn.contains(event.target)) {
          return;
        }
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

  // Measure and cache section vertical offsets (zero-layout-thrashing during scroll)
  const measureSections = useCallback(() => {
    const scrollY = window.scrollY;
    const positions = [];
    for (const item of visibleDockItems) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const top = Math.round(rect.top + scrollY);
      positions.push({
        id: item.id,
        top,
        bottom: Math.round(top + rect.height),
        height: Math.round(rect.height)
      });
    }
    positions.sort((a, b) => a.top - b.top);
    sectionsCacheRef.current = positions;
  }, [visibleDockItems]);

  // Re-measure when district or role changes
  useEffect(() => {
    measureSections();
    const t = setTimeout(measureSections, 200);
    return () => clearTimeout(t);
  }, [selectedDistrict, isAdmin, measureSections]);

  // High-performance scroll spy: zero DOM calls on scroll, continuous partition model
  const updateActiveNavFromScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const sections = sectionsCacheRef.current;

    if (!sections || sections.length === 0) return;

    // 1. Extreme Top Check: If near top of page (scrollY < 60px), always 'dashboard'
    if (scrollY < 60) {
      if (activeNavRef.current !== 'dashboard') {
        setActiveNav('dashboard');
        activeNavRef.current = 'dashboard';
      }
      return;
    }

    // 2. Extreme Bottom Check: If scrolled to bottom of document (within 60px), always the last item
    if (scrollY + viewportHeight >= scrollHeight - 60) {
      const lastItem = visibleDockItems[visibleDockItems.length - 1];
      if (lastItem && activeNavRef.current !== lastItem.id) {
        setActiveNav(lastItem.id);
        activeNavRef.current = lastItem.id;
      }
      return;
    }

    // 3. Focal line: 180px below top of viewport
    const focalY = scrollY + 180;

    const wasteSplitSec = sections.find(s => s.id === 'waste-split');
    const inventorySec = sections.find(s => s.id === 'inventory');
    const performanceSec = sections.find(s => s.id === 'performance');

    // On desktop (lg+), waste-split and inventory share the same row (top within 60px)
    const isRow2SideBySide = wasteSplitSec && inventorySec && 
      Math.abs(inventorySec.top - wasteSplitSec.top) < 60;

    let targetId = visibleDockItems[0]?.id || 'dashboard';

    if (isRow2SideBySide && wasteSplitSec) {
      const row2Start = wasteSplitSec.top - 80;
      const row2End = performanceSec ? (performanceSec.top - 80) : (wasteSplitSec.bottom + 40);

      if (focalY >= row2Start && focalY < row2End) {
        // Within Row 2: keep 'inventory' if currently active (user clicked it); otherwise default to 'waste-split'
        targetId = (activeNavRef.current === 'inventory') ? 'inventory' : 'waste-split';
      } else if (focalY < row2Start) {
        targetId = 'dashboard';
      } else {
        // From performance downwards
        for (const sec of sections) {
          if (sec.id === 'waste-split' || sec.id === 'inventory') continue;
          if (focalY >= sec.top - 80) {
            targetId = sec.id;
          }
        }
      }
    } else {
      // Tablet/mobile or standard vertical cascade
      for (const sec of sections) {
        if (focalY >= sec.top - 80) {
          targetId = sec.id;
        }
      }
    }

    if (targetId && targetId !== activeNavRef.current) {
      setActiveNav(targetId);
      activeNavRef.current = targetId;
    }
  }, [visibleDockItems, setActiveNav]);

  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      // If user is programmatic click-scrolling
      if (isClickScrollingRef.current) {
        const { targetId, targetY, startTime } = isClickScrollingRef.current;
        const currentY = window.scrollY;

        // Check if reached destination (within 4px) or timed out (1.2s max)
        const reachedTarget = Math.abs(currentY - targetY) <= 4;
        const timedOut = Date.now() - startTime > 1200;

        if (reachedTarget || timedOut) {
          isClickScrollingRef.current = null;
        } else {
          // Keep targetId locked during flight
          if (activeNavRef.current !== targetId) {
            setActiveNav(targetId);
            activeNavRef.current = targetId;
          }
          // Reset debounce timer to unlock once smooth scroll completes
          clearTimeout(scrollEndTimerRef.current);
          scrollEndTimerRef.current = setTimeout(() => {
            isClickScrollingRef.current = null;
            updateActiveNavFromScroll();
          }, 150);
          return;
        }
      }

      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateActiveNavFromScroll();
      });
    };

    // Release lock immediately if user manually interacts with mouse wheel or touch
    const handleManualInterrupt = () => {
      if (isClickScrollingRef.current) {
        isClickScrollingRef.current = null;
        clearTimeout(scrollEndTimerRef.current);
      }
    };

    const handleScrollEnd = () => {
      isClickScrollingRef.current = null;
      clearTimeout(scrollEndTimerRef.current);
      updateActiveNavFromScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', measureSections, { passive: true });
    window.addEventListener('wheel', handleManualInterrupt, { passive: true });
    window.addEventListener('touchstart', handleManualInterrupt, { passive: true });
    window.addEventListener('scrollend', handleScrollEnd);

    // Initial measurement
    measureSections();
    const timer1 = setTimeout(measureSections, 150);
    const timer2 = setTimeout(measureSections, 500);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(scrollEndTimerRef.current);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', measureSections);
      window.removeEventListener('wheel', handleManualInterrupt);
      window.removeEventListener('touchstart', handleManualInterrupt);
      window.removeEventListener('scrollend', handleScrollEnd);
    };
  }, [measureSections, updateActiveNavFromScroll]);

  const handleNavClick = (id) => {
    setActiveNav(id);
    activeNavRef.current = id;

    const element = document.getElementById(id);
    if (!element) return;

    // Refresh positions to guarantee exact offset
    measureSections();

    const headerOffset = 76;
    const elementPosition = element.getBoundingClientRect().top;
    const targetY = Math.max(0, Math.round(elementPosition + window.scrollY - headerOffset));

    isClickScrollingRef.current = {
      targetId: id,
      targetY,
      startTime: Date.now()
    };
    clearTimeout(scrollEndTimerRef.current);

    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });

    // Fallback safety unlock
    scrollEndTimerRef.current = setTimeout(() => {
      isClickScrollingRef.current = null;
      updateActiveNavFromScroll();
    }, 1200);
  };

  return (
    <nav 
      aria-label="Floating Left Navigation Dock"
      className="hidden md:flex fixed left-4 lg:left-5 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-2 py-3 px-2 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_40px_-6px_rgba(15,23,42,0.18)] ring-1 ring-white overflow-visible transition-all"
    >
      {/* Brand Anchor Logo */}
      <a 
        href="#dashboard" 
        onClick={(e) => { e.preventDefault(); handleNavClick('dashboard'); }}
        className="w-7 h-7 rounded-full flex items-center justify-center p-0.5 hover:scale-110 active:scale-95 transition-transform focus:outline-none"
        title="Smart Canteen Waste Management"
      >
        <img src="/logo-icon.png" alt="Smart Canteen" className="w-full h-full object-contain" />
      </a>

      {/* Hairline Divider */}
      <div className="w-4 h-[1px] bg-slate-200/90 shrink-0" />

      {/* Vertical Icon Buttons */}
      <div className="flex flex-col items-center gap-1.5">
        {visibleDockItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={item.label}
              className={`relative p-2 rounded-full flex items-center justify-center transition-colors duration-150 group ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/10'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 stroke-[2] shrink-0 ${isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-950'}`} />

              {/* Dynamic Status Badges on the icon */}
              {item.badge === 'ml' && (
                <span 
                  className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white ${
                    isLiveModel ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`} 
                />
              )}
              {item.badge === 'telemetry' && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white bg-[#ba1a1a]" />
              )}
              {item.badge === 'alert' && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white bg-amber-500 animate-pulse" />
              )}

              {/* Rich Dual-Line Tooltip on hover docked to the right of the rail */}
              <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 flex flex-col gap-0.5">
                <div className="text-xs font-space font-semibold flex items-center gap-1.5">
                  <span>{item.label}</span>
                  {item.badge === 'ml' && isLiveModel && (
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded-xs">
                      LIVE
                    </span>
                  )}
                  {item.badge === 'telemetry' && (
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-rose-500/20 text-rose-300 rounded-xs">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hairline Divider */}
      <div className="w-4 h-[1px] bg-slate-200/90 my-0.5 shrink-0" />

      {/* User Avatar with Popover to the right */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
          className="relative p-0.5 rounded-full ring-2 ring-white hover:ring-slate-400 transition-all focus:outline-none flex items-center shadow-xs"
          title={`Switch Persona: ${currentUser.name} (${currentUser.role})`}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-300/80"
          />
          <span 
            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
              isAdmin ? 'bg-slate-900' : 'bg-emerald-600'
            }`} 
          />
        </button>

        {/* Role Switcher Popover - Floats to the Right of Left Rail */}
        {isRoleMenuOpen && (
          <PersonaSwitcher 
            placement="right" 
            onClose={() => setIsRoleMenuOpen(false)} 
          />
        )}
      </div>
    </nav>
  );
}
