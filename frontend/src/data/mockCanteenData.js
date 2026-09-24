// frontend/src/data/mockCanteenData.js

/**
 * Normal Inverse Cumulative Distribution Function (Quantile function)
 * Uses Abramowitz & Stegun rational approximation (formula 26.2.23)
 * Accurate within 4.5e-4 across (0, 1)
 */
export function normalInvCDF(p) {
  if (p <= 0.0001) return -3.75;
  if (p >= 0.9999) return 3.75;
  
  const a = [2.515517, 0.802853, 0.010328];
  const b = [1.432788, 0.189269, 0.001308];
  
  const isLower = p < 0.5;
  const q = isLower ? p : 1.0 - p;
  const t = Math.sqrt(-2.0 * Math.log(q));
  
  const numerator = a[0] + a[1] * t + a[2] * t * t;
  const denominator = 1.0 + b[0] * t + b[1] * t * t + b[2] * t * t * t;
  const z = t - (numerator / denominator);
  
  return isLower ? -z : z;
}

/**
 * Calculates Newsvendor optimal safety buffer and cook target.
 * CR = shortage_penalty / (cost_per_portion + shortage_penalty)
 * Z = normalInvCDF(CR)
 * Buffer = round(Z * rolling_std_7d)
 */
export function calculateNewsvendorBuffer(cost, penalty, stdDev, multiplier = 1.0) {
  const criticalRatio = penalty / (cost + penalty);
  const zScore = normalInvCDF(criticalRatio);
  const rawBuffer = Math.round(zScore * stdDev * multiplier);
  return {
    criticalRatio: parseFloat(criticalRatio.toFixed(3)),
    zScore: parseFloat(zScore.toFixed(2)),
    bufferPortions: Math.max(0, rawBuffer)
  };
}

export const DISTRICT_METADATA = {
  amaravati: {
    id: 'amaravati',
    name: 'Amaravati',
    fullName: 'Amaravati Capital Complex',
    clusterName: 'Secretariat & High Court Central Dining',
    leadChef: 'Lakshmi Priya (Executive Head)',
    coordinates: { x: 50, y: 46 }, // Map vector % coords
    wasteSeverity: 'LOW', // <8%
    wasteRate: 7.1,
    wasteRateTrend: -1.8,
    todayMeals: 2840,
    mealsTrendPct: 6.2,
    foodPreparedKg: 2130,
    foodConsumedKg: 1979,
    wastePreventedKg: 215,
    estimatedCostSaved: 17200,
    estimatedCo2AvoidedTons: 0.54,
    headline: 'Waste is down 21.3% this month in Amaravati.',
    subtext: 'Demand forecasting and legislative session scheduling have minimized overpreparation.',
    currentWeather: {
      tempMaxC: 29.5,
      precipitationMm: 1.2,
      condition: 'Partly Sunny',
      alert: false,
      bannerText: '🏛️ AP Legislative Assembly in Session (+22% visitor volume anticipated)'
    },
    dominantDish: 'Pesarattu Upma & Mudda Pappu'
  },
  guntur: {
    id: 'guntur',
    name: 'Guntur',
    fullName: 'Guntur Central Canteen',
    clusterName: 'Industrial & Agricultural University Kitchen Floor',
    leadChef: 'Suresh Reddy (Floor Chef & Manager)',
    coordinates: { x: 38, y: 64 },
    wasteSeverity: 'MEDIUM', // 8-15%
    wasteRate: 9.3,
    wasteRateTrend: -1.2,
    todayMeals: 2486,
    mealsTrendPct: 4.1,
    foodPreparedKg: 1920,
    foodConsumedKg: 1742,
    wastePreventedKg: 178,
    estimatedCostSaved: 14240,
    estimatedCo2AvoidedTons: 0.42,
    headline: 'Waste is down 18.4% this month in Guntur.',
    subtext: 'Demand forecasting and portion optimization are helping reduce unnecessary preparation across Guntur Central Canteen.',
    currentWeather: {
      tempMaxC: 33.2,
      precipitationMm: 14.8,
      condition: 'Thunderstorm Warning',
      alert: true,
      bannerText: '🌧️ Monsoon Heavy Rain Alert Active (+15% indoor tiffin & comfort food shift)'
    },
    dominantDish: 'Guntur Karam Dosa & Gongura Rice'
  },
  vijayawada: {
    id: 'vijayawada',
    name: 'Vijayawada',
    fullName: 'Vijayawada Junction Hub',
    clusterName: 'Railway Transit & Commercial Regional Canteen',
    leadChef: 'K. Venkatesh (Operations Lead)',
    coordinates: { x: 68, y: 35 },
    wasteSeverity: 'HIGH', // >15%
    wasteRate: 16.2,
    wasteRateTrend: +0.6,
    todayMeals: 3250,
    mealsTrendPct: 12.5,
    foodPreparedKg: 2680,
    foodConsumedKg: 2246,
    wastePreventedKg: 135,
    estimatedCostSaved: 10800,
    estimatedCo2AvoidedTons: 0.32,
    headline: 'Waste is elevated (+1.4%) in Vijayawada Transit Hub.',
    subtext: 'Train delay passenger surges caused evening overpreparation. Adjusting safety buffers recommended.',
    currentWeather: {
      tempMaxC: 31.8,
      precipitationMm: 0.0,
      condition: 'Clear Sky',
      alert: false,
      bannerText: '🚆 Railway Junction Peak Transit Hours (Shift volatility +18%)'
    },
    dominantDish: 'Vijayawada Chicken Biryani & Poori Korma'
  }
};

/**
 * Menu items with full 14 domain attributes + dual units + rotating menu continuity
 */
export const MENU_ITEMS_BY_DISTRICT = {
  amaravati: [
    {
      id: 'am-1',
      itemName: 'Pesarattu Upma',
      category: 'Breakfast_Tiffins',
      mealSlot: 'breakfast',
      portionKg: 0.20,
      batchUnit: 'Tiffin Crate',
      portionsPerBatch: 30,
      isOnMenu: 1,
      // 14 Schema Attributes
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 1.2,
      tempMaxC: 29.5,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 1,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 1,
      demandLag1: 340,
      demandLag7: 310,
      rollingMean7d: 325,
      rollingStd7d: 22.4,
      costPerPortion: 35,
      shortagePenalty: 80,
      forecastedDemand: 345,
      shifterReason: '🏛️ Assembly Session (+15%)',
      shifterBadgeColor: 'blue',
      status: 'Stable'
    },
    {
      id: 'am-2',
      itemName: 'Masala Dosa',
      category: 'Breakfast_Tiffins',
      mealSlot: 'breakfast',
      portionKg: 0.18,
      batchUnit: 'Batter Vat',
      portionsPerBatch: 40,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 1.2,
      tempMaxC: 29.5,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 1,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 420,
      demandLag7: 390,
      rollingMean7d: 410,
      rollingStd7d: 28.5,
      costPerPortion: 40,
      shortagePenalty: 75,
      forecastedDemand: 430,
      shifterReason: '⚡ High Morning Traffic (+10%)',
      shifterBadgeColor: 'emerald',
      status: 'Stable'
    },
    {
      id: 'am-3',
      itemName: 'Rava Upma with Chutney',
      category: 'Breakfast_Tiffins',
      mealSlot: 'breakfast',
      portionKg: 0.22,
      batchUnit: 'Handi',
      portionsPerBatch: 50,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 1.2,
      tempMaxC: 29.5,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 210,
      demandLag7: 195,
      rollingMean7d: 205,
      rollingStd7d: 14.1,
      costPerPortion: 25,
      shortagePenalty: 50,
      forecastedDemand: 210,
      shifterReason: 'Regular Morning Flow',
      shifterBadgeColor: 'slate',
      status: 'Stable'
    },
    {
      id: 'am-4',
      itemName: 'Mudda Pappu & Avakai Rice',
      category: 'Staples_Rice',
      mealSlot: 'lunch',
      portionKg: 0.32,
      batchUnit: 'Brass Handi',
      portionsPerBatch: 50,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 1.2,
      tempMaxC: 29.5,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 1,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 1,
      demandLag1: 510,
      demandLag7: 480,
      rollingMean7d: 495,
      rollingStd7d: 31.0,
      costPerPortion: 45,
      shortagePenalty: 90,
      forecastedDemand: 525,
      shifterReason: '🏛️ Secretariat VIP Lunch (+18%)',
      shifterBadgeColor: 'blue',
      status: 'Volatile'
    },
    {
      id: 'am-5',
      itemName: 'Andhra Veg Meals (Thali)',
      category: 'Veg_Mains',
      mealSlot: 'lunch',
      portionKg: 0.45,
      batchUnit: 'Thali Set Batch',
      portionsPerBatch: 25,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 1.2,
      tempMaxC: 29.5,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 1,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 620,
      demandLag7: 590,
      rollingMean7d: 610,
      rollingStd7d: 35.8,
      costPerPortion: 65,
      shortagePenalty: 120,
      forecastedDemand: 635,
      shifterReason: 'High Lunch Crowd (+8%)',
      shifterBadgeColor: 'emerald',
      status: 'Stable'
    },
    {
      id: 'am-6',
      itemName: 'Dibba Rotti with Chutney',
      category: 'Snacks_Evening',
      mealSlot: 'snacks',
      portionKg: 0.18,
      batchUnit: 'Tawa Pan Tray',
      portionsPerBatch: 25,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 1.2,
      tempMaxC: 29.5,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 180,
      demandLag7: 175,
      rollingMean7d: 178,
      rollingStd7d: 16.2,
      costPerPortion: 30,
      shortagePenalty: 55,
      forecastedDemand: 185,
      shifterReason: 'Evening Tea Traffic',
      shifterBadgeColor: 'slate',
      status: 'Stable'
    },
    {
      id: 'am-7',
      itemName: 'Curd Rice with Pomegranate',
      category: 'Staples_Rice',
      mealSlot: 'dinner',
      portionKg: 0.28,
      batchUnit: 'Cold Storage Tub',
      portionsPerBatch: 40,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 1.2,
      tempMaxC: 29.5,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 320,
      demandLag7: 310,
      rollingMean7d: 315,
      rollingStd7d: 18.5,
      costPerPortion: 35,
      shortagePenalty: 60,
      forecastedDemand: 320,
      shifterReason: 'Stable Dinner Finisher',
      shifterBadgeColor: 'emerald',
      status: 'Stable'
    },
    {
      id: 'am-8',
      itemName: 'Paneer Butter Masala with Pulka',
      category: 'Veg_Mains',
      mealSlot: 'dinner',
      portionKg: 0.35,
      batchUnit: 'Handi',
      portionsPerBatch: 35,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 1.2,
      tempMaxC: 29.5,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 290,
      demandLag7: 280,
      rollingMean7d: 285,
      rollingStd7d: 24.1,
      costPerPortion: 60,
      shortagePenalty: 110,
      forecastedDemand: 295,
      shifterReason: 'Dinner Special',
      shifterBadgeColor: 'slate',
      status: 'Stable'
    },
    {
      id: 'am-9',
      itemName: 'Chicken Dum Biryani (Off-Menu)',
      category: 'Non_Veg_Mains',
      mealSlot: 'lunch',
      portionKg: 0.38,
      batchUnit: 'Biryani Handi',
      portionsPerBatch: 50,
      isOnMenu: 0,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 1.2,
      tempMaxC: 29.5,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 1,
      specialMenuFlag: 0,
      demandLag1: 0,
      demandLag7: 420,
      rollingMean7d: 0,
      rollingStd7d: 0,
      costPerPortion: 75,
      shortagePenalty: 120,
      forecastedDemand: 0,
      shifterReason: '🥦 Tuesday Meatless Day (0 Cook Target)',
      shifterBadgeColor: 'amber',
      status: 'Inactive'
    }
  ],
  guntur: [
    {
      id: 'gn-1',
      itemName: 'Steamed Idli with Podi & Sambar',
      category: 'Breakfast_Tiffins',
      mealSlot: 'breakfast',
      portionKg: 0.14,
      batchUnit: 'Steamer Rack',
      portionsPerBatch: 60,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 14.8,
      tempMaxC: 33.2,
      weatherSeverityAlert: 1,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 450,
      demandLag7: 410,
      rollingMean7d: 435,
      rollingStd7d: 26.5,
      costPerPortion: 28,
      shortagePenalty: 65,
      forecastedDemand: 460,
      shifterReason: '🌧️ Heavy Rain Alert (+12%)',
      shifterBadgeColor: 'blue',
      status: 'Stable'
    },
    {
      id: 'gn-2',
      itemName: 'Guntur Karam Dosa',
      category: 'Breakfast_Tiffins',
      mealSlot: 'breakfast',
      portionKg: 0.18,
      batchUnit: 'Tawa Pan Tray',
      portionsPerBatch: 30,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 14.8,
      tempMaxC: 33.2,
      weatherSeverityAlert: 1,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 1,
      demandLag1: 390,
      demandLag7: 350,
      rollingMean7d: 375,
      rollingStd7d: 32.8,
      costPerPortion: 38,
      shortagePenalty: 85,
      forecastedDemand: 410,
      shifterReason: '🌧️ Spicy Comfort Food Surge (+18%)',
      shifterBadgeColor: 'amber',
      status: 'Volatile'
    },
    {
      id: 'gn-3',
      itemName: 'Gongura Rice with Onion Raita',
      category: 'Staples_Rice',
      mealSlot: 'lunch',
      portionKg: 0.30,
      batchUnit: 'Biryani Handi',
      portionsPerBatch: 50,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 14.8,
      tempMaxC: 33.2,
      weatherSeverityAlert: 1,
      departmentMeetingFlag: 1,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 1,
      demandLag1: 480,
      demandLag7: 430,
      rollingMean7d: 460,
      rollingStd7d: 36.2,
      costPerPortion: 42,
      shortagePenalty: 95,
      forecastedDemand: 495,
      shifterReason: '🌶️ Regional Favorite (+15%)',
      shifterBadgeColor: 'emerald',
      status: 'Volatile'
    },
    {
      id: 'gn-4',
      itemName: 'Andhra Spicy Chicken Curry',
      category: 'Non_Veg_Mains',
      mealSlot: 'lunch',
      portionKg: 0.38,
      batchUnit: 'Curry Cauldron',
      portionsPerBatch: 40,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 14.8,
      tempMaxC: 33.2,
      weatherSeverityAlert: 1,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 410,
      demandLag7: 390,
      rollingMean7d: 400,
      rollingStd7d: 38.0,
      costPerPortion: 78,
      shortagePenalty: 130,
      forecastedDemand: 420,
      shifterReason: 'Non-Veg Peak Lunch',
      shifterBadgeColor: 'slate',
      status: 'Volatile'
    },
    {
      id: 'gn-5',
      itemName: 'Tomato Pappu with Ghee & Rice',
      category: 'Veg_Mains',
      mealSlot: 'lunch',
      portionKg: 0.32,
      batchUnit: 'Brass Handi',
      portionsPerBatch: 50,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 14.8,
      tempMaxC: 33.2,
      weatherSeverityAlert: 1,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 360,
      demandLag7: 340,
      rollingMean7d: 350,
      rollingStd7d: 19.5,
      costPerPortion: 32,
      shortagePenalty: 70,
      forecastedDemand: 365,
      shifterReason: 'Stable Staples Core',
      shifterBadgeColor: 'emerald',
      status: 'Stable'
    },
    {
      id: 'gn-6',
      itemName: 'Guntur Mirchi Bajji (3 pcs)',
      category: 'Snacks_Evening',
      mealSlot: 'snacks',
      portionKg: 0.16,
      batchUnit: 'Frying Basket',
      portionsPerBatch: 30,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 14.8,
      tempMaxC: 33.2,
      weatherSeverityAlert: 1,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 1,
      demandLag1: 290,
      demandLag7: 240,
      rollingMean7d: 265,
      rollingStd7d: 29.4,
      costPerPortion: 22,
      shortagePenalty: 45,
      forecastedDemand: 310,
      shifterReason: '🌧️ Monsoon Rain Surge (+25%)',
      shifterBadgeColor: 'amber',
      status: 'Volatile'
    },
    {
      id: 'gn-7',
      itemName: 'Guntur Punugulu with Chutney',
      category: 'Snacks_Evening',
      mealSlot: 'snacks',
      portionKg: 0.15,
      batchUnit: 'Frying Basket',
      portionsPerBatch: 35,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 14.8,
      tempMaxC: 33.2,
      weatherSeverityAlert: 1,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 220,
      demandLag7: 190,
      rollingMean7d: 205,
      rollingStd7d: 18.2,
      costPerPortion: 20,
      shortagePenalty: 40,
      forecastedDemand: 235,
      shifterReason: 'Batter Re-purposing Active',
      shifterBadgeColor: 'emerald',
      status: 'Stable'
    },
    {
      id: 'gn-8',
      itemName: 'Pulka with Mixed Veg Kurma',
      category: 'Veg_Mains',
      mealSlot: 'dinner',
      portionKg: 0.28,
      batchUnit: 'Hot Casserole',
      portionsPerBatch: 40,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 14.8,
      tempMaxC: 33.2,
      weatherSeverityAlert: 1,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 310,
      demandLag7: 295,
      rollingMean7d: 305,
      rollingStd7d: 17.8,
      costPerPortion: 35,
      shortagePenalty: 65,
      forecastedDemand: 315,
      shifterReason: 'Light Dinner Option',
      shifterBadgeColor: 'slate',
      status: 'Stable'
    },
    {
      id: 'gn-9',
      itemName: 'Natukodi Pulusu (Off-Menu)',
      category: 'Non_Veg_Mains',
      mealSlot: 'dinner',
      portionKg: 0.40,
      batchUnit: 'Pot',
      portionsPerBatch: 30,
      isOnMenu: 0,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 14.8,
      tempMaxC: 33.2,
      weatherSeverityAlert: 1,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 0,
      demandLag7: 210,
      rollingMean7d: 0,
      rollingStd7d: 0,
      costPerPortion: 95,
      shortagePenalty: 150,
      forecastedDemand: 0,
      shifterReason: 'Weekend Special Only',
      shifterBadgeColor: 'slate',
      status: 'Inactive'
    }
  ],
  vijayawada: [
    {
      id: 'vja-1',
      itemName: 'Andhra Poha (Atukulu Upma)',
      category: 'Breakfast_Tiffins',
      mealSlot: 'breakfast',
      portionKg: 0.18,
      batchUnit: 'Wok Tray',
      portionsPerBatch: 40,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 0.0,
      tempMaxC: 31.8,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 380,
      demandLag7: 350,
      rollingMean7d: 365,
      rollingStd7d: 28.0,
      costPerPortion: 26,
      shortagePenalty: 60,
      forecastedDemand: 390,
      shifterReason: 'Transit Quick Breakfast',
      shifterBadgeColor: 'slate',
      status: 'Stable'
    },
    {
      id: 'vja-2',
      itemName: 'Poori with Potato Korma (3 pcs)',
      category: 'Breakfast_Tiffins',
      mealSlot: 'breakfast',
      portionKg: 0.24,
      batchUnit: 'Frying Basket Tray',
      portionsPerBatch: 35,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 0.0,
      tempMaxC: 31.8,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 1,
      demandLag1: 520,
      demandLag7: 460,
      rollingMean7d: 490,
      rollingStd7d: 44.5,
      costPerPortion: 36,
      shortagePenalty: 80,
      forecastedDemand: 540,
      shifterReason: '🚆 Train Arrivals Surge (+15%)',
      shifterBadgeColor: 'amber',
      status: 'Volatile'
    },
    {
      id: 'vja-3',
      itemName: 'Vijayawada Special Chicken Biryani',
      category: 'Non_Veg_Mains',
      mealSlot: 'lunch',
      portionKg: 0.38,
      batchUnit: 'Biryani Handi',
      portionsPerBatch: 50,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 0.0,
      tempMaxC: 31.8,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 1,
      demandLag1: 710,
      demandLag7: 640,
      rollingMean7d: 680,
      rollingStd7d: 58.2,
      costPerPortion: 82,
      shortagePenalty: 140,
      forecastedDemand: 740,
      shifterReason: '🔥 Peak Transit Demand (+20%)',
      shifterBadgeColor: 'amber',
      status: 'Volatile'
    },
    {
      id: 'vja-4',
      itemName: 'Veg Dum Biryani with Mirchi ka Salan',
      category: 'Veg_Mains',
      mealSlot: 'lunch',
      portionKg: 0.35,
      batchUnit: 'Biryani Handi',
      portionsPerBatch: 50,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 0.0,
      tempMaxC: 31.8,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 440,
      demandLag7: 410,
      rollingMean7d: 425,
      rollingStd7d: 31.0,
      costPerPortion: 55,
      shortagePenalty: 95,
      forecastedDemand: 450,
      shifterReason: 'Stable Lunch Veggie Core',
      shifterBadgeColor: 'emerald',
      status: 'Stable'
    },
    {
      id: 'vja-5',
      itemName: 'Masala Fish Fry',
      category: 'Non_Veg_Mains',
      mealSlot: 'lunch',
      portionKg: 0.20,
      batchUnit: 'Tawa Pan Tray',
      portionsPerBatch: 25,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 0.0,
      tempMaxC: 31.8,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 210,
      demandLag7: 185,
      rollingMean7d: 195,
      rollingStd7d: 25.5,
      costPerPortion: 70,
      shortagePenalty: 110,
      forecastedDemand: 215,
      shifterReason: 'Perishable Fish Fresh Catch',
      shifterBadgeColor: 'slate',
      status: 'Volatile'
    },
    {
      id: 'vja-6',
      itemName: 'Masala Vada with Coconut Chutney',
      category: 'Snacks_Evening',
      mealSlot: 'snacks',
      portionKg: 0.14,
      batchUnit: 'Frying Basket',
      portionsPerBatch: 40,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 0.0,
      tempMaxC: 31.8,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 340,
      demandLag7: 310,
      rollingMean7d: 325,
      rollingStd7d: 24.8,
      costPerPortion: 20,
      shortagePenalty: 45,
      forecastedDemand: 345,
      shifterReason: 'Evening Commuter Flow',
      shifterBadgeColor: 'slate',
      status: 'Stable'
    },
    {
      id: 'vja-7',
      itemName: 'Egg Bhurji with Parotta',
      category: 'Non_Veg_Mains',
      mealSlot: 'dinner',
      portionKg: 0.30,
      batchUnit: 'Pan Casserole',
      portionsPerBatch: 30,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 0.0,
      tempMaxC: 31.8,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 290,
      demandLag7: 270,
      rollingMean7d: 280,
      rollingStd7d: 22.0,
      costPerPortion: 42,
      shortagePenalty: 75,
      forecastedDemand: 295,
      shifterReason: 'Night Traveler Favorite',
      shifterBadgeColor: 'emerald',
      status: 'Stable'
    },
    {
      id: 'vja-8',
      itemName: 'Bagara Rice with Dalcha',
      category: 'Staples_Rice',
      mealSlot: 'dinner',
      portionKg: 0.32,
      batchUnit: 'Biryani Handi',
      portionsPerBatch: 50,
      isOnMenu: 1,
      dayOfWeek: 2,
      isHoliday: 0,
      daysToPayday: 18,
      isLongWeekend: 0,
      precipitationMm: 0.0,
      tempMaxC: 31.8,
      weatherSeverityAlert: 0,
      departmentMeetingFlag: 0,
      macroDietaryPeriod: 'None',
      recurringMeatlessDay: 0,
      specialMenuFlag: 0,
      demandLag1: 310,
      demandLag7: 290,
      rollingMean7d: 300,
      rollingStd7d: 21.5,
      costPerPortion: 38,
      shortagePenalty: 70,
      forecastedDemand: 310,
      shifterReason: 'Dinner Rice Core',
      shifterBadgeColor: 'slate',
      status: 'Stable'
    }
  ]
};

/**
 * Waste breakdown by category (Where is food being wasted?)
 */
export const CATEGORY_WASTE_DATA = [
  { category: 'Rice & Biryani Grains', percentage: 42, kg: 74.8, cost: 5980, color: '#10B981' },
  { category: 'Veg Curries & Kurma', percentage: 24, kg: 42.7, cost: 4270, color: '#F59E0B' },
  { category: 'Dal, Sambar & Pappu', percentage: 17, kg: 30.3, cost: 1818, color: '#3B82F6' },
  { category: 'Chapati & Breads', percentage: 11, kg: 19.6, cost: 1176, color: '#EC4899' },
  { category: 'Snacks & Chutneys', percentage: 6, kg: 10.6, cost: 996, color: '#8B5CF6' }
];

/**
 * Bi-color dish consumption vs leftovers discarded (Trash Split)
 */
export const CONSUMPTION_VS_TRASH = {
  guntur: [
    { name: 'Gongura Rice', eatenPortions: 440, trashedPortions: 55, eatenKg: 132.0, trashedKg: 16.5, costLost: 2310 },
    { name: 'Andhra Chicken Curry', eatenPortions: 385, trashedPortions: 35, eatenKg: 146.3, trashedKg: 13.3, costLost: 2730 },
    { name: 'Karam Dosa', eatenPortions: 375, trashedPortions: 35, eatenKg: 67.5, trashedKg: 6.3, costLost: 1330 },
    { name: 'Steamed Idli', eatenPortions: 435, trashedPortions: 25, eatenKg: 60.9, trashedKg: 3.5, costLost: 700 },
    { name: 'Tomato Pappu', eatenPortions: 340, trashedPortions: 25, eatenKg: 108.8, trashedKg: 8.0, costLost: 800 },
    { name: 'Mirchi Bajji', eatenPortions: 290, trashedPortions: 20, eatenKg: 46.4, trashedKg: 3.2, costLost: 440 }
  ],
  amaravati: [
    { name: 'Andhra Veg Thali', eatenPortions: 600, trashedPortions: 35, eatenKg: 270.0, trashedKg: 15.75, costLost: 2275 },
    { name: 'Mudda Pappu Rice', eatenPortions: 495, trashedPortions: 30, eatenKg: 158.4, trashedKg: 9.6, costLost: 1350 },
    { name: 'Masala Dosa', eatenPortions: 410, trashedPortions: 20, eatenKg: 73.8, trashedKg: 3.6, costLost: 800 },
    { name: 'Pesarattu Upma', eatenPortions: 325, trashedPortions: 20, eatenKg: 65.0, trashedKg: 4.0, costLost: 700 },
    { name: 'Curd Rice', eatenPortions: 305, trashedPortions: 15, eatenKg: 85.4, trashedKg: 4.2, costLost: 525 }
  ],
  vijayawada: [
    { name: 'Chicken Biryani', eatenPortions: 630, trashedPortions: 110, eatenKg: 239.4, trashedKg: 41.8, costLost: 9020 },
    { name: 'Poori Korma', eatenPortions: 460, trashedPortions: 80, eatenKg: 110.4, trashedKg: 19.2, costLost: 2880 },
    { name: 'Veg Dum Biryani', eatenPortions: 390, trashedPortions: 60, eatenKg: 136.5, trashedKg: 21.0, costLost: 3300 },
    { name: 'Atukulu Upma', eatenPortions: 350, trashedPortions: 40, eatenKg: 63.0, trashedKg: 7.2, costLost: 1040 },
    { name: 'Masala Fish Fry', eatenPortions: 175, trashedPortions: 40, eatenKg: 35.0, trashedKg: 8.0, costLost: 2800 }
  ]
};

/**
 * Perishable Urgency Inventory Cards (Shelf-Life Radar)
 */
export const INVENTORY_AT_RISK = [
  {
    id: 'inv-1',
    item: 'Vine-Ripened Country Tomatoes',
    category: 'Perishable Produce',
    quantityKg: 18,
    expiryHours: 18,
    urgencyLevel: 'HIGH_RISK',
    actionText: 'Prep batch of Tomato Pappu & Sambar base immediately',
    icon: '🍅'
  },
  {
    id: 'inv-2',
    item: 'Fermented Idli Batter',
    category: 'Prepared Base',
    quantityKg: 7,
    expiryHours: 8,
    urgencyLevel: 'CRITICAL',
    actionText: 'Re-purpose into Evening Punugulu & Onion Dosa',
    icon: '🥣'
  },
  {
    id: 'inv-3',
    item: 'Fresh Gongura Leaves',
    category: 'Leafy Greens',
    quantityKg: 5,
    expiryHours: 24,
    urgencyLevel: 'MODERATE_RISK',
    actionText: 'Cook into Gongura Pachadi preserve for extended life',
    icon: '🌿'
  },
  {
    id: 'inv-4',
    item: 'Fresh Malai Paneer',
    category: 'Dairy',
    quantityKg: 6,
    expiryHours: 10,
    urgencyLevel: 'HIGH_RISK',
    actionText: 'Prioritize Paneer Kurma for Dinner slot',
    icon: '🧀'
  },
  {
    id: 'inv-5',
    item: 'Dry Toor Dal & Potatoes',
    category: 'Dry Staples',
    quantityKg: 42,
    expiryHours: 168,
    urgencyLevel: 'STABLE_OVERSTOCKED',
    actionText: 'Overstocked: Pause supplier delivery for next 48 hrs',
    icon: '🥔'
  }
];

/**
 * 4 Meal Shifts Operational Breakdown
 */
export const SHIFT_EFFICIENCY_DATA = {
  guntur: [
    { shift: 'Breakfast', slot: '07:00 - 10:30', preparedKg: 460, consumedKg: 432, wastedKg: 28, efficiencyPct: 93.9, wastePct: 6.1 },
    { shift: 'Lunch', slot: '12:00 - 15:00', preparedKg: 850, consumedKg: 775, wastedKg: 75, efficiencyPct: 91.2, wastePct: 8.8 },
    { shift: 'Snacks', slot: '16:30 - 18:30', preparedKg: 240, consumedKg: 221, wastedKg: 19, efficiencyPct: 92.1, wastePct: 7.9 },
    { shift: 'Dinner', slot: '19:30 - 22:00', preparedKg: 370, consumedKg: 314, wastedKg: 56, efficiencyPct: 84.9, wastePct: 15.1 }
  ],
  amaravati: [
    { shift: 'Breakfast', slot: '07:30 - 10:30', preparedKg: 510, consumedKg: 485, wastedKg: 25, efficiencyPct: 95.1, wastePct: 4.9 },
    { shift: 'Lunch', slot: '12:00 - 14:30', preparedKg: 980, consumedKg: 922, wastedKg: 58, efficiencyPct: 94.1, wastePct: 5.9 },
    { shift: 'Snacks', slot: '16:00 - 18:00', preparedKg: 220, consumedKg: 202, wastedKg: 18, efficiencyPct: 91.8, wastePct: 8.2 },
    { shift: 'Dinner', slot: '19:30 - 21:30', preparedKg: 420, consumedKg: 370, wastedKg: 50, efficiencyPct: 88.1, wastePct: 11.9 }
  ],
  vijayawada: [
    { shift: 'Breakfast', slot: '06:30 - 10:30', preparedKg: 580, consumedKg: 512, wastedKg: 68, efficiencyPct: 88.3, wastePct: 11.7 },
    { shift: 'Lunch', slot: '12:00 - 15:30', preparedKg: 1150, consumedKg: 975, wastedKg: 175, efficiencyPct: 84.8, wastePct: 15.2 },
    { shift: 'Snacks', slot: '16:30 - 19:00', preparedKg: 350, consumedKg: 308, wastedKg: 42, efficiencyPct: 88.0, wastePct: 12.0 },
    { shift: 'Dinner', slot: '19:30 - 23:00', preparedKg: 600, consumedKg: 451, wastedKg: 149, efficiencyPct: 75.2, wastePct: 24.8 }
  ]
};

/**
 * Cross-District Taste Showdown (Dish consumption per 1,000 visitors)
 */
export const TASTE_SHOWDOWN_DATA = [
  { dish: 'Biryani & Pulao', amaravati: 180, guntur: 240, vijayawada: 390 },
  { dish: 'Gongura Specialties', amaravati: 140, guntur: 320, vijayawada: 190 },
  { dish: 'Karam & Masala Dosa', amaravati: 260, guntur: 290, vijayawada: 210 },
  { dish: 'Mudda Pappu / Thali', amaravati: 340, guntur: 220, vijayawada: 160 },
  { dish: 'Evening Bajjis & Vadas', amaravati: 150, guntur: 280, vijayawada: 240 }
];

/**
 * Pre-computes full batch plan row using Newsvendor formulation
 */
export function getAugmentedBatchCookPlan(districtId, bufferMultiplier = 1.0) {
  const items = MENU_ITEMS_BY_DISTRICT[districtId] || MENU_ITEMS_BY_DISTRICT.guntur;
  
  return items.map((item) => {
    if (item.isOnMenu === 0) {
      return {
        ...item,
        criticalRatio: 0,
        zScore: 0,
        safetyBufferPortions: 0,
        optimalCookPortions: 0,
        optimalCookKg: 0,
        batchesRequired: 0,
        batchDisplay: '0 batches (Off-Menu)'
      };
    }

    const { criticalRatio, zScore, bufferPortions } = calculateNewsvendorBuffer(
      item.costPerPortion,
      item.shortagePenalty,
      item.rollingStd7d,
      bufferMultiplier
    );

    const optimalCookPortions = item.forecastedDemand + bufferPortions;
    const optimalCookKg = parseFloat((optimalCookPortions * item.portionKg).toFixed(1));
    const batchesRequired = Math.ceil(optimalCookPortions / item.portionsPerBatch);
    const batchDisplay = `${optimalCookPortions} portions (${optimalCookKg} kg / ${batchesRequired} ${item.batchUnit}s)`;

    return {
      ...item,
      criticalRatio,
      zScore,
      safetyBufferPortions: bufferPortions,
      optimalCookPortions,
      optimalCookKg,
      batchesRequired,
      batchDisplay
    };
  });
}

export const USERS = [
  // --- ADMIN PROFILES (Statewide AP Access) ---
  {
    id: 'admin-rao',
    name: 'K. S. Rao',
    role: 'ADMIN',
    roleLabel: 'Admin (State Dining Director)',
    title: 'State Dining Operations Director',
    assignedDistrict: 'amaravati',
    department: 'AP State Canteen Authority - Amaravati Secretariat',
    badge: 'Statewide Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'admin-ananya',
    name: 'Dr. Ananya Sharma',
    role: 'ADMIN',
    roleLabel: 'Admin (Chief Waste Auditor)',
    title: 'Chief Sustainability & Carbon Auditor',
    assignedDistrict: 'amaravati',
    department: 'State Green Protocol & Waste Mitigation Cell',
    badge: 'Statewide Admin',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'admin-rajesh',
    name: 'Rajesh Varma',
    role: 'ADMIN',
    roleLabel: 'Admin (Regional Logistics Lead)',
    title: 'Central Supply Chain & Procurement Lead',
    assignedDistrict: 'vijayawada',
    department: 'Krishna-Guntur Food Logistics Network',
    badge: 'Statewide Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },

  // --- KITCHEN USER / MANAGER PROFILES (District Locked) ---
  {
    id: 'mgr-suresh',
    name: 'Suresh Reddy',
    role: 'OUTLET_MANAGER',
    roleLabel: 'Manager (Guntur Central)',
    title: 'Kitchen Floor & Production Manager',
    assignedDistrict: 'guntur',
    department: 'Guntur Central Canteen Kitchen Floor',
    badge: 'Guntur Floor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'mgr-lakshmi',
    name: 'Lakshmi Priya',
    role: 'OUTLET_MANAGER',
    roleLabel: 'Executive Chef (Amaravati Core)',
    title: 'Executive Head Chef - Amaravati',
    assignedDistrict: 'amaravati',
    department: 'Secretariat & High Court Dining Complex',
    badge: 'Amaravati Floor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'mgr-venkatesh',
    name: 'K. Venkatesh',
    role: 'OUTLET_MANAGER',
    roleLabel: 'Manager (Vijayawada Hub)',
    title: 'Transit Kitchen Floor Supervisor',
    assignedDistrict: 'vijayawada',
    department: 'Vijayawada Multi-Modal Kitchen Hub',
    badge: 'Vijayawada Floor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-pooja',
    name: 'Pooja Sundaram',
    role: 'OUTLET_MANAGER',
    roleLabel: 'Staff (Quality & Nutrition QA)',
    title: 'Dietary Compliance & Quality Officer',
    assignedDistrict: 'guntur',
    department: 'Guntur Agricultural University Dining Unit',
    badge: 'Guntur Staff',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-manoj',
    name: 'Manoj Kumar',
    role: 'OUTLET_MANAGER',
    roleLabel: 'Staff (Cold Storage & Pantry Lead)',
    title: 'Perishable Inventory & Pantry Lead',
    assignedDistrict: 'vijayawada',
    department: 'Vijayawada Central Perishable Store',
    badge: 'Vijayawada Staff',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  }
];

/**
 * Plate Waste vs Preparation Overproduction Telemetry
 */
export const PLATE_VS_PREP_DATA = {
  guntur: {
    totalWasteKg: 178,
    prepWasteKg: 104,
    plateWasteKg: 74,
    prepWasteCost: 8320,
    plateWasteCost: 5920,
    services: [
      { service: 'Breakfast', prepKg: 18, plateKg: 10, prepPct: 64, platePct: 36, driver: 'Excess Idli batter steamed too early' },
      { service: 'Lunch', prepKg: 46, plateKg: 29, prepPct: 61, platePct: 39, driver: 'Sambar & Gongura rice overproduction' },
      { service: 'Snacks', prepKg: 8, plateKg: 11, prepPct: 42, platePct: 58, driver: 'Chutney portion cups left unconsumed' },
      { service: 'Dinner', prepKg: 32, plateKg: 24, prepPct: 57, platePct: 43, driver: 'Late walk-ins drop off after 21:00' },
    ],
    chefObservation: 'Rice over-portioning on 1st helping drives 68% of lunch plate scrapings. Recommending dual-scoop policy.',
    chefSigned: 'Suresh R.',
    station: 'Guntur Central Station #2'
  },
  amaravati: {
    totalWasteKg: 111,
    prepWasteKg: 52,
    plateWasteKg: 59,
    prepWasteCost: 4420,
    plateWasteCost: 5015,
    services: [
      { service: 'Breakfast', prepKg: 11, plateKg: 14, prepPct: 44, platePct: 56, driver: 'Pesarattu upma heavy portions' },
      { service: 'Lunch', prepKg: 24, plateKg: 34, prepPct: 41, platePct: 59, driver: 'Secretariat thali fixed side dishes untouched' },
      { service: 'Snacks', prepKg: 6, plateKg: 4, prepPct: 60, platePct: 40, driver: 'Dibba rotti pan batch excess' },
      { service: 'Dinner', prepKg: 11, plateKg: 7, prepPct: 61, platePct: 39, driver: 'Predictable dinner flow from resident staff' },
    ],
    chefObservation: 'Executive lunch thalis contain 5 fixed cups; bitter gourd & radish sides generate 40kg plate waste.',
    chefSigned: 'Lakshmi P.',
    station: 'Amaravati Complex Station #1'
  },
  vijayawada: {
    totalWasteKg: 434,
    prepWasteKg: 282,
    plateWasteKg: 152,
    prepWasteCost: 22560,
    plateWasteCost: 12160,
    services: [
      { service: 'Breakfast', prepKg: 42, plateKg: 26, prepPct: 62, platePct: 38, driver: 'Train arrival delay caused morning idle hot trays' },
      { service: 'Lunch', prepKg: 118, plateKg: 57, prepPct: 67, platePct: 33, driver: 'Biryani batch size too large for late afternoon' },
      { service: 'Snacks', prepKg: 24, plateKg: 18, prepPct: 57, platePct: 43, driver: 'Deep fried vadas past holding temperature' },
      { service: 'Dinner', prepKg: 98, plateKg: 51, prepPct: 66, platePct: 34, driver: 'Cancelled night express trains stranded 120kg meals' },
    ],
    chefObservation: 'Unannounced railway schedule changes cause mass cauldron waste. Integrating IRCTC arrival webhook planned.',
    chefSigned: 'K. Venkatesh',
    station: 'Vijayawada Junction Bay #5'
  }
};

/**
 * 7-Day Actual vs. XGBoost Predicted Demand & Newsvendor Buffer Horizon
 */
export const FORECAST_HORIZON_DATA = {
  guntur: [
    { day: 'Thu', date: 'Sep 18', actual: 2340, predicted: 2310, optimalBuffer: 2390, weather: '☀️ Clear', accuracy: 98.7, status: 'Matched' },
    { day: 'Fri', date: 'Sep 19', actual: 2490, predicted: 2460, optimalBuffer: 2545, weather: '☀️ Clear', accuracy: 98.8, status: 'Matched' },
    { day: 'Sat', date: 'Sep 20', actual: 2150, predicted: 2180, optimalBuffer: 2260, weather: '⛅ Overcast', accuracy: 98.6, status: 'Matched' },
    { day: 'Sun', date: 'Sep 21', actual: 2680, predicted: 2610, optimalBuffer: 2710, weather: '🌧️ Rain Surge', accuracy: 97.4, status: 'Buffer Protected' },
    { day: 'Mon', date: 'Sep 22', actual: 2410, predicted: 2430, optimalBuffer: 2515, weather: '☀️ Clear', accuracy: 99.2, status: 'Matched' },
    { day: 'Tue', date: 'Sep 23', actual: 2290, predicted: 2270, optimalBuffer: 2355, weather: '🥦 Meatless', accuracy: 99.1, status: 'Matched' },
    { day: 'Wed', date: 'Today', actual: 2486, predicted: 2450, optimalBuffer: 2540, weather: '⛈️ Storm Alert', accuracy: 98.5, status: 'Matched' },
    { day: 'Thu', date: 'Tomorrow', actual: null, predicted: 2520, optimalBuffer: 2615, weather: '🌤️ 32.6°C', accuracy: null, status: 'XGBoost Inferred' }
  ],
  amaravati: [
    { day: 'Thu', date: 'Sep 18', actual: 2710, predicted: 2680, optimalBuffer: 2760, weather: '🏛️ Session', accuracy: 98.9, status: 'Matched' },
    { day: 'Fri', date: 'Sep 19', actual: 2830, predicted: 2800, optimalBuffer: 2885, weather: '🏛️ Session', accuracy: 98.9, status: 'Matched' },
    { day: 'Sat', date: 'Sep 20', actual: 1620, predicted: 1650, optimalBuffer: 1720, weather: 'Weekend', accuracy: 98.2, status: 'Matched' },
    { day: 'Sun', date: 'Sep 21', actual: 1480, predicted: 1450, optimalBuffer: 1530, weather: 'Weekend', accuracy: 98.0, status: 'Matched' },
    { day: 'Mon', date: 'Sep 22', actual: 2790, predicted: 2760, optimalBuffer: 2850, weather: '🏛️ Session', accuracy: 98.9, status: 'Matched' },
    { day: 'Tue', date: 'Sep 23', actual: 2750, predicted: 2720, optimalBuffer: 2810, weather: '🥦 Meatless', accuracy: 98.9, status: 'Matched' },
    { day: 'Wed', date: 'Today', actual: 2840, predicted: 2815, optimalBuffer: 2905, weather: '☀️ 29.5°C', accuracy: 99.1, status: 'Matched' },
    { day: 'Thu', date: 'Tomorrow', actual: null, predicted: 2890, optimalBuffer: 2980, weather: '🌤️ Session Day 4', accuracy: null, status: 'XGBoost Inferred' }
  ],
  vijayawada: [
    { day: 'Thu', date: 'Sep 18', actual: 3120, predicted: 3080, optimalBuffer: 3200, weather: '🚆 Peak Transit', accuracy: 98.7, status: 'Matched' },
    { day: 'Fri', date: 'Sep 19', actual: 3450, predicted: 3380, optimalBuffer: 3510, weather: '🚆 Holiday Rush', accuracy: 97.9, status: 'Buffer Protected' },
    { day: 'Sat', date: 'Sep 20', actual: 3380, predicted: 3320, optimalBuffer: 3460, weather: 'Transit High', accuracy: 98.2, status: 'Matched' },
    { day: 'Sun', date: 'Sep 21', actual: 3560, predicted: 3490, optimalBuffer: 3620, weather: 'Return Rush', accuracy: 98.0, status: 'Buffer Protected' },
    { day: 'Mon', date: 'Sep 22', actual: 3190, predicted: 3150, optimalBuffer: 3270, weather: 'Normal', accuracy: 98.7, status: 'Matched' },
    { day: 'Tue', date: 'Sep 23', actual: 2980, predicted: 2940, optimalBuffer: 3050, weather: '🥦 Meatless', accuracy: 98.7, status: 'Matched' },
    { day: 'Wed', date: 'Today', actual: 3250, predicted: 3210, optimalBuffer: 3340, weather: '🌤️ 31.8°C', accuracy: 98.8, status: 'Matched' },
    { day: 'Thu', date: 'Tomorrow', actual: null, predicted: 3310, optimalBuffer: 3445, weather: '🚆 Normal Schedule', accuracy: null, status: 'XGBoost Inferred' }
  ]
};

