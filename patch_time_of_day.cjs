const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add timeOfDay state
content = content.replace(
  'const [selectedZoneId, setSelectedZoneId] = useState<string | null>("Z01");',
  `const [selectedZoneId, setSelectedZoneId] = useState<string | null>("Z01");\n  const [timeOfDay, setTimeOfDay] = useState<"Morning" | "Afternoon" | "Evening" | "Night">("Morning");\n  const [compareZoneId, setCompareZoneId] = useState<string | null>(null);`
);

// 2. Add time of day simulation function inside the component before activeZone
const simulationFunc = `
  const getSimulatedZone = (z: ZoneData) => {
    let tMult = 1, vMult = 1, aMult = 1;
    if (timeOfDay === "Morning") { tMult = 0.9; vMult = 1.2; aMult = 1.1; }
    else if (timeOfDay === "Afternoon") { tMult = 1.15; vMult = 0.8; aMult = 1.0; }
    else if (timeOfDay === "Evening") { tMult = 1.0; vMult = 1.3; aMult = 1.2; }
    else if (timeOfDay === "Night") { tMult = 0.8; vMult = 0.2; aMult = 0.8; }
    
    return {
      ...z,
      temp: z.temp * tMult,
      vehicles: z.vehicles * vMult,
      aqi: Math.round(z.aqi * aMult),
      pm25: Math.round(z.pm25 * aMult),
      pm10: Math.round(z.pm10 * aMult),
    };
  };

  const simulatedZones = zones.map(getSimulatedZone);
  const activeZone = simulatedZones.find((z) => z.id === selectedZoneId) || simulatedZones[0];
  const compareZone = compareZoneId ? simulatedZones.find((z) => z.id === compareZoneId) : null;
`;

content = content.replace(
  'const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];',
  simulationFunc
);

// We need to also use simulatedZones for the map
content = content.replace(
  '<ChennaiMap\n              zones={zones}',
  '<ChennaiMap\n              zones={simulatedZones}'
);

fs.writeFileSync('src/App.tsx', content);
