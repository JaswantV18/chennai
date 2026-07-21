const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import for ZoneDetailsCard
content = content.replace(
  'import SitePlannerModal from "./components/SitePlannerModal";',
  'import SitePlannerModal from "./components/SitePlannerModal";\nimport ZoneDetailsCard from "./components/ZoneDetailsCard";'
);

// 2. We need to find the sidebar width class and change it if compareZone is selected
// Original: className="absolute top-4 right-4 bottom-4 w-[350px] border border-[#2D2D35] bg-[#0E0F14]/90 backdrop-blur-md rounded shadow-2xl p-4 flex flex-col shrink-0 overflow-y-auto no-scrollbar z-10 pointer-events-auto hidden md:flex"
// We want: \`absolute top-4 right-4 bottom-4 \${compareZoneId ? "w-[700px]" : "w-[350px]"} border border-[#2D2D35] bg-[#0E0F14]/90 backdrop-blur-md rounded shadow-2xl p-4 flex flex-col shrink-0 overflow-y-auto no-scrollbar z-10 pointer-events-auto hidden md:flex\`

content = content.replace(
  '<aside className="absolute top-4 right-4 bottom-4 w-[350px] border border-[#2D2D35] bg-[#0E0F14]/90 backdrop-blur-md rounded shadow-2xl p-4 flex flex-col shrink-0 overflow-y-auto no-scrollbar z-10 pointer-events-auto hidden md:flex">',
  '<aside className={`absolute top-4 right-4 bottom-4 ${compareZoneId ? "w-[700px]" : "w-[350px]"} border border-[#2D2D35] bg-[#0E0F14]/90 backdrop-blur-md rounded shadow-2xl p-4 flex flex-col shrink-0 overflow-y-auto no-scrollbar z-10 pointer-events-auto hidden md:flex transition-all duration-300`}>'
);

// 3. Replace the {activeZone ? ( <div className="space-y-4"> ... </div> ) ... with ZoneDetailsCard logic
// Also add the compare zone selector at the top.
const oldSidebarContent = fs.readFileSync('src/App.tsx', 'utf8').substring(
  fs.readFileSync('src/App.tsx', 'utf8').indexOf('{activeZone ? ('),
  fs.readFileSync('src/App.tsx', 'utf8').indexOf('{/* INTEGRATED CHENNAI SUSTAINABILITY AI CHAT */}')
);

const newSidebarContent = `
          {/* Compare Zone Selector */}
          <div className="mb-4 pb-4 border-b border-[#2D2D35] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">Compare Zones</h3>
            <select
              value={compareZoneId || ""}
              onChange={(e) => setCompareZoneId(e.target.value === "" ? null : e.target.value)}
              className="bg-[#1C1D24] border border-[#2D2D35] text-xs rounded px-2 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
            >
              <option value="">-- No Comparison --</option>
              {zones.filter(z => z.id !== selectedZoneId).map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          <div className={\`flex gap-4 mb-4 \${compareZoneId ? 'flex-row' : 'flex-col'}\`}>
            {activeZone && (
              <div className={compareZoneId ? "w-1/2" : "w-full"}>
                <ZoneDetailsCard zone={activeZone} />
              </div>
            )}
            
            {compareZoneId && compareZone && (
              <div className="w-1/2 border-l border-[#2D2D35] pl-4">
                <ZoneDetailsCard zone={compareZone} />
              </div>
            )}
          </div>
          
`;

content = content.replace(oldSidebarContent, newSidebarContent);

fs.writeFileSync('src/App.tsx', content);
