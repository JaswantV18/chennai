const fs = require('fs');
let content = fs.readFileSync('src/components/ZoneDetailsCard.tsx', 'utf8');

content = content.replace(
  "import { Sparkles } from 'lucide-react';",
  "import { Sparkles } from 'lucide-react';\nimport HistoricalChart from './HistoricalChart';\nimport { HistoryRecord } from '../types';"
);

content = content.replace(
  "interface Props {\n  zone: ZoneData;\n}",
  "interface Props {\n  zone: ZoneData;\n  history?: HistoryRecord[];\n}"
);

content = content.replace(
  "export default function ZoneDetailsCard({ zone }: Props) {",
  "export default function ZoneDetailsCard({ zone, history }: Props) {"
);

// add chart right before ML Forest
content = content.replace(
  "{/* Machine Learning / Random Forest Prediction Predictor */}",
  "{history && history.length > 0 && <HistoricalChart zoneId={zone.id} history={history} />}\n\n      {/* Machine Learning / Random Forest Prediction Predictor */}"
);

fs.writeFileSync('src/components/ZoneDetailsCard.tsx', content);
