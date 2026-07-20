const fs = require('fs');
let code = fs.readFileSync('src/components/IntroPortal.tsx', 'utf8');

code = code.replace(
  /const res = await fetch\("\/api\/auth\/otp", \{\n\s*method: "POST",\n\s*headers: \{ "Content-Type": "application\/json" \},/g,
  `const res = await fetch("/api/auth/otp", {\n        method: "POST",\n        headers: { "Content-Type": "application/json", "Accept": "application/json" },`
);

code = code.replace(
  /const res = await fetch\("\/api\/auth\/verify", \{\n\s*method: "POST",\n\s*headers: \{ "Content-Type": "application\/json" \},/g,
  `const res = await fetch("/api/auth/verify", {\n        method: "POST",\n        headers: { "Content-Type": "application/json", "Accept": "application/json" },`
);

code = code.replace(
  /const res = await fetch\("\/api\/auth\/register", \{\n\s*method: "POST",\n\s*headers: \{ "Content-Type": "application\/json" \},/g,
  `const res = await fetch("/api/auth/register", {\n        method: "POST",\n        headers: { "Content-Type": "application/json", "Accept": "application/json" },`
);

// add HTML check
code = code.replace(
  /const data = await res\.json\(\);/g,
  `if (res.headers.get("content-type")?.includes("text/html")) throw new Error("Proxy error");\n      const data = await res.json();`
);

fs.writeFileSync('src/components/IntroPortal.tsx', code, 'utf8');
console.log("Patched IntroPortal.tsx fetch");
