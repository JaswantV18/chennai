const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const activeZone = zones\.find\(\(z\) => z\.id === selectedZoneId\) \|\| zones\[0\];/;

if (code.match(regex)) {
  code = code.replace(regex, "const activeZone = zones.find((z) => z.id === selectedZoneId) || zones[0];\n\n  if (zones.length === 0) return <div className=\"min-h-screen flex items-center justify-center bg-[#09090B] text-white\">Loading live environmental data...</div>;");
  fs.writeFileSync('src/App.tsx', code, 'utf8');
  console.log("Patched loading state");
} else {
  console.log("Not found");
}
