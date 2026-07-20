const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldFetch = /const res = await fetch\("\/api\/data"\);\n\s*const data = await res\.json\(\);/;

const newFetch = `const res = await fetch("/api/data", { headers: { "Accept": "application/json" } });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Received HTML instead of JSON. The preview proxy might have intercepted the request.");
      }
      const data = await res.json();`;

code = code.replace(oldFetch, newFetch);
fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched App.tsx fetch");
