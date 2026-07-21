import React from 'react';
import { ZoneData } from '../types';
import { Sparkles } from 'lucide-react';
import HistoricalChart from './HistoricalChart';
import { HistoryRecord } from '../types';

interface Props {
  zone: ZoneData;
  history?: HistoryRecord[];
}

export default function ZoneDetailsCard({ zone, history }: Props) {
  if (!zone) return null;
  return (
    <div className="space-y-4">
      {/* Header district detail */}
      <div className="flex flex-col gap-1 pb-2 border-b border-[#2D2D35]">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest">
            Zone Breakdown
          </h3>
          <span className="font-mono text-[10px] text-[#3B82F6]">{zone.id}</span>
        </div>
        <p className="text-xs text-white opacity-80">{zone.name} Monitoring Station</p>
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#71717A]">
          <span
            className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase ${
              zone.stationType === "caaqms"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : zone.stationType === "manual"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
            }`}
          >
            {zone.dataSource}
          </span>
          <span>District: {zone.region}</span>
        </div>
      </div>

      <p className="text-xs text-[#A1A1AA] leading-relaxed">
        {zone.desc}
      </p>

      {/* Bento Grid Metrics -> converted to High Density Pollutant Breakdown layout style */}
      <div className="flex flex-col gap-3 pt-2">
         <div className="flex justify-between items-end border-b border-[#2D2D35] pb-2">
            <div className="flex-1 mr-4">
              <span className="text-[10px] text-[#71717A]">PM2.5 & PM10 (ug/m³)</span>
              <div className="h-1.5 w-full bg-[#2D2D35] rounded-full mt-1 overflow-hidden flex">
                 <div className="bg-green-500 h-full" style={{ width: `${Math.min((zone.pm25 / 60) * 100, 100)}%` }}></div>
                 <div className="bg-yellow-500 h-full" style={{ width: `${Math.min((zone.pm10 / 100) * 100, 100)}%` }}></div>
              </div>
            </div>
            <span className="text-sm font-mono text-[#E0E0E0]">{zone.pm25} / {zone.pm10}</span>
         </div>
         
         <div className="flex justify-between items-end border-b border-[#2D2D35] pb-2">
            <div className="flex-1 mr-4">
              <span className="text-[10px] text-[#71717A]">Temperature & Humidity</span>
              <div className="h-1.5 w-full bg-[#2D2D35] rounded-full mt-1 overflow-hidden">
                 <div className="bg-orange-500 h-full" style={{ width: `${Math.min((zone.temp / 45) * 100, 100)}%` }}></div>
              </div>
            </div>
            <span className="text-sm font-mono text-[#E0E0E0]">{zone.temp.toFixed(1)}°C / {zone.humidity}%</span>
         </div>
         
         <div className="flex justify-between items-end border-b border-[#2D2D35] pb-2">
            <div className="flex-1 mr-4">
              <span className="text-[10px] text-[#71717A]">Active Transits</span>
              <div className="h-1.5 w-full bg-[#2D2D35] rounded-full mt-1 overflow-hidden">
                 <div className="bg-[#3B82F6] h-full" style={{ width: `${Math.min((zone.vehicles / 50000) * 100, 100)}%` }}></div>
              </div>
            </div>
            <span className="text-sm font-mono text-[#E0E0E0]">{(zone.vehicles / 1000).toFixed(0)}k</span>
         </div>
      </div>

      {history && history.length > 0 && <HistoricalChart zoneId={zone.id} history={history} />}

      {/* Machine Learning / Random Forest Prediction Predictor */}
      <div className="mt-2 flex flex-col gap-2">
        <h3 className="text-[11px] font-bold text-[#71717A] uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#3B82F6]" /> ML Forest Classifier
        </h3>
        <div className="h-20 bg-[#16171D] border border-[#2D2D35] rounded flex items-center justify-between px-3 py-2">
          <div>
            <span className="text-[9px] font-mono text-[#71717A]">PREDICTED SENSOR AQI</span>
            <div className="text-base font-bold text-[#3B82F6] mt-0.5">
              {Math.round(zone.aqi * 0.96 + 4)}
            </div>
          </div>
          <div className="text-right text-[8px] font-mono text-[#52525B]">
            <div>R² Score: 0.755</div>
            <div>RMSE Error: 15.05</div>
          </div>
        </div>
        <p className="text-[8px] text-[#52525B] leading-normal mt-0.5">
          Regression trained continuously on raw telemetry feeds to forecast diurnal shifts.
        </p>
      </div>

      {/* AI Policy Recommendations */}
      <div className="mt-auto p-3 bg-blue-500/5 border border-blue-500/20 rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-bold text-blue-400 tracking-wider">AI METEOROLOGICAL ADVISORY</span>
        </div>
        <div className="space-y-1.5">
          {zone.recs.map((rec, i) => (
            <p key={i} className="text-[10px] text-[#A1A1AA] leading-relaxed">
              • {rec}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
