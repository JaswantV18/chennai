const fs = require('fs');
let content = fs.readFileSync('src/components/ChennaiMap.tsx', 'utf8');

const createCustomIconReplacement = `const createCustomIcon = (
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
      rainHtml += \`<div class="rain-drop" style="left: \${left}px; animation-delay: \${delay}s; animation-duration: \${duration}s; height: \${10 + Math.random() * 10}px;"></div>\`;
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

  const html = \`
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      transform: scale(\${isSelected ? 1.25 : 1});
      z-index: \${isSelected ? 1000 : 1};
      filter: drop-shadow(0px 0px \${isSelected ? "12px" : "4px"} rgba(0,0,0,0.8));
      position: relative;
    ">
      \${rainHtml}
      \${isSelected ? \`
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
          \${name}
        </div>
      \` : ""}
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #16171D;
        background-color: \${color};
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        color: #16171D;
        font-size: \${String(formattedValue).length > 3 ? '10px' : '12px'};
        font-weight: 900;
        letter-spacing: -0.5px;
      ">
        \${formattedValue}
      </div>
    </div>
  \`;
  return L.divIcon({
    html,
    className: "custom-leaflet-icon",
    iconSize: [40, isSelected ? 65 : 40],
    iconAnchor: [20, isSelected ? 50 : 20],
  });
};`;

content = content.replace(
  /const createCustomIcon = \([\s\S]*?className: "custom-leaflet-icon",\s*iconSize: \[40, isSelected \? 65 : 40\],\s*iconAnchor: \[20, isSelected \? 50 : 20\],\s*}\);\s*};/,
  createCustomIconReplacement
);

const metricHandlingOld = `          if (selectedMetric === "aqi") {
            metricValue = (zone as any).metrics?.aqi || zone.aqi || 0;
            color = metricValue > 150 ? "#EF4444" : metricValue > 100 ? "#F97316" : metricValue > 50 ? "#EAB308" : "#22C55E";
          } else if (selectedMetric === "temp" || (selectedMetric as string) === "temperature") {
            metricValue = (zone as any).metrics?.temperature || zone.temp || 0;
            color = metricValue > 36 ? "#DC2626" : metricValue > 33 ? "#F97316" : "#3B82F6";
          } else if (selectedMetric === "rainfall") {
            metricValue = (zone as any).metrics?.rainfall || zone.rainfall || 0;
            color = metricValue > 5 ? "#3B82F6" : "#A1A1AA";
          }`;

const metricHandlingNew = `          if (selectedMetric === "aqi") {
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
          }`;

content = content.replace(metricHandlingOld, metricHandlingNew);

content = content.replace(
  'const customIcon = createCustomIcon(color, metricValue, isSelected, zone.name, currentRainfall);',
  'const customIcon = createCustomIcon(color, metricValue, isSelected, zone.name, currentRainfall, selectedMetric);'
);

fs.writeFileSync('src/components/ChennaiMap.tsx', content);
console.log("Patched Map successfully");
