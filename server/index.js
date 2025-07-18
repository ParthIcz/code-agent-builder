const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

let previewServerStarted = false;
let previewPort = 5005; // You can randomize or increment if needed

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

  const prompt = `You are an expert web developer. Generate a complete, production-ready website project based on the user's requirements.

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
- Use plain HTML, CSS, and JavaScript files (.html, .css, .js)
- All code must be complete and functional
- Include a complete index.html as the main entry point
- Include all necessary CSS and JS files
- Make the website responsive and accessible
- Use modern best practices for HTML, CSS, and JavaScript
- Include proper file structure and organization

Generate a website project with the following requirements:

Description: ${projectRequest.description}

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
      return res.status(500).json({ error });
    }

    const geminiData = await geminiRes.json();
    const responseText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Raw response from Gemini API:", responseText);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Invalid response format from Gemini API" });
    }

    let projectData;
    try {
      projectData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(500).json({ error: "Failed to parse JSON response from Gemini API" });
    }

    const tempDir = path.join(__dirname, 'temp_build');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    fs.readdirSync(tempDir).forEach(f => {
      fs.rmSync(path.join(tempDir, f), { recursive: true, force: true });
    });

    for (const [filename, fileData] of Object.entries(projectData.files)) {
      const filePath = path.join(tempDir, filename);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, fileData.content, 'utf-8');
    }

    if (!previewServerStarted) {
      const expressStatic = express();
      expressStatic.use(express.static(tempDir));
      expressStatic.listen(previewPort, () => {
        console.log(`Preview server running at http://localhost:${previewPort}`);
      });
      previewServerStarted = true;
    }

    res.json({
      ...projectData,
      previewUrl: `http://localhost:${previewPort}/index.html`
    });

  } catch (err) {
    console.error("Error in /api/generate-project:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
