const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'import { HelpCircle',
  'import SitePlannerModal from "./components/SitePlannerModal";\nimport { HelpCircle'
);

content = content.replace(
  'const [faqModalOpen, setFaqModalOpen] = useState(false);',
  'const [faqModalOpen, setFaqModalOpen] = useState(false);\n  const [sitePlannerOpen, setSitePlannerOpen] = useState(false);'
);

content = content.replace(
  '{/* User Identity & Admin Panel buttons */}',
  `{/* User Identity & Admin Panel buttons */}
          <div className="flex items-center gap-3 pr-6">
            <button
              onClick={() => setSitePlannerOpen(true)}
              className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Map className="w-4 h-4" />
              Site Planner
            </button>
          </div>`
);

content = content.replace(
  '{faqModalOpen && (',
  `<SitePlannerModal isOpen={sitePlannerOpen} onClose={() => setSitePlannerOpen(false)} />\n      {faqModalOpen && (`
);

fs.writeFileSync('src/App.tsx', content);
console.log('patched App.tsx');
