const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("Policy Assistant", "AI Search Assistant");
content = content.replace("Powered by Gemini 3.5 Flash", "Powered by Gemini & Google Search");
content = content.replace("Ask about policies...", "Ask anything, searching live...");

fs.writeFileSync('src/App.tsx', content);
