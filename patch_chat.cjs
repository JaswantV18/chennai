const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldChat = `const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: fullPrompt,
    });`;

const newChat = `const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: fullPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });`;

content = content.replace(oldChat, newChat);

// Also change the prompt to indicate it's a general assistant with search capabilities.
const oldPrompt = "const fullPrompt = `You are the Chennai Sustainability AI Advisor, an expert in urban planning, climate resilience, and environmental metrics.\\nContext:\\n${zoneContext || \"The user is looking at the overall Chennai city-wide dashboard.\"}\\n\\nGlobal Metrics Available: Air Quality Index (AQI), Temperature, Humidity, Rainfall, Vehicle Count, Population, and Population Density.\\nChennai's 16 Zones include standard monitoring stations as well as newly integrated stations: Kodungaiyur (North, dumpyard/heavy industry), Koyambedu (West, wholesale market/major transit hub), Perungudi (South, IT corridor/southern landfill), and Kathivakkam (North, port/power complexes).\\n\\nPlease answer the user's question with precise local knowledge, urban planning strategies specific to Chennai, and actionable environmental advice. Keep your response highly readable, structured, and informative.\\n\\nUser Question: \"${prompt}\"`;";

const newPrompt = "const fullPrompt = `You are an AI Search Assistant embedded in the Chennai Sustainability Dashboard. You have access to real-time search to answer any user queries. Although your primary context is Chennai Sustainability, you can answer general queries as well using your search capabilities.\\n\\nContext:\\n${zoneContext || \"The user is looking at the overall Chennai city-wide dashboard.\"}\\n\\nPlease answer the user's question accurately using search if needed. Keep your response highly readable, structured, and informative.\\n\\nUser Question: \"${prompt}\"`;";

content = content.replace(oldPrompt, newPrompt);
fs.writeFileSync('server.ts', content);
