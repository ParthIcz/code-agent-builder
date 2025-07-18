const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = (...args) =>
  import("node-fetch").then((mod) => mod.default(...args));
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 8081;

let previewServerStarted = false;
let previewPort = 5005;
let previewServer = null;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running!" });
});

app.post("/api/generate-project", async (req, res) => {
  console.log("Received project request:", req.body);
  const projectRequest = req.body;

  const prompt = `You are an expert full-stack web developer with 15+ years of experience. Create a complete, production-ready, error-free website project based on the user's requirements.

IMPORTANT: Return ONLY a valid JSON object with this EXACT structure:
{
  "name": "project-name-kebab-case",
  "description": "brief description of the project",
  "files": {
    "index.html": {
      "content": "complete HTML content",
      "type": "html"
    },
    "style.css": {
      "content": "complete CSS content",
      "type": "css"
    },
    "script.js": {
      "content": "complete JavaScript content",
      "type": "js"
    }
  }
}

STRICT REQUIREMENTS:
1. ALWAYS include index.html as the main entry point
2. ALWAYS include style.css for styling
3. ALWAYS include script.js for functionality
4. Use semantic HTML5 elements (header, nav, main, section, article, aside, footer)
5. CSS must be modern with:
   - CSS Grid and Flexbox for layout
   - CSS Variables for consistent theming
   - Responsive design with mobile-first approach
   - Smooth transitions and hover effects
   - Professional color schemes
6. JavaScript must be modern ES6+ with:
   - Arrow functions and const/let declarations
   - Event delegation and proper DOM manipulation
   - Error handling with try/catch
   - Modular code structure
   - Interactive features and animations
7. Make it fully responsive (mobile, tablet, desktop)
8. Include proper accessibility features (ARIA labels, semantic HTML)
9. Add loading states and smooth animations
10. Include complete, working functionality - NO placeholders or TODO comments
11. Use professional styling with gradients, shadows, and modern design patterns
12. Add interactive elements like buttons, forms, modals as appropriate
13. Include proper meta tags, viewport, and SEO optimization
14. Add favicon support and proper document structure
15. Implement proper error handling and user feedback

Project Requirements:
Description: ${projectRequest.description}
Project Type: ${projectRequest.projectType || "modern web application"}
Features: ${projectRequest.features ? projectRequest.features.join(", ") : "responsive design, modern UI, interactive elements"}

Generate a COMPLETE, FUNCTIONAL project that works perfectly when opened in a browser. All code must be error-free and production-ready.

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
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
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
      return res
        .status(500)
        .json({ error: "Invalid response format from Gemini API" });
    }

    let projectData;
    try {
      projectData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res
        .status(500)
        .json({ error: "Failed to parse JSON response from Gemini API" });
    }

    // Create temp directory with timestamp to avoid conflicts
    const timestamp = Date.now();
    const tempDir = path.join(__dirname, "temp_build", `project_${timestamp}`);
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // Clean up old project directories (keep only last 5)
    const tempBuildDir = path.join(__dirname, "temp_build");
    if (fs.existsSync(tempBuildDir)) {
      const dirs = fs
        .readdirSync(tempBuildDir)
        .filter((d) => d.startsWith("project_"))
        .sort((a, b) => {
          const aTime = parseInt(a.replace("project_", ""));
          const bTime = parseInt(b.replace("project_", ""));
          return bTime - aTime;
        });

      // Keep only the 5 most recent directories
      dirs.slice(5).forEach((dir) => {
        fs.rmSync(path.join(tempBuildDir, dir), {
          recursive: true,
          force: true,
        });
      });
    }

    // Write project files
    for (const [filename, fileData] of Object.entries(projectData.files)) {
      const filePath = path.join(tempDir, filename);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, fileData.content, "utf-8");
    }

    console.log(`Created project files in: ${tempDir}`);
    console.log(`Files created: ${Object.keys(projectData.files).join(", ")}`);

    // Start or restart preview server
    if (previewServer) {
      previewServer.close(() => {
        console.log("Previous preview server closed");
      });
    }

    const expressStatic = express();
    expressStatic.use(cors());
    expressStatic.use(express.static(tempDir));

    // Handle SPA routing - serve index.html for all routes
    expressStatic.get("*", (req, res) => {
      const indexPath = path.join(tempDir, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Project not found");
      }
    });

    previewServer = expressStatic.listen(previewPort, () => {
      console.log(`Preview server running at http://localhost:${previewPort}`);
      previewServerStarted = true;
    });

    res.json({
      ...projectData,
      previewUrl: `http://localhost:${previewPort}`,
      projectPath: tempDir,
      filesCreated: Object.keys(projectData.files).length,
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
