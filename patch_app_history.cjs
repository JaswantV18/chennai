const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<ZoneDetailsCard zone={activeZone} />',
  '<ZoneDetailsCard zone={activeZone} history={historicalLogs} />'
);

content = content.replace(
  '<ZoneDetailsCard zone={compareZone} />',
  '<ZoneDetailsCard zone={compareZone} history={historicalLogs} />'
);

fs.writeFileSync('src/App.tsx', content);
