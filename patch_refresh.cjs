const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const refreshRegex = /app\.post\("\/api\/refresh", \(req, res\) => \{\n\s*fetchRealWaqiData\(\);\n\s*currentCountdown = 900; \/\/ Reset countdown\n\s*res\.json\(\{[\s\S]*?\}\);\n\}\);/;

const newRefresh = `app.post("/api/refresh", async (req, res) => {
  await fetchRealWaqiData();
  currentCountdown = 900; // Reset countdown
  res.json({
    success: true,
    message: "Manually synchronized with WAQI network successfully.",
    zones: db.zones,
    countdown: currentCountdown,
  });
});`;

if (code.match(refreshRegex)) {
  code = code.replace(refreshRegex, newRefresh);
  fs.writeFileSync('server.ts', code, 'utf8');
  console.log("Patched refresh endpoint");
} else {
  console.log("refresh endpoint not found");
}

