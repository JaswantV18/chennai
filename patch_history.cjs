const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace generateMockHistory
const generateMockHistoryRegex = /function generateMockHistory\(\) \{[\s\S]*?return historyList;\n\}/;
code = code.replace(generateMockHistoryRegex, 'function generateMockHistory() {\n  return [];\n}');

fs.writeFileSync('server.ts', code, 'utf8');
console.log("Replaced generateMockHistory");
