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

  const prompt = `You are an expert full-stack web developer with 15+ years of experience. Generate a complete, production-ready website project that is 100% error-free and fully functional.

CRITICAL REQUIREMENTS:
1. Return ONLY a valid JSON object with this EXACT structure (no markdown, no explanations):
{
  "name": "project-name-kebab-case",
  "description": "brief description of the project",
  "files": {
    "index.html": {
      "content": "complete HTML content",
      "type": "html"
    },
    "css/style.css": {
      "content": "complete CSS content",
      "type": "css"
    },
    "js/script.js": {
      "content": "complete JavaScript content",
      "type": "js"
    }
  }
}

2. CODE QUALITY REQUIREMENTS:
- Write ONLY HTML, CSS, and JavaScript (no frameworks or libraries)
- ALL code must be syntactically correct and error-free
- Include complete DOCTYPE and proper HTML5 structure
- Use semantic HTML tags (header, nav, main, section, article, footer)
- Include proper meta tags for viewport, charset, and SEO
- CSS must be well-organized with proper selectors and no syntax errors
- JavaScript must be vanilla JS with proper error handling
- Include proper CSS reset/normalize
- Make website 100% responsive using CSS Grid and Flexbox
- Include hover effects, transitions, and animations
- Add proper accessibility (ARIA labels, alt texts, semantic markup)
- Include favicon and proper meta tags

3. FOLDER STRUCTURE:
- index.html (main entry point)
- css/style.css (all styles)
- js/script.js (all JavaScript)
- images/ folder if needed (use placeholder images or CSS for graphics)

4. FUNCTIONALITY REQUIREMENTS:
- Website must be fully interactive and functional
- Include smooth scrolling and navigation
- Add form validation if forms exist
- Include responsive navigation menu
- Add loading states and error handling
- Include proper event listeners
- Test all interactive elements work correctly

5. DESIGN REQUIREMENTS:
- Modern, professional design with good typography
- Consistent color scheme and spacing
- Mobile-first responsive design
- Beautiful animations and transitions
- Proper contrast ratios for accessibility
- Clean, organized layout with proper whitespace

6. SPECIFIC FEATURES TO INCLUDE:
- Responsive navigation menu (hamburger menu on mobile)
- Hero section with compelling content
- Feature sections with proper layout
- Contact form with validation (if applicable)
- Footer with proper links and information
- Smooth scroll behavior
- CSS animations and transitions
- Mobile-optimized touch interactions

PROJECT REQUIREMENTS:
Description: ${projectRequest.description}

IMPORTANT: Generate code that is:
- 100% error-free and syntactically correct
- Fully functional with no broken features
- Responsive across all device sizes
- Professional and modern in appearance
- Optimized for performance
- Accessible and SEO-friendly

Return ONLY the JSON object with no additional text, markdown formatting, or explanations.`;

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
