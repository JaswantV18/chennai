const fs = require('fs');
let codeApp = fs.readFileSync('src/App.tsx', 'utf8');

codeApp = codeApp.replace(
  /We engineered a high-fidelity <strong>Meteorological Vector Engine<\/strong>\. It utilizes real baseline data from official IMD, TNPCB, and CPCB channels, and computes continuous simulated variations dynamically\./,
  'We integrate real-time air quality data directly from the <strong>World Air Quality Index (WAQI)<\/strong> network.'
);

fs.writeFileSync('src/App.tsx', codeApp, 'utf8');

let codeIntro = fs.readFileSync('src/components/IntroPortal.tsx', 'utf8');
codeIntro = codeIntro.replace(
  /Empowering urban researchers, community groups, and citizens with real-time CPCB and TNPCB environmental sensor data across Chennai's 16 dynamic zones\./,
  "Empowering urban researchers, community groups, and citizens with live environmental sensor data sourced via the WAQI network across Chennai's 16 dynamic zones."
);

fs.writeFileSync('src/components/IntroPortal.tsx', codeIntro, 'utf8');
console.log("Patched texts");
