const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// I'll replace this part:
const badPart = `              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-[#52525B] font-mono text-xs">
              Select any Chennai zone to examine.
            </div>
          )}
        </aside>
      </main>`;

const goodPart = `              </div>
        </aside>
      </main>`;

content = content.replace(badPart, goodPart);

fs.writeFileSync('src/App.tsx', content);
