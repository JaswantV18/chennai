const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `

// --- SITE PLANNER API ---
app.post("/api/ai/site-planner", async (req, res) => {
  const { businessType, requirements } = req.body;
  if (!businessType) {
    return res.status(400).json({ success: false, message: "Business type is required." });
  }

  if (!ai) {
    return res.json({
      success: true,
      text: "Site Planner AI is currently offline. Please set up the GEMINI_API_KEY. Based on general heuristics, Adyar or T. Nagar are primary commercial zones in Chennai.",
    });
  }

  try {
    const allZonesContext = db.zones.map(z => 
      \`Zone \${z.name} (\${z.id}): Pop \${z.pop.toLocaleString()} (Density \${z.density}), AQI: \${z.aqi}, Green Cover: \${z.green}%, Vehicles: \${z.vehicles.toLocaleString()}\`
    ).join("\\n");

    const fullPrompt = \`You are the Chennai Sustainability AI & Site Planner Expert.
The user is planning to open a new site/business in Chennai and needs data-driven recommendations.

Business/Site Type: "\${businessType}"
Additional Requirements/Context: "\${requirements || 'None provided'}"

Here is the current live data for all Chennai zones:
\${allZonesContext}

Your task:
Analyze the zones and recommend the top 2 or 3 best zones for this specific site. 
For a supermarket, consider high population density, moderate vehicle density (for accessibility), and competition status (general knowledge of Chennai).
For a park, consider areas with lower green cover that need it, or areas with high pollution that need mitigation, and land availability heuristics.

Provide a structured, highly readable response with:
1. An executive summary of the strategy.
2. The recommended zones (with explicit mention of the data points like population, cost heuristics, and why it's a good fit).
3. Potential challenges (e.g., traffic congestion, high land cost, or competition).

Ensure the response is visually clean and uses markdown.\`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    res.json({
      success: true,
      text: response.text || "I was unable to formulate a response at this moment.",
    });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({
      success: false,
      message: "Gemini server-side assistant encountered an error.",
      error: err.message,
    });
  }
});
`;

const newContent = content.replace('// Vite Middleware & Client Serving Setup', newEndpoint + '\n// Vite Middleware & Client Serving Setup');
fs.writeFileSync('server.ts', newContent);
console.log('patched server.ts');
