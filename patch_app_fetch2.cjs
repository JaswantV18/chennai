const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const statusRes = await fetch\("\/api\/status"\);\n\s*const statusData = await statusRes\.json\(\);/,
  `const statusRes = await fetch("/api/status", { headers: { "Accept": "application/json" } });
      if (statusRes.headers.get("content-type")?.includes("text/html")) throw new Error("Proxy");
      const statusData = await statusRes.json();`
);

code = code.replace(
  /const historyRes = await fetch\("\/api\/history"\);\n\s*const historyData = await historyRes\.json\(\);/,
  `const historyRes = await fetch("/api/history", { headers: { "Accept": "application/json" } });
      if (historyRes.headers.get("content-type")?.includes("text/html")) throw new Error("Proxy");
      const historyData = await historyRes.json();`
);

code = code.replace(
  /const res = await fetch\("\/api\/refresh", \{ method: "POST" \}\);\n\s*const data = await res\.json\(\);/,
  `const res = await fetch("/api/refresh", { method: "POST", headers: { "Accept": "application/json" } });
      if (res.headers.get("content-type")?.includes("text/html")) throw new Error("Proxy");
      const data = await res.json();`
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched App.tsx fetch 2");
