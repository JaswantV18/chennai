const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const dbInitRegex = /const db = initDB\(\);/;

if (code.match(dbInitRegex)) {
  code = code.replace(dbInitRegex, "const db = initDB();\n\n// Initial fetch on server start\nfetchRealWaqiData();");
  fs.writeFileSync('server.ts', code, 'utf8');
  console.log("Patched init");
} else {
  console.log("init not found");
}

