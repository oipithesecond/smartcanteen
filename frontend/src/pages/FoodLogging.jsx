// frontend/src/pages/FoodLogging.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Scale, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  RotateCcw,
  Utensils,
  Trash2,
  Download
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { USERS, CONSUMPTION_VS_TRASH, DISTRICT_METADATA } from '../data/mockCanteenData';

const API_BASE = 'http://localhost:5005/api';

// Designation of Floor Executives for each canteen branch
export const FLOOR_EXECUTIVES = {
  amaravati: {
    floorName: 'Floor 1 — Amaravati Secretariat Core',
    executiveId: 'mgr-lakshmi',
    executiveName: 'Lakshmi Priya',
    title: 'Executive Head Chef',
    district: 'amaravati',
    badge: 'Amaravati Floor Executive',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  guntur: {
    floorName: 'Floor 2 — Guntur Central Dining',
    executiveId: 'mgr-suresh',
    executiveName: 'Suresh Reddy',
    title: 'Kitchen Floor & Production Manager',
    district: 'guntur',
    badge: 'Guntur Floor Executive',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  vijayawada: {
    floorName: 'Floor 3 — Vijayawada Transit Hub',
    executiveId: 'mgr-venkatesh',
    executiveName: 'K. Venkatesh',
    title: 'Transit Kitchen Floor Supervisor',
    district: 'vijayawada',
    badge: 'Vijayawada Floor Executive',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
};

// Initial demo logs for each floor
const INITIAL_LOGS = [
  {
    id: 'scale-001',
    timestamp: '14:15 Today',
    itemName: 'Andhra Veg Thali (Curry & Rice)',
    category: 'Veg_Mains',
    mealSlot: 'lunch',
    scrapType: 'Plate Waste (Tray Scrap)',
    grossWeightKg: 17.20,
    tareWeightKg: 1.45,
    netWeightKg: 15.75,
    portionsEquivalent: 45,
    costLost: 2275,
    district: 'amaravati',
    loggedBy: 'Lakshmi Priya',
    signatureHash: 'SIG-AMR-8921B'
  },
  {
    id: 'scale-002',
    timestamp: '13:45 Today',
    itemName: 'Gongura Rice Base',
    category: 'Staples',
    mealSlot: 'lunch',
    scrapType: 'Cauldron Overproduction',
    grossWeightKg: 18.60,
    tareWeightKg: 2.10,
    netWeightKg: 16.50,
    portionsEquivalent: 55,
    costLost: 2310,
    district: 'guntur',
    loggedBy: 'Suresh Reddy',
    signatureHash: 'SIG-GNT-4410A'
  },
  {
    id: 'scale-003',
    timestamp: '11:10 Today',
    itemName: 'Steamed Idli & Chutney',
    category: 'Breakfast_Tiffins',
    mealSlot: 'breakfast',
    scrapType: 'Plate Waste (Tray Scrap)',
    grossWeightKg: 4.70,
    tareWeightKg: 1.20,
    netWeightKg: 3.50,
    portionsEquivalent: 25,
    costLost: 700,
    district: 'guntur',
    loggedBy: 'Suresh Reddy',
    signatureHash: 'SIG-GNT-3199C'
  }
];

export default function FoodLogging() {
  const { 
    currentUser, 
    switchUser, 
    selectedDistrict, 
    setSelectedDistrict, 
    currentDistrictMeta, 
    isNerdMode 
  } = useDashboard();

  // Active Floor Executive definition
  const currentFloorExec = useMemo(() => {
    return FLOOR_EXECUTIVES[selectedDistrict] || FLOOR_EXECUTIVES.guntur;
  }, [selectedDistrict]);

  // Authorization Check: Only the Executive of THIS specific floor can submit!
  const isAuthorizedFloorExecutive = currentUser.id === currentFloorExec.executiveId;

  // Foodstuff Form State
  const [itemName, setItemName] = useState('Gongura Rice');
  const [category, setCategory] = useState('Staples');
  const [mealSlot, setMealSlot] = useState('lunch');
  const [scrapType, setScrapType] = useState('Plate Waste (Tray Scrap)');
  const [tarePreset, setTarePreset] = useState('1.20'); // Gastronorm Pan default
  const [grossWeight, setGrossWeight] = useState('14.70');
  const [costPerKg, setCostPerKg] = useState('140');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Local storage persisted logs
  const [logs, setLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('smartcanteen_weight_logs');
      return stored ? JSON.parse(stored) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('smartcanteen_weight_logs', JSON.stringify(logs));
    } catch {
      // storage errors ignored
    }
  }, [logs]);

  // Net weight calculated live
  const netWeightKg = useMemo(() => {
    const gross = parseFloat(grossWeight) || 0;
    const tare = parseFloat(tarePreset) || 0;
    return Math.max(0, parseFloat((gross - tare).toFixed(2)));
  }, [grossWeight, tarePreset]);

  // Estimated portions (assuming standard 0.35 kg portion)
  const estimatedPortions = useMemo(() => {
    return Math.round(netWeightKg / 0.35);
  }, [netWeightKg]);

  // Financial loss calculated live
  const estimatedCost = useMemo(() => {
    return Math.round(netWeightKg * (parseFloat(costPerKg) || 120));
  }, [netWeightKg, costPerKg]);

  // Available dishes for active floor
  const districtDishes = useMemo(() => {
    const list = CONSUMPTION_VS_TRASH[selectedDistrict] || CONSUMPTION_VS_TRASH.guntur;
    return list.map(d => d.name);
  }, [selectedDistrict]);

  // Handle Tare Preset change
  const handleTarePreset = (val) => {
    setTarePreset(val);
  };

  // Submit log handler strictly guarded by RBAC
  const handleLogFood = async (e) => {
    e.preventDefault();
    if (!isAuthorizedFloorExecutive) {
      alert(`Access Denied: Only Floor Executive ${currentFloorExec.executiveName} can officially sign and log food weights for ${currentFloorExec.floorName}.`);
      return;
    }

    if (netWeightKg <= 0) {
      alert("Invalid Weight: Gross weight must be greater than tare weight.");
      return;
    }

    setIsSubmitting(true);
    const signatureHash = `SIG-${selectedDistrict.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLogEntry = {
      id: `scale-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
      itemName,
      category,
      mealSlot,
      scrapType,
      grossWeightKg: parseFloat(grossWeight),
      tareWeightKg: parseFloat(tarePreset),
      netWeightKg,
      portionsEquivalent: estimatedPortions,
      costLost: estimatedCost,
      district: selectedDistrict,
      loggedBy: currentFloorExec.executiveName,
      executiveTitle: currentFloorExec.title,
      signatureHash
    };

    // Attempt backend sync (works seamlessly even in offline mode)
    try {
      await axios.put(`${API_BASE}/log-leftovers`, {
        logId: newLogEntry.id,
        actualPreparedQty: estimatedPortions + 50,
        leftoverQty: estimatedPortions
      });
    } catch {
      // Local fallback
    }

    setLogs(prev => [newLogEntry, ...prev]);
    setIsSubmitting(false);
    setSuccessMessage(`Successfully logged ${netWeightKg} kg of ${itemName} signed by ${currentFloorExec.executiveName} (${signatureHash})`);
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  // Quick switch user to the designated Floor Executive
  const handleSimulateFloorExecutive = () => {
    const targetUser = USERS.find(u => u.id === currentFloorExec.executiveId);
    if (targetUser) {
      switchUser(targetUser);
    }
  };

  return (
    <div className="w-full space-y-8 min-w-0 pb-16">
      {/* Breadcrumb Navigation & Top Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-xs font-space font-medium text-[#777771] hover:text-[#1c1b1b] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Operations Dashboard</span>
        </Link>

        {/* Floor Location Switcher */}
        <div className="flex items-center gap-2 bg-white border border-[#e5e2e1] p-1 rounded-xl shadow-2xs text-xs font-space">
          <span className="text-[10px] font-mono uppercase px-2 text-[#777771]">Active Floor:</span>
          {Object.entries(FLOOR_EXECUTIVES).map(([key, exec]) => {
            const isActive = selectedDistrict === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDistrict(key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#1c1b1b] text-white shadow-xs' 
                    : 'text-[#474741] hover:bg-neutral-100'
                }`}
              >
                {exec.floorName.split('—')[0].trim()} ({key})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Page Header with Handcrafted Tilted Tape Sticker */}
      <div 
        className="relative bg-white border border-[#e5e2e1] p-6 md:p-8 shadow-[2px_12px_32px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] min-w-0"
        style={{ borderRadius: '24px 28px 23px 27px' }}
      >
        {/* Tilted Masking Tape Sticker */}
        <div 
          aria-hidden="true"
          className="absolute -top-3.5 left-8 px-3.5 py-0.5 bg-[#fef3c7]/95 border-y border-[#d97706]/35 text-[10px] font-mono tracking-widest text-[#92400e] shadow-xs select-none pointer-events-none rotate-[-1.2deg] backdrop-blur-xs flex items-center gap-1.5 z-20"
          style={{ borderRadius: '2px 4px 3px 2px' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]" />
          <span>SCALE TERMINAL #01 • DIGITAL SCALE TELEMETRY</span>
        </div>

        {/* Rubber Stamp */}
        <div 
          aria-hidden="true"
          className="hidden sm:flex absolute -top-3 right-8 select-none pointer-events-none rotate-[1.8deg] border border-[#1c1b1b]/25 bg-[#faf8f5] px-2.5 py-0.5 text-[9px] font-mono font-bold tracking-wider text-[#1c1b1b]/70 uppercase z-20"
          style={{ borderRadius: '3px 2px 4px 2px' }}
        >
          [METTLER-TOLEDO 0.05kg CALIBRATED]
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div>
            <div className="text-[11px] font-bold tracking-[0.12em] text-[#777771] uppercase flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-[#c76c00]" />
              <span>FOODSTUFF WEIGHT LOGGING &amp; SIGN-OFF</span>
              <span className="w-1 h-1 rounded-full bg-[#777771]" />
              <span>{currentFloorExec.floorName.toUpperCase()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1c1b1b] mt-1 font-space tracking-tight">
              Physical Scale Weight Logging Terminal
            </h1>
            <p className="text-xs text-[#474741] mt-1.5 max-w-2xl leading-relaxed">
              Weigh kitchen overproduction cauldrons and plate scrap buckets directly on the kitchen digital scales. 
              By state dining protocol, official food weights must be signed and committed by the designated Floor Executive.
            </p>
          </div>

          {/* Executive Sign-off Authority Card */}
          <div 
            className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 shrink-0 ${
              isAuthorizedFloorExecutive 
                ? 'bg-emerald-50/70 border-emerald-300/80 text-emerald-950' 
                : 'bg-amber-50/70 border-amber-300/80 text-amber-950'
            }`}
            style={{ borderRadius: '14px 18px 15px 16px' }}
          >
            <img 
              src={currentFloorExec.avatar} 
              alt={currentFloorExec.executiveName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0" 
            />
            <div className="text-xs font-space">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1c1b1b]">{currentFloorExec.executiveName}</span>
                {isAuthorizedFloorExecutive ? (
                  <span className="text-[9px] font-mono bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold uppercase flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </span>
                ) : (
                  <span className="text-[9px] font-mono bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold uppercase flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#474741]">{currentFloorExec.title}</p>
              <p className="text-[10px] font-mono text-[#777771] mt-0.5">{currentFloorExec.badge}</p>
            </div>
          </div>
        </div>

        {/* Security Notification if Current User is Not the Floor Executive */}
        {!isAuthorizedFloorExecutive && (
          <div 
            className="mt-4 border-l-4 border-amber-500 bg-[#fffbeb] p-3.5 rounded-r-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            style={{ borderRadius: '0 14px 12px 0' }}
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold text-amber-950">Floor Executive Authorization Enforced:</span>
                <span className="ml-1 text-[11px] text-amber-900">
                  You are logged in as <strong>{currentUser.name}</strong> ({currentUser.title || currentUser.roleLabel}). Only <strong>{currentFloorExec.executiveName}</strong> can commit food weights on this floor.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSimulateFloorExecutive}
              className="text-[10px] font-mono font-bold bg-[#1c1b1b] hover:bg-[#c76c00] text-white px-3 py-1.5 rounded-md transition-colors uppercase shrink-0 cursor-pointer shadow-xs"
              style={{ borderRadius: '6px 8px 7px 9px' }}
            >
              Sign In as {currentFloorExec.executiveName}
            </button>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div 
            className="mt-4 border-l-4 border-emerald-500 bg-emerald-50 p-3.5 rounded-r-xl text-xs text-emerald-900 flex items-center gap-2.5 shadow-2xs animate-fadeIn"
            style={{ borderRadius: '0 14px 12px 0' }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-[11px]">{successMessage}</span>
          </div>
        )}
      </div>

      {/* Main Dual Grid: Scale Weigh-in Form (Left - 8 Cols) & Live Scale Console (Right - 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 min-w-0 items-start">
        {/* Left Form: Foodstuff Particulars & Inputs (Extended to 8 Columns for Spacious Layout) */}
        <div 
          className="lg:col-span-8 bg-white border border-[#e5e2e1] p-6 sm:p-8 shadow-[2px_10px_28px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] min-w-0 relative"
          style={{ borderRadius: '25px 22px 26px 23px' }}
        >
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#e5e2e1]">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#c76c00]" />
              <h2 className="text-base font-bold text-[#1c1b1b] font-space">
                Scale Item Particulars
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#777771]">
              Floor Station: {currentFloorExec.floorName.split('—')[0]}
            </span>
          </div>

          <form onSubmit={handleLogFood} className="space-y-4">
            {/* 1. Food Item Selector */}
            <div>
              <label className="block text-xs font-bold text-[#1c1b1b] font-space uppercase mb-1">
                Foodstuff / Dish Name
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-[#fdfbf9] border border-[#d8d4cf] rounded-xl px-3 py-2 text-xs font-space font-medium text-[#1c1b1b] focus:outline-none focus:ring-2 focus:ring-[#c76c00] cursor-pointer"
                >
                  {districtDishes.map((dish) => (
                    <option key={dish} value={dish}>{dish}</option>
                  ))}
                  <option value="Rice & Biryani Grains">Rice &amp; Biryani Grains (Staple)</option>
                  <option value="Veg Curries & Kurma">Veg Curries &amp; Kurma</option>
                  <option value="Dal, Sambar & Pappu">Dal, Sambar &amp; Pappu</option>
                  <option value="Chapati & Breads">Chapati &amp; Breads</option>
                  <option value="Fermented Idli Batter">Fermented Idli Batter</option>
                  <option value="Country Tomatoes (Pantry)">Country Tomatoes (Pantry)</option>
                  <option value="Custom Prepared Dish">Custom Kitchen Dish...</option>
                </select>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#fdfbf9] border border-[#d8d4cf] rounded-xl px-3 py-2 text-xs font-space font-medium text-[#1c1b1b] focus:outline-none focus:ring-2 focus:ring-[#c76c00] cursor-pointer"
                >
                  <option value="Staples">Staples &amp; Grains</option>
                  <option value="Veg_Mains">Vegetarian Mains</option>
                  <option value="Non_Veg_Mains">Non-Vegetarian Mains</option>
                  <option value="Breakfast_Tiffins">Breakfast Tiffins</option>
                  <option value="Leafy_Greens">Perishable Greens &amp; Veg</option>
                  <option value="Snacks">Evening Snacks</option>
                </select>
              </div>
            </div>

            {/* 2. Meal Slot & Scrap Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1c1b1b] font-space uppercase mb-1">
                  Meal Service Shift
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-[#f5f2ee] p-1.5 rounded-xl border border-[#e5e2e1] text-xs">
                  {[
                    { id: 'breakfast', label: 'Breakfast' },
                    { id: 'lunch', label: 'Lunch' },
                    { id: 'snacks', label: 'Snacks' },
                    { id: 'dinner', label: 'Dinner' }
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setMealSlot(slot.id)}
                      className={`py-1.5 px-1.5 text-xs font-space font-medium rounded-lg transition-all cursor-pointer text-center ${
                        mealSlot === slot.id 
                          ? 'bg-white text-[#1c1b1b] font-bold shadow-2xs' 
                          : 'text-[#777771] hover:text-[#1c1b1b]'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1c1b1b] font-space uppercase mb-1">
                  Scrap Classification
                </label>
                <select
                  value={scrapType}
                  onChange={(e) => setScrapType(e.target.value)}
                  className="w-full bg-[#fdfbf9] border border-[#d8d4cf] rounded-xl px-3 py-2 text-xs font-space font-medium text-[#1c1b1b] focus:outline-none focus:ring-2 focus:ring-[#c76c00] cursor-pointer"
                >
                  <option value="Plate Waste (Tray Scrap)">Plate Waste (Customer Tray Scrap)</option>
                  <option value="Cauldron Overproduction">Cauldron Overproduction (Unserved)</option>
                  <option value="Expired Raw Prep">Expired Prep / Perishable Spoilage</option>
                  <option value="Trimming & Vegetable Scrap">Prep Trimmings / Peels</option>
                </select>
              </div>
            </div>

            {/* 3. Scale Tare Presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#1c1b1b] font-space uppercase">
                  Tare Container Weight (Deduction)
                </label>
                <span className="text-[11px] font-mono text-[#777771]">Current Tare: {tarePreset} kg</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Platter Tray', weight: '0.45' },
                  { label: 'Gastro Pan', weight: '1.20' },
                  { label: 'Heavy Handi', weight: '2.10' },
                  { label: 'Zero / Net', weight: '0.00' }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleTarePreset(preset.weight)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      tarePreset === preset.weight 
                        ? 'bg-[#1c1b1b] text-white border-[#1c1b1b] shadow-2xs' 
                        : 'bg-[#faf8f6] border-[#e8e4e0] text-[#474741] hover:bg-[#f2eee9]'
                    }`}
                    style={{ borderRadius: '8px 10px 9px 11px' }}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-tight">{preset.label}</div>
                    <div className="text-xs font-mono font-semibold">{preset.weight} kg</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Gross Weight Input Slider / Field */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#1c1b1b] font-space uppercase">
                  Gross Scale Reading (Food + Pan)
                </label>
                <span className="text-xs font-mono font-bold text-[#c76c00]">{grossWeight} kg</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="range"
                  min="0"
                  max="50"
                  step="0.05"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  className="w-full accent-[#c76c00] cursor-pointer"
                />
                <input 
                  type="number"
                  min="0"
                  max="100"
                  step="0.05"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  className="w-24 bg-[#fdfbf9] border border-[#d8d4cf] rounded-xl px-2.5 py-1.5 text-center text-xs font-mono font-bold text-[#1c1b1b]"
                />
              </div>
            </div>

            {/* 5. Cost Valuation */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-[#777771] font-space uppercase mb-1">
                  Est. Recipe Value (₹ / kg)
                </label>
                <input 
                  type="number"
                  min="20"
                  max="1000"
                  value={costPerKg}
                  onChange={(e) => setCostPerKg(e.target.value)}
                  className="w-full bg-[#fdfbf9] border border-[#d8d4cf] rounded-xl px-3 py-1.5 text-xs font-mono font-medium text-[#1c1b1b]"
                />
              </div>
              <div className="bg-[#fcfaf7] border border-[#e8e4e0] p-2.5 rounded-xl flex flex-col justify-center">
                <div className="text-[10px] text-[#777771] uppercase font-bold">Computed Loss</div>
                <div className="text-sm font-space font-bold text-[#c76c00]">
                  ₹{estimatedCost.toLocaleString()} ({estimatedPortions} portions)
                </div>
              </div>
            </div>

            {/* 6. STRICT AUTHORIZATION BUTTON ("A button to log food to the executive of each floor no one else") */}
            <div className="pt-3 border-t border-[#e5e2e1]">
              <button
                type="submit"
                disabled={!isAuthorizedFloorExecutive || isSubmitting || netWeightKg <= 0}
                className={`w-full py-3.5 px-4 rounded-xl font-space font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 select-none ${
                  isAuthorizedFloorExecutive && netWeightKg > 0
                    ? 'bg-[#1c1b1b] hover:bg-[#c76c00] text-white cursor-pointer active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                }`}
                style={{ borderRadius: '12px 15px 13px 14px' }}
              >
                {isAuthorizedFloorExecutive ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      {isSubmitting 
                        ? "Committing Digital Signature..." 
                        : `Sign & Commit Food Weight (Executive: ${currentFloorExec.executiveName})`}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>
                      Restricted to Floor Executive ({currentFloorExec.executiveName})
                    </span>
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-center text-[#777771] mt-2 font-mono">
                {isAuthorizedFloorExecutive 
                  ? `Authenticated as ${currentUser.name} • Certified for ${currentFloorExec.floorName}`
                  : `Locked: Current login (${currentUser.name}) is not the certified Executive of ${currentFloorExec.floorName}`}
              </p>
            </div>
          </form>
        </div>

        {/* Right Scale Console: Digital Readout & Telemetry Display (4 Columns) */}
        <div className="lg:col-span-4 space-y-6 min-w-0">
          {/* Digital Scale Terminal Console */}
          <div 
            className="bg-[#1c1b1b] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-black/20"
            style={{ borderRadius: '24px 22px 25px 23px' }}
          >
            {/* Top terminal badge */}
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pb-3 border-b border-white/10 mb-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ONLINE • SCALE #01
              </span>
              <span>TARE: {tarePreset} kg</span>
            </div>

            {/* Glowing Big Digital Mass Readout */}
            <div className="text-center py-4">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#a3a3a3]">
                Net Foodstuff Mass
              </div>
              <div className="text-5xl sm:text-6xl font-bold font-mono text-white tracking-tight my-1">
                {netWeightKg.toFixed(2)}
                <span className="text-2xl text-emerald-400 font-sans ml-2">kg</span>
              </div>
              <div className="text-xs text-neutral-400 font-mono">
                Gross: {grossWeight} kg • Pan Deduction: -{tarePreset} kg
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10 text-xs font-mono">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-neutral-400 uppercase">Estimated Portions</div>
                <div className="text-base font-bold text-white">{estimatedPortions} portions</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-neutral-400 uppercase">Estimated Loss</div>
                <div className="text-base font-bold text-[#ffdcc3]">₹{estimatedCost.toLocaleString()}</div>
              </div>
            </div>

            {/* Digital Scale Footnote */}
            <div className="mt-4 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
              <span>Sensor: Precision Strain-Gauge</span>
              <span>Auto-Calibration: OK</span>
            </div>
          </div>

          {/* Floor Executive Compliance Card */}
          <div 
            className="bg-white border border-[#e5e2e1] p-5 shadow-[2px_8px_24px_rgba(28,27,27,0.03)]"
            style={{ borderRadius: '22px 25px 21px 24px' }}
          >
            <div className="text-[11px] font-bold text-[#777771] uppercase tracking-wider font-space mb-2 flex items-center justify-between">
              <span>Floor Executive Protocol</span>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Rule 3.4 Active
              </span>
            </div>
            <p className="text-xs text-[#474741] leading-relaxed">
              To prevent misreporting and tampering with state food scrap records, each kitchen floor's scale log must be stamped by the floor's designated head chef.
            </p>

            <div className="mt-3.5 pt-3 border-t border-[#e5e2e1] space-y-2">
              {Object.entries(FLOOR_EXECUTIVES).map(([distKey, exec]) => {
                const isThisFloor = selectedDistrict === distKey;
                const isThisUser = currentUser.id === exec.executiveId;
                return (
                  <div 
                    key={distKey}
                    className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                      isThisFloor ? 'bg-[#fcf7f2] border border-[#c76c00]/30' : 'bg-[#faf8f6]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={exec.avatar} alt={exec.executiveName} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-[#1c1b1b]">{exec.executiveName}</div>
                        <div className="text-[10px] text-[#777771]">{exec.floorName.split('—')[0]}</div>
                      </div>
                    </div>
                    {isThisUser ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Logged In
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          const u = USERS.find(user => user.id === exec.executiveId);
                          if (u) switchUser(u);
                        }}
                        className="text-[10px] font-mono text-[#c76c00] hover:underline cursor-pointer"
                      >
                        Switch to {exec.executiveName.split(' ')[0]}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Official Floor Scale Weight Ledger Table */}
      <div 
        className="bg-white border border-[#e5e2e1] p-6 md:p-8 shadow-[2px_12px_32px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] min-w-0"
        style={{ borderRadius: '24px 28px 23px 27px' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#e5e2e1]">
          <div>
            <div className="text-[11px] font-bold text-[#777771] uppercase tracking-wider font-space flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#c76c00]" />
              <span>OFFICIAL FLOOR SCALE LEDGER</span>
            </div>
            <h3 className="text-xl font-bold text-[#1c1b1b] font-space mt-0.5">
              Logged Foodstuff Measurements ({logs.length} Records)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Exporting signed floor audit ledger to CSV...')}
              className="text-xs font-space font-medium text-[#474741] bg-[#faf8f6] hover:bg-neutral-100 border border-[#e5e2e1] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#777771]" />
              <span>Export Ledger</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-space">
            <thead>
              <tr className="border-b border-[#e5e2e1] text-[11px] text-[#777771] uppercase tracking-wider font-mono">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Foodstuff Item</th>
                <th className="py-2.5 px-3">Shift</th>
                <th className="py-2.5 px-3">Scrap Type</th>
                <th className="py-2.5 px-3 text-right">Net Weight</th>
                <th className="py-2.5 px-3 text-right">Est. Loss</th>
                <th className="py-2.5 px-3 text-center">Certified Executive</th>
                <th className="py-2.5 px-3 text-right">Signature Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e2e1]/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#fcfbf9] transition-colors">
                  <td className="py-3 px-3 text-[#777771] font-mono whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#1c1b1b] whitespace-nowrap">
                    {log.itemName}
                  </td>
                  <td className="py-3 px-3 text-[#777771] capitalize whitespace-nowrap">
                    {log.mealSlot}
                  </td>
                  <td className="py-3 px-3 text-[#474741] whitespace-nowrap">
                    <span className="bg-[#f5f2ee] px-2 py-0.5 rounded text-[11px] border border-[#e5e2e1]">
                      {log.scrapType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#1c1b1b] whitespace-nowrap">
                    {Number(log.netWeightKg).toFixed(2)} kg
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#c76c00] whitespace-nowrap">
                    ₹{Number(log.costLost).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {log.loggedBy}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[10px] text-[#777771] whitespace-nowrap">
                    {log.signatureHash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
