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

    console.log("🤖 Sending request to Gemini API...");
    
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent code generation
          topK: 1,
          topP: 0.8,
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
      const errorText = await geminiRes.text();
      console.error("❌ Gemini API error:", errorText);
      return res.status(500).json({ error: "Failed to generate project from Gemini API" });
    }

    const geminiData = await geminiRes.json();
    let responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("📝 Raw Gemini response length:", responseText.length);
    console.log("📝 First 200 chars:", responseText.substring(0, 200));

    // Enhanced JSON extraction with better error handling
    let jsonMatch;
    
    // Try multiple extraction patterns
    const patterns = [
      /\{[\s\S]*\}/,           // Standard JSON pattern
      /```json\s*([\s\S]*?)\s*```/,  // JSON in code blocks
      /```\s*([\s\S]*?)\s*```/,      // Any code block
    ];
    
    for (const pattern of patterns) {
      jsonMatch = responseText.match(pattern);
      if (jsonMatch) {
        responseText = jsonMatch[1] || jsonMatch[0];
        break;
      }
    }

    if (!jsonMatch) {
      console.error("❌ No JSON found in response");
      return res.status(500).json({ error: "Invalid response format from Gemini API - no JSON found" });
    }

    let projectData;
    try {
      projectData = JSON.parse(responseText);
      console.log("✅ Successfully parsed project data");
      console.log("📁 Project name:", projectData.name);
      console.log("📄 Files generated:", Object.keys(projectData.files || {}).length);
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      console.error("❌ Problematic JSON:", responseText.substring(0, 500));
      return res.status(500).json({ error: "Failed to parse JSON response from Gemini API" });
    }

    // Validate project structure
    if (!projectData.name || !projectData.files || typeof projectData.files !== 'object') {
      console.error("❌ Invalid project structure:", projectData);
      return res.status(500).json({ error: "Invalid project structure from Gemini API" });
    }

    // Create project directory
    const projectDir = path.join(__dirname, 'projects', projectData.name.replace(/[^a-zA-Z0-9-_]/g, ''));
    
    // Clean up existing project directory
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
    
    // Create new project directory
    fs.mkdirSync(projectDir, { recursive: true });
    console.log("📁 Created project directory:", projectDir);

    // Create all project files with proper folder structure
    const createdFiles = [];
    for (const [filename, fileData] of Object.entries(projectData.files)) {
      try {
        const filePath = path.join(projectDir, filename);
        const dir = path.dirname(filePath);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write file content
        fs.writeFileSync(filePath, fileData.content, 'utf-8');
        createdFiles.push(filename);
        console.log("📄 Created file:", filename);
      } catch (fileError) {
        console.error(`❌ Error creating file ${filename}:`, fileError);
      }
    }

    // Start preview server for this specific project
    const uniquePort = 5000 + Math.floor(Math.random() * 1000);
    
    const previewServer = express();
    previewServer.use(express.static(projectDir));
    
    // Add CORS headers for better compatibility
    previewServer.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      next();
    });
    
    // Handle SPA routing - serve index.html for any route that doesn't match a file
    previewServer.get('*', (req, res) => {
      const indexPath = path.join(projectDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Project not found');
      }
    });
    
    const server = previewServer.listen(uniquePort, () => {
      console.log(`🚀 Preview server running at http://localhost:${uniquePort}`);
    });

    // Store server reference for cleanup
    if (!global.previewServers) {
      global.previewServers = new Map();
    }
    global.previewServers.set(projectData.name, server);

    const response = {
      ...projectData,
      previewUrl: `http://localhost:${uniquePort}`,
      port: uniquePort,
      filesCreated: createdFiles,
      projectPath: projectDir,
      status: 'success'
    };

    console.log("✅ Project generation completed successfully");
    res.json(response);

  } catch (err) {
    console.error("❌ Error in /api/generate-project:", err);
    res.status(500).json({ error: err.message || "Unknown error occurred" });
  }
});

// Clean up old preview servers
app.post('/api/cleanup-previews', (req, res) => {
  try {
    if (global.previewServers) {
      for (const [projectName, server] of global.previewServers.entries()) {
        server.close();
        console.log(`🧹 Cleaned up preview server for: ${projectName}`);
      }
      global.previewServers.clear();
    }
    res.json({ message: 'Preview servers cleaned up successfully' });
  } catch (error) {
    console.error('❌ Error cleaning up preview servers:', error);
    res.status(500).json({ error: 'Failed to cleanup preview servers' });
  }
});

// Get project status
app.get('/api/project-status/:projectName', (req, res) => {
  const projectName = req.params.projectName;
  const projectDir = path.join(__dirname, 'projects', projectName.replace(/[^a-zA-Z0-9-_]/g, ''));
  
  if (fs.existsSync(projectDir)) {
    const files = fs.readdirSync(projectDir, { recursive: true });
    const hasPreviewServer = global.previewServers && global.previewServers.has(projectName);
    
    res.json({
      exists: true,
      files: files.length,
      hasPreviewServer,
      projectPath: projectDir
    });
  } else {
    res.json({ exists: false });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
