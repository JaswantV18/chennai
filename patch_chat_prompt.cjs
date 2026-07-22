const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regex = /const fullPrompt = `You are the Chennai Sustainability AI Advisor[\s\S]*?User Question: "\$\{prompt\}"`;/;

const newPrompt = "const fullPrompt = `You are an AI Search Assistant embedded in the Chennai Sustainability Dashboard. You have access to real-time search to answer any user queries. Although your primary context is Chennai Sustainability, you can answer general queries as well using your search capabilities.\\n\\nContext:\\n${zoneContext || \"The user is looking at the overall Chennai city-wide dashboard.\"}\\n\\nPlease answer the user's question accurately using search if needed. Keep your response highly readable, structured, and informative.\\n\\nUser Question: \"${prompt}\"`;";

content = content.replace(regex, newPrompt);
fs.writeFileSync('server.ts', content);
