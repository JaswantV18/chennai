const fs = require('fs');
let content = fs.readFileSync('src/components/SitePlannerModal.tsx', 'utf8');

const oldPrint = `onClick={() => {
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
                      }}`;

const newPrint = `onClick={() => {
                        window.print();
                      }}`;

content = content.replace(oldPrint, newPrint);
fs.writeFileSync('src/components/SitePlannerModal.tsx', content);
