const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const applyFluctuationsRegex = /\/\/ Simulated weather engine fluctuations\nfunction applyFluctuations\(\) \{[\s\S]*?saveDB\(db\);\n\}/;

const fetchRealWaqiData = `function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

async function fetchRealWaqiData() {
  const token = process.env.WAQI_API_TOKEN;
  if (!token) {
    console.log("WAQI_API_TOKEN not found, skipping fetch. (Please set it in .env)");
    return;
  }
  
  const now = new Date();
  const timeStr = now.toISOString().replace("T", " ").substring(0, 16);
  let anyUpdates = false;

  const promises = db.zones.map(async (z) => {
    try {
      const lat = (z as any).lat;
      const lng = (z as any).lng;
      if (!lat || !lng) return;

      const res = await fetch(\`https://api.waqi.info/feed/geo:\${lat};\${lng}/?token=\${token}\`);
      const json = await res.json();
      
      if (json.status === "ok" && json.data) {
        const d = json.data;
        
        let isEstimated = false;
        if (d.city && d.city.geo) {
            const stLat = d.city.geo[0];
            const stLon = d.city.geo[1];
            const dist = getDistanceFromLatLonInKm(lat, lng, stLat, stLon);
            if (dist > 15) { 
                isEstimated = true;
            }
        }
        
        const iaqi = d.iaqi || {};
        const safeVal = (obj, fallback) => (obj && typeof obj.v === 'number') ? obj.v : fallback;

        z.aqi = typeof d.aqi === 'number' ? d.aqi : z.aqi;
        z.pm25 = safeVal(iaqi.pm25, z.pm25);
        z.pm10 = safeVal(iaqi.pm10, z.pm10);
        z.no2 = safeVal(iaqi.no2, z.no2);
        z.co = safeVal(iaqi.co, z.co);
        z.o3 = safeVal(iaqi.o3, z.o3);
        z.temp = safeVal(iaqi.t, z.temp);
        z.humidity = safeVal(iaqi.h, z.humidity);
        
        z.lastReading = timeStr;
        const stationName = d.city ? d.city.name : "WAQI Station";
        const attribution = d.attributions && d.attributions.length > 0 ? d.attributions[0].name : "WAQI";
        
        if (isEstimated) {
            z.stationType = "estimated";
            z.dataSource = \`\${stationName} (estimated from regional average - no live station nearby)\`;
        } else {
            z.stationType = "caaqms";
            z.dataSource = \`\${stationName} (\${attribution})\`;
        }
        anyUpdates = true;
      }
    } catch (e) {
      console.error(\`Failed to fetch WAQI for zone \${z.name}:\`, (e as Error).message);
    }
  });

  await Promise.allSettled(promises);
  
  if (anyUpdates) {
    db.history.push({
      timestamp: timeStr,
      metrics: db.zones.map((z) => ({
        zoneId: z.id,
        aqi: z.aqi,
        temp: z.temp,
        humidity: z.humidity,
        rainfall: z.rainfall,
        vehicles: z.vehicles,
      })),
    });
    if (db.history.length > 48) {
      db.history.shift();
    }
    saveDB(db);
  }
}`;

if (code.match(applyFluctuationsRegex)) {
  code = code.replace(applyFluctuationsRegex, fetchRealWaqiData);
  fs.writeFileSync('server.ts', code, 'utf8');
  console.log("Replaced applyFluctuations with fetchRealWaqiData");
} else {
  console.log("applyFluctuations not found");
}

