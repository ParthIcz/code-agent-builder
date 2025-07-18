const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running!' });
});

app.post('/api/generate-project', async (req, res) => {
  console.log("Received project request:", req.body);
  const projectRequest = req.body;
  // Build prompt for Gemini
  const prompt = `You are an expert full-stack developer. Generate a complete, production-ready project based on the user's requirements.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "name": "project-name",
  "description": "brief description",
  "files": {
    "filename.ext": {
      "content": "complete file content",
      "type": "file extension"
    }
  }
}

Requirements:
- Use modern React/Next.js with TypeScript
- Include Tailwind CSS for styling
- Use shadcn/ui components where appropriate
- Include proper error handling and loading states
- Make it responsive and accessible
- Include proper imports and exports
- Generate complete, working code (no placeholders or comments like "// TODO")
- Include package.json with all required dependencies
- Use modern ES6+ syntax and React best practices

Generate a ${projectRequest.projectType || "web application"} project with the following requirements:

Description: ${projectRequest.description}
Framework: ${projectRequest.framework || "React/Next.js"}
Styling: ${projectRequest.styling || "Tailwind CSS"}
Features: ${projectRequest.features?.join(", ") || "Standard features"}

Generate a complete project with all necessary files including:
- Component files (.tsx)
- Styling files (.css)
- Configuration files (package.json, etc.)
- Type definitions if needed
- Proper file structure and organization

Make sure all code is complete, functional, and follows modern best practices.

Return ONLY the JSON object, no additional text or formatting.`;

  try {
    const GEMINI_API_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing Gemini API key" });
    }

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const error = await geminiRes.text();
      return res.status(500).json({ error: error });
    }

    const geminiData = await geminiRes.json();
    const responseText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from Gemini response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Invalid response format from Gemini API" });
    }

    const projectData = JSON.parse(jsonMatch[0]);
    res.json(projectData);
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
