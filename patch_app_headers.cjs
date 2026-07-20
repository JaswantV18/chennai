const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /"Authorization": token \? \`Bearer \$\{token\}\` : ""/g,
  '"Authorization": token ? `Bearer ${token}` : "",\n          "Accept": "application/json"'
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched App.tsx headers");
