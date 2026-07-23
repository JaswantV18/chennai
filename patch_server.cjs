const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regexChat = /const response = await ai.models.generateContent\(\{[\s\S]*?\}\);/;
const replacementChat = `const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: fullPrompt,
    });`;

content = content.replace(regexChat, replacementChat);

const regexChunks = /const chunks = response\.candidates\?\.\[0\]\?\.groundingMetadata\?\.groundingChunks;[\s\S]*?sources = chunks[\s\S]*?\}\s*res\.json\(\{/m;
const replacementChunks = `res.json({`;
// Let's just use string replace for chunks parsing.

const oldRes = `    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let sources = [];
    if (chunks) {
      sources = chunks
        .filter(c => c.web)
        .map(c => ({ uri: c.web.uri, title: c.web.title }));
    }

    res.json({
      success: true,
      text: response.text || "I was unable to formulate a response at this moment.",
      sources,
    });`;

const newRes = `    res.json({
      success: true,
      text: response.text || "I was unable to formulate a response at this moment.",
      sources: [],
    });`;

content = content.replace(oldRes, newRes);
content = content.replace(/model: "gemini-1\.5-flash"/g, 'model: "gemini-3.6-flash"');

fs.writeFileSync('server.ts', content);
