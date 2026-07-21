const fs = require('fs');
let content = fs.readFileSync('src/components/SitePlannerModal.tsx', 'utf8');

// Add Download and Printer icon imports
content = content.replace(
  "import { X, Map, Building, Sparkles, Loader2 } from 'lucide-react';",
  "import { X, Map, Building, Sparkles, Loader2, Download, Printer } from 'lucide-react';"
);

const oldResultArea = `{result ? (
                <div className="prose prose-invert prose-sm max-w-none text-[#E0E0E0] prose-headings:text-white prose-a:text-indigo-400">
                  <div className="markdown-body">
                    <Markdown>{result}</Markdown>
                  </div>
                </div>
              ) : (`;

const newResultArea = `{result ? (
                <div className="flex flex-col h-full">
                  <div className="flex justify-end gap-2 mb-2 pb-2 border-b border-[#2D2D35] shrink-0">
                    <button 
                      onClick={() => {
                        const blob = new Blob([result], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = \`Chennai_Site_Plan_\${businessType.replace(/\\s+/g, '_')}.md\`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-2 py-1 rounded bg-[#2D2D35] hover:bg-indigo-500/20 text-[#A1A1AA] hover:text-indigo-400 text-[10px] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3 h-3" /> EXPORT MD
                    </button>
                    <button 
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        printWindow?.document.write(\`
                          <html>
                            <head>
                              <title>Chennai Site Feasibility Report</title>
                              <style>
                                body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
                                h1, h2, h3 { color: #111; }
                                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                th { background-color: #f4f4f4; }
                              </style>
                            </head>
                            <body>
                               <h1>Chennai Site Feasibility Report</h1>
                               <p><strong>Business Type:</strong> \${businessType}</p>
                               <hr/>
                               <div style="white-space: pre-wrap;">\${result.replace(/#/g, ' ')}</div>
                            </body>
                          </html>
                        \`);
                        printWindow?.document.close();
                        printWindow?.print();
                      }}
                      className="px-2 py-1 rounded bg-[#2D2D35] hover:bg-indigo-500/20 text-[#A1A1AA] hover:text-indigo-400 text-[10px] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3 h-3" /> PRINT
                    </button>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-[#E0E0E0] prose-headings:text-white prose-a:text-indigo-400 overflow-y-auto pr-2 no-scrollbar">
                    <div className="markdown-body">
                      <Markdown>{result}</Markdown>
                    </div>
                  </div>
                </div>
              ) : (`;

content = content.replace(oldResultArea, newResultArea);

fs.writeFileSync('src/components/SitePlannerModal.tsx', content);
