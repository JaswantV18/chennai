import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoryRecord } from '../types';

interface Props {
  zoneId: string;
  history: HistoryRecord[];
}

export default function HistoricalChart({ zoneId, history }: Props) {
  const data = history.map((record) => {
    const zoneMetrics = record.metrics.find((m) => m.zoneId === zoneId) || { aqi: 0, temp: 0 };
    // Format timestamp to just HH:MM
    const date = new Date(record.timestamp);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      time,
      aqi: zoneMetrics.aqi,
      temp: zoneMetrics.temp
    };
  });

  if (data.length === 0) return null;

  return (
    <div className="h-32 w-full mt-4">
      <h3 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 flex items-center justify-between">
        <span>24h AQI Trend</span>
        <span className="text-[9px] text-[#3B82F6] font-mono">Live Sync</span>
      </h3>
      <div className="h-full w-full bg-[#16171D] border border-[#2D2D35] rounded p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2D35" vertical={false} />
            <XAxis dataKey="time" stroke="#71717A" fontSize={8} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717A" fontSize={8} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0E0F14', borderColor: '#2D2D35', fontSize: '10px', color: '#fff' }}
              itemStyle={{ color: '#3B82F6' }}
            />
            <Area type="monotone" dataKey="aqi" stroke="#3B82F6" fillOpacity={1} fill="url(#colorAqi)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
