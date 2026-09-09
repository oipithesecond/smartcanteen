// frontend/src/components/analytics/ApRegionalMap.jsx
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Compass, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { DISTRICT_METADATA, TASTE_SHOWDOWN_DATA } from '../../data/mockCanteenData';

export default function ApRegionalMap() {
  const { selectedDistrict, setSelectedDistrict, isAdmin } = useDashboard();
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  if (!isAdmin) {
    return null;
  }

  const activeHoverData = hoveredDistrict ? DISTRICT_METADATA[hoveredDistrict] : null;

  return (
    <section id="ap-map" className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] text-[#777771] uppercase">
            REGIONAL OVERSIGHT
          </div>
          <h2 className="text-xl font-semibold text-[#1c1b1b] mt-0.5 font-space">
            Andhra Pradesh Regional Operations & Taste Radar
          </h2>
          <p className="text-xs text-[#777771] mt-0.5">
            Interactive district severity telemetry & cross-district consumption showdown across capital clusters.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-[#506354]">
            <span className="w-2 h-2 rounded-full bg-[#506354] inline-block" />
            &lt;8% Low Waste
          </span>
          <span className="flex items-center gap-1 text-[#c76c00]">
            <span className="w-2 h-2 rounded-full bg-[#c76c00] inline-block" />
            8–15% Moderate
          </span>
          <span className="flex items-center gap-1 text-[#ba1a1a]">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a] inline-block" />
            &gt;15% Critical
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0 items-stretch">
        {/* Left Column: Interactive Vector Map (7 cols, rounded-3xl, p-6) */}
        <div className="lg:col-span-7 bg-white border border-[#e5e2e1] rounded-3xl p-6 shadow-[2px_10px_28px_rgba(28,27,27,0.035),0_1px_3px_rgba(28,27,27,0.02)] flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#777771]" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#777771]">
                Krishna-Guntur Capital Belt (AP)
              </span>
            </div>
            <span className="text-[10px] text-[#777771]">Click node to switch branch</span>
          </div>

          {/* SVG Vector Map Container */}
          <div className="relative w-full h-[260px] bg-[#fdf8f7] rounded-2xl border border-[#e5e2e1] flex items-center justify-center p-4">
            <svg 
              viewBox="0 0 400 260" 
              className="w-full h-full"
            >
              {/* Regional Outline Contour */}
              <path
                d="M 40,60 C 90,30 180,20 280,45 C 330,60 370,110 360,170 C 350,220 290,240 220,230 C 150,220 90,200 60,160 C 35,130 20,90 40,60 Z"
                fill="#f1edec"
                stroke="#c8c7bf"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* River Krishna Flowing through the Capital Region */}
              <path
                d="M 50,110 Q 150,135 220,115 T 350,140"
                fill="none"
                stroke="#c8c7bf"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />
              <text x="290" y="132" fill="#777771" fontSize="9" fontWeight="600" fontFamily="Space Grotesk">Krishna River</text>

              {/* District Vector Nodes */}
              {Object.values(DISTRICT_METADATA).map((district) => {
                const isSelected = selectedDistrict === district.id;
                const isHovered = hoveredDistrict === district.id;

                // Color by waste severity
                const nodeColor = 
                  district.wasteSeverity === 'LOW' ? '#506354' :
                  district.wasteSeverity === 'MEDIUM' ? '#c76c00' : '#ba1a1a';

                const posX = district.coordinates.x * 3.8;
                const posY = district.coordinates.y * 2.4;

                return (
                  <g 
                    key={district.id}
                    onClick={() => setSelectedDistrict(district.id)}
                    onMouseEnter={() => setHoveredDistrict(district.id)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    className="cursor-pointer transition-transform duration-200"
                  >
                    {/* Ring for active selection */}
                    {isSelected && (
                      <circle
                        cx={posX}
                        cy={posY}
                        r="20"
                        fill="none"
                        stroke={nodeColor}
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={posX}
                      cy={posY}
                      r={isSelected ? "11" : "8"}
                      fill={nodeColor}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />

                    {/* District Label */}
                    <text
                      x={posX}
                      y={posY - 14}
                      textAnchor="middle"
                      fill="#1c1b1b"
                      fontSize="11"
                      fontWeight={isSelected ? "700" : "500"}
                      fontFamily="Space Grotesk"
                    >
                      {district.name} ({district.wasteRate}%)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* District Status Card */}
          <div className="mt-3.5 p-3.5 bg-[#fdf8f7] rounded-2xl border border-[#e5e2e1] text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#777771] uppercase font-bold">Selected Canteen</span>
                <div className="font-space font-semibold text-[#1c1b1b]">{DISTRICT_METADATA[selectedDistrict].fullName}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#777771] uppercase font-bold">Waste Severity</span>
                <div className="font-space font-bold text-[#506354]">{DISTRICT_METADATA[selectedDistrict].wasteRate}% Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Taste Showdown Comparison Chart (5 cols, rounded-2xl, p-5) */}
        <div className="lg:col-span-5 bg-white border border-[#e5e2e1] rounded-2xl p-5 shadow-[2px_8px_24px_rgba(28,27,27,0.03),0_1px_3px_rgba(28,27,27,0.02)] flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#777771]">
                REGIONAL COMPARISON
              </span>
              <h3 className="text-sm font-semibold text-[#1c1b1b] font-space">
                Cross-District Consumption vs. Waste
              </h3>
            </div>
            <span className="text-[10px] text-[#777771]">Normalized kg</span>
          </div>

          <div className="w-full h-[220px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TASTE_SHOWDOWN_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e2e1" />
                <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#1c1b1b', fontFamily: 'Space Grotesk' }} />
                <YAxis tick={{ fontSize: 10, fill: '#777771' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(80, 99, 84, 0.06)', radius: 4 }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    color: '#0f172a', 
                    fontSize: '11px', 
                    fontFamily: 'Space Grotesk',
                    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12)'
                  }}
                  itemStyle={{ color: '#334155' }}
                  labelStyle={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}
                />
                <Bar dataKey="consumedKg" fill="#1c1b1b" name="Consumed (kg)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="wastedKg" fill="#c76c00" name="Wasted (kg)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-[#e5e2e1] flex items-center justify-between text-xs text-[#777771]">
            <span>Guntur shows highest spice preference (Karam Dosa)</span>
            <span className="font-space font-semibold text-[#1c1b1b]">3 active hubs</span>
          </div>
        </div>
      </div>
    </section>
  );
}
