import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ZoneData, SelectedMetric } from "../types";

interface ChennaiMapProps {
  zones: ZoneData[];
  selectedMetric: SelectedMetric;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  "Z01": { lat: 13.0418, lng: 80.2341 }, // T. Nagar
  "Z02": { lat: 13.0850, lng: 80.2101 }, // Anna Nagar
  "Z03": { lat: 12.9774, lng: 80.2231 }, // Velachery
  "Z04": { lat: 13.0368, lng: 80.2676 }, // Mylapore
  "Z05": { lat: 13.1143, lng: 80.1548 }, // Ambattur
  "Z06": { lat: 12.9009, lng: 80.2279 }, // Sholinganallur
  "Z07": { lat: 13.1611, lng: 80.3015 }, // Thiruvottiyur
  "Z08": { lat: 13.1660, lng: 80.2635 }, // Manali
  "Z09": { lat: 13.0012, lng: 80.2565 }, // Adyar
  "Z10": { lat: 13.0067, lng: 80.2206 }, // Guindy
  "Z11": { lat: 13.0336, lng: 80.1557 }, // Porur
  "Z12": { lat: 12.9964, lng: 80.2014 }, // Alandur
  "Z13": { lat: 13.1362, lng: 80.2467 }, // Kodungaiyur
  "Z14": { lat: 13.0682, lng: 80.1906 }, // Koyambedu
  "Z15": { lat: 12.9654, lng: 80.2458 }, // Perungudi
  "Z16": { lat: 13.2085, lng: 80.3201 }, // Kathivakkam
};

// Custom Hook to change map center based on selected zone
function MapUpdater({ lat, lng, zoom }: { lat: number, lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1 });
  }, [lat, lng, zoom, map]);
  return null;
}

// Function to create a custom divIcon for Leaflet
const createCustomIcon = (
  color: string,
  metricValue: number,
  isSelected: boolean,
  name: string,
  rainfall: number = 0,
  metricType: string = ""
) => {
  let rainHtml = '';
  if (rainfall > 0) {
    const drops = Math.min(Math.floor(rainfall * 2) + 2, 10);
    for(let i = 0; i < drops; i++) {
      const left = Math.random() * 40;
      const delay = Math.random() * 0.8;
      const duration = 0.5 + Math.random() * 0.5;
      rainHtml += `<div class="rain-drop" style="left: ${left}px; animation-delay: ${delay}s; animation-duration: ${duration}s; height: ${10 + Math.random() * 10}px;"></div>`;
    }
  }

  const formatMetric = (val: number, metric: string) => {
    if (metric === "population" || metric === "vehicles") {
      return val >= 1000 ? (val / 1000).toFixed(0) + "k" : val;
    }
    if (metric === "density") {
      return val >= 1000 ? (val / 1000).toFixed(1) + "k" : val;
    }
    return Math.round(val);
  };

  const formattedValue = formatMetric(metricValue, metricType);

  const html = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      transform: scale(${isSelected ? 1.25 : 1});
      z-index: ${isSelected ? 1000 : 1};
      filter: drop-shadow(0px 0px ${isSelected ? "12px" : "4px"} rgba(0,0,0,0.8));
      position: relative;
    ">
      ${rainHtml}
      ${isSelected ? `
        <div style="
          padding: 2px 8px;
          background: rgba(22, 23, 29, 0.9);
          color: white;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 1px;
          border-radius: 4px;
          border: 1px solid #3B82F6;
          white-space: nowrap;
          margin-bottom: 4px;
          backdrop-filter: blur(4px);
        ">
          ${name}
        </div>
      ` : ""}
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #16171D;
        background-color: ${color};
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        color: #16171D;
        font-size: ${String(formattedValue).length > 3 ? '10px' : '12px'};
        font-weight: 900;
        letter-spacing: -0.5px;
      ">
        ${formattedValue}
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "custom-leaflet-icon",
    iconSize: [40, isSelected ? 65 : 40],
    iconAnchor: [20, isSelected ? 50 : 20],
  });
};

export default function ChennaiMap({
  zones,
  selectedMetric,
  selectedZoneId,
  onSelectZone,
}: ChennaiMapProps) {
  // Calculate center based on selected zone, or default to Chennai
  let center: [number, number] = [13.0827, 80.2707];
  let zoom = 12;
  
  if (selectedZoneId && ZONE_COORDS[selectedZoneId]) {
    center = [ZONE_COORDS[selectedZoneId].lat, ZONE_COORDS[selectedZoneId].lng];
    zoom = 14;
  }

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%", backgroundColor: "#0A0B10" }}
        zoomControl={false}
      >
        <MapUpdater lat={center[0]} lng={center[1]} zoom={zoom} />
        
        {/* Dark mode carto tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {zones.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          let metricValue = 0;
          let color = "#3B82F6";
          
          if (selectedMetric === "aqi") {
            metricValue = (zone as any).metrics?.aqi || zone.aqi || 0;
            color = metricValue > 150 ? "#EF4444" : metricValue > 100 ? "#F97316" : metricValue > 50 ? "#EAB308" : "#22C55E";
          } else if (selectedMetric === "temp" || (selectedMetric as string) === "temperature") {
            metricValue = (zone as any).metrics?.temperature || zone.temp || 0;
            color = metricValue > 36 ? "#DC2626" : metricValue > 33 ? "#F97316" : "#3B82F6";
          } else if (selectedMetric === "rainfall") {
            metricValue = (zone as any).metrics?.rainfall || zone.rainfall || 0;
            color = metricValue > 5 ? "#3B82F6" : "#A1A1AA";
          } else if (selectedMetric === "humidity") {
            metricValue = (zone as any).metrics?.humidity || zone.humidity || 0;
            color = metricValue > 75 ? "#3B82F6" : "#22C55E";
          } else if (selectedMetric === "vehicles") {
            metricValue = (zone as any).metrics?.vehicles || zone.vehicles || 0;
            color = metricValue > 150000 ? "#EF4444" : metricValue > 100000 ? "#F97316" : "#EAB308";
          } else if (selectedMetric === "population") {
            metricValue = zone.pop || 0;
            color = metricValue > 150000 ? "#8B5CF6" : "#A855F7";
          } else if (selectedMetric === "density") {
            metricValue = zone.density || 0;
            color = metricValue > 25000 ? "#EC4899" : "#F472B6";
          }

          const position = ZONE_COORDS[zone.id] || { lat: 13.0827, lng: 80.2707 };
          const currentRainfall = (zone as any).metrics?.rainfall || zone.rainfall || 0;
          const customIcon = createCustomIcon(color, metricValue, isSelected, zone.name, currentRainfall, selectedMetric);

          return (
            <Marker
              key={zone.id}
              position={[position.lat, position.lng]}
              icon={customIcon}
              eventHandlers={{
                click: () => onSelectZone(zone.id),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
