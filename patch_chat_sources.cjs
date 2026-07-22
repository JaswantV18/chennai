const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldResJson = `res.json({
      success: true,
      text: response.text || "I was unable to formulate a response at this moment.",
    });`;

const newResJson = `
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
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

content = content.replace(oldResJson, newResJson);
fs.writeFileSync('server.ts', content);
