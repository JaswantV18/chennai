const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{activeZone\.stationType === "caaqms"[\s\S]*?\? "TNPCB Manual"[\s\S]*?\: "Estimated Sensor"\}/;

if (code.match(regex)) {
  code = code.replace(regex, "{activeZone.dataSource}");
  fs.writeFileSync('src/App.tsx', code, 'utf8');
  console.log("Patched App.tsx dataSource");
} else {
  console.log("Could not find the stationType check");
}
