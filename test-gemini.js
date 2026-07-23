import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: "What is the weather in Chennai?",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err.message || err);
  }
}
run();
