const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("Powered by Gemini & Google Search", "Powered by Gemini 3.6 Flash");
content = content.replace("AI Search Assistant", "AI Policy Assistant");
content = content.replace("Ask anything, searching live...", "Ask about policies...");

fs.writeFileSync('src/App.tsx', content);
