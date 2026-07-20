const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/applyFluctuations\(\);/g, 'fetchRealWaqiData();');
fs.writeFileSync('server.ts', code, 'utf8');
console.log("Patched applyFluctuations calls");
