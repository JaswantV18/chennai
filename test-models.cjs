const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const res = await ai.models.list();
  console.log(JSON.stringify(res, null, 2));
}
run().catch(console.error);
