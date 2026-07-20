const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// replace the initialZones array with new one
const coords = {
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

// Find initialZones declaration
const initialZonesRegex = /const initialZones = \[\s*([\s\S]*?)\s*\];\s*\n\/\/ Helper/;
const match = code.match(initialZonesRegex);

if (match) {
    let zonesContent = match[1];
    
    // For each line starting with { id: "Z
    let newZonesContent = zonesContent.split('\n').map(line => {
        const idMatch = line.match(/id:\s*"([^"]+)"/);
        if (idMatch && coords[idMatch[1]]) {
            const { lat, lng } = coords[idMatch[1]];
            return line.replace(/region:\s*"[^"]+",\s*x:\s*[\d\.\-]+,\s*z:\s*[\d\.\-]+,/, `$& lat: ${lat}, lng: ${lng},`);
        }
        return line;
    }).join('\n');
    
    code = code.replace(initialZonesRegex, `const initialZones = [\n${newZonesContent}\n];\n\n// Helper`);
    fs.writeFileSync('server.ts', code, 'utf8');
    console.log("Updated initialZones with lat/lng");
} else {
    console.log("Could not find initialZones");
}

