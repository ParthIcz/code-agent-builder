const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"], // Vite dev server and React dev server
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8081;
const USER_PROJECTS_DIR = path.join(__dirname, "user-projects");

let previewServerStarted = false;
let previewPort = 5005; // You can randomize or increment if needed

// Middleware
app.use(cors());
app.use(express.json());

// Serve user projects statically with no cache
app.use("/user-projects", express.static(USER_PROJECTS_DIR, {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set("Cache-Control", "no-store");
  }
}));

// Create user projects directory if it doesn't exist
if (!fs.existsSync(USER_PROJECTS_DIR)) {
  fs.mkdirSync(USER_PROJECTS_DIR, { recursive: true });
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Utility functions for file operations
function broadcastFileUpdate(projectId) {
  io.emit("file-updated", { projectId });
}

function writeFileAndBroadcast(projectId, filePath, content) {
  const projectDir = path.join(USER_PROJECTS_DIR, projectId);
  const fullPath = path.join(projectDir, filePath);
  
  // Ensure directory exists
  const fileDir = path.dirname(fullPath);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content, "utf-8");
  broadcastFileUpdate(projectId);
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running!' });
});

// API route for saving files
app.post('/api/save-file', (req, res) => {
  try {
    const { projectId, filePath, content } = req.body;
    
    if (!projectId || !filePath || content === undefined) {
      return res.status(400).json({ error: 'Missing required fields: projectId, filePath, content' });
    }
    
    writeFileAndBroadcast(projectId, filePath, content);
    res.status(200).json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save file', details: error.message });
  }
});

// API route for creating a new project
app.post('/api/create-project', (req, res) => {
  try {
    const { projectId, files } = req.body;
    
    if (!projectId || !files) {
      return res.status(400).json({ error: 'Missing required fields: projectId, files' });
    }
    
    const projectDir = path.join(USER_PROJECTS_DIR, projectId);
    
    // Create project directory
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    
    // Write all files
    Object.entries(files).forEach(([filePath, fileData]) => {
      const content = typeof fileData === 'string' ? fileData : fileData.content;
      writeFileAndBroadcast(projectId, filePath, content);
    });
    
    const previewUrl = `http://localhost:${PORT}/user-projects/${projectId}/index.html`;
    res.status(200).json({ 
      success: true, 
      message: 'Project created successfully',
      previewUrl 
    });
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Failed to create project', details: error.message });
  }
});

app.post('/api/generate-project', async (req, res) => {
  console.log("Received project request:", req.body);
  const projectRequest = req.body;

  // Enhance simple prompts to trigger premium generation
  let enhancedDescription = projectRequest.description;
  
  // Auto-enhance common business types with premium keywords
  if (enhancedDescription.toLowerCase().includes('construction')) {
    enhancedDescription = `Create a premium luxury construction company website with sophisticated design, professional portfolio showcase, advanced animations, rich content sections including services (residential, commercial, renovation), team profiles, project galleries with before/after comparisons, client testimonials, modern UI/UX, and expensive premium aesthetics with gold accents and dark theme`;
  } else if (enhancedDescription.toLowerCase().includes('portfolio')) {
    enhancedDescription = `Build a premium professional portfolio website with luxury design, sophisticated animations, project showcases, skills presentation, contact forms, and modern premium aesthetics`;
  } else if (enhancedDescription.toLowerCase().includes('restaurant') || enhancedDescription.toLowerCase().includes('food')) {
    enhancedDescription = `Create a luxury restaurant website with premium design, menu showcases, reservation system, chef profiles, elegant galleries, and sophisticated user experience`;
  } else if (enhancedDescription.toLowerCase().includes('hotel') || enhancedDescription.toLowerCase().includes('hospitality')) {
    enhancedDescription = `Build a luxury hotel website with premium design, room galleries, booking system, amenities showcase, and sophisticated hospitality experience`;
  } else if (enhancedDescription.toLowerCase().includes('agency') || enhancedDescription.toLowerCase().includes('marketing')) {
    enhancedDescription = `Create a premium digital agency website with sophisticated design, service portfolios, case studies, team profiles, and modern professional aesthetics`;
  } else if (enhancedDescription.toLowerCase().includes('law') || enhancedDescription.toLowerCase().includes('legal')) {
    enhancedDescription = `Build a premium law firm website with professional design, practice areas, attorney profiles, case results, and corporate elegance`;
  } else if (enhancedDescription.toLowerCase().includes('medical') || enhancedDescription.toLowerCase().includes('doctor') || enhancedDescription.toLowerCase().includes('clinic')) {
    enhancedDescription = `Create a premium medical practice website with professional design, services overview, doctor profiles, appointment booking, and trustworthy healthcare aesthetics`;
  } else if (enhancedDescription.toLowerCase().includes('real estate')) {
    enhancedDescription = `Build a luxury real estate website with premium design, property galleries, agent profiles, market insights, search functionality, and sophisticated property showcase`;
  } else if (enhancedDescription.toLowerCase().includes('consulting')) {
    enhancedDescription = `Create a premium consulting firm website with professional design, service offerings, case studies, team expertise, and corporate sophistication`;
  } else if (enhancedDescription.toLowerCase().includes('finance') || enhancedDescription.toLowerCase().includes('bank')) {
    enhancedDescription = `Build a premium financial services website with professional design, service portfolios, security features, team profiles, and trustworthy corporate aesthetics`;
  }
  
  // If no specific enhancement was applied, add general premium enhancement
  if (enhancedDescription === projectRequest.description) {
    enhancedDescription = `Create a premium modern ${projectRequest.description} with luxury design, sophisticated animations, rich content sections, professional aesthetics, advanced CSS styling, and expensive premium user experience`;
  }

  console.log("Enhanced description:", enhancedDescription);

  const prompt = `You are an expert full-stack web developer and UI/UX designer with 15+ years of experience creating premium, luxury websites for Fortune 500 companies. Generate a complete, production-ready website that looks like it costs $50,000+ to develop. Focus on creating a stunning, modern design with premium aesthetics, sophisticated animations, and rich interactive content.

CRITICAL REQUIREMENTS:
IMPORTANT - FOLLOW THESE EXACTLY:
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

2. PREMIUM DESIGN REQUIREMENTS:

Visual Aesthetics (LUXURY LOOK):
- Implement a sophisticated, premium color palette:
  * Primary: Deep navy (#1a1b3a) or charcoal (#2c2c2c)
  * Accent: Gold (#d4af37) or copper (#b87333)
  * Secondary: Light gray (#f8f9fa) and white
  * Supporting colors: Blue tones, emerald green for success states
- Typography system with premium fonts:
  * Headers: "Playfair Display", "Montserrat", or "Inter" from Google Fonts
  * Body: "Inter", "Source Sans Pro", or premium system fonts
  * Use font weights: 300, 400, 500, 600, 700, 800
  * Implement perfect typography hierarchy with proper spacing
- Advanced spacing system:
  * Use consistent 8px grid system
  * Large whitespace areas for premium feel
  * Proper content breathing room
  * Generous padding on all sections (80px+ on desktop)

Advanced CSS Techniques:
- CSS Grid and Flexbox for complex layouts
- CSS Custom Properties for theming and consistency
- Advanced pseudo-elements for decorative effects
- CSS transforms and 3D effects
- Complex gradient backgrounds and overlays
- Box shadows with multiple layers for depth
- Border-radius for modern card designs
- CSS filters and backdrop-blur effects
- Advanced hover and focus states
- Smooth transitions (0.3-0.6s duration with easing)

Premium Animations & Interactions:
- Smooth page load animations with staggered reveals
- Parallax scrolling effects for hero sections
- Advanced hover animations (scale, rotate, translate)
- Scroll-triggered animations using Intersection Observer
- Loading animations and state transitions
- Micro-interactions for buttons and form elements
- Advanced menu transitions and overlays
- Image hover effects with overlays and transforms
- Counter animations and progress indicators
- Smooth scroll behavior throughout

3. REQUIRED PREMIUM COMPONENTS:

Hero Section (MUST BE STUNNING):
- Full-screen height with powerful imagery or video background
- Compelling headline with large, bold typography
- Professional subtitle with proper spacing
- Multiple CTA buttons with premium styling
- Animated elements or floating graphics
- Scroll indicator or animated arrow
- Optional: Background video or image carousel

Navigation (PROFESSIONAL):
- Fixed/sticky header with background blur on scroll
- Professional logo placement
- Clean navigation menu with hover effects
- Mobile hamburger menu with smooth animations
- Search functionality with smooth transitions
- Contact information in header
- Social media links with hover animations

Services/Features Section:
- Grid layout with premium service cards
- Icon integration (use CSS icons or Unicode symbols)
- Hover effects with image overlays
- Professional service descriptions
- Pricing information if applicable
- "Learn More" buttons with smooth interactions

About Section:
- Company story with engaging narrative
- Team member cards with professional photos (use placeholder.com)
- Company values and mission statement
- Statistics and achievements with animated counters
- Timeline or company history
- Certifications and awards display

Portfolio/Projects Gallery:
- Masonry or grid layout for project showcase
- Image galleries with lightbox effects
- Project categories with filtering
- Before/after comparisons for relevant industries
- Project details with professional descriptions
- Client testimonials integrated

Contact Section:
- Professional contact form with validation
- Multiple contact methods (phone, email, address)
- Google Maps integration (placeholder)
- Office hours and location details
- Social media integration
- Newsletter signup with incentives

Footer (COMPREHENSIVE):
- Multi-column responsive layout
- Company information and logo
- Quick links and site navigation
- Contact details and social media
- Newsletter signup form
- Legal links (Privacy, Terms, etc.)
- Copyright and professional credits

4. CONTENT REQUIREMENTS (RICH & ENGAGING):

Write compelling, professional copy that includes:
- Engaging headlines that grab attention
- Benefit-focused descriptions, not just features
- Professional industry terminology
- Call-to-action phrases that convert
- Trust indicators and social proof
- Detailed service descriptions
- Company backstory and values
- Client success stories and testimonials

For Construction Company specifically:
- Services: Residential, Commercial, Renovation, Design-Build
- Specialties: Custom homes, Office buildings, Industrial projects
- Process: Consultation, Design, Permits, Construction, Completion
- Team: Architects, Engineers, Project Managers, Craftsmen
- Values: Quality, Safety, Timeliness, Innovation
- Certifications: Licensed, Insured, Bonded, Safety certified

5. TECHNICAL REQUIREMENTS:

HTML Structure:
- Semantic HTML5 with proper structure
- Comprehensive meta tags for SEO
- Open Graph and Twitter meta tags
- Schema.org markup for business information
- Proper heading hierarchy (h1-h6)
- Accessibility attributes (ARIA labels, alt text)
- High-performance image loading (loading="lazy")

CSS Features:
- Mobile-first responsive design
- CSS Grid and Flexbox layouts
- Custom CSS animations and keyframes
- CSS variables for consistent theming
- Advanced selectors and pseudo-elements
- CSS filters and transforms
- Smooth scrolling and transitions
- Print stylesheet considerations

JavaScript Functionality:
- Smooth scrolling navigation
- Mobile menu toggle with animations
- Form validation with real-time feedback
- Scroll-triggered animations
- Image lazy loading and optimization
- Interactive elements (tabs, accordions, modals)
- Performance optimizations
- Error handling and loading states
- Local storage for user preferences

6. PERFORMANCE & OPTIMIZATION:

- Optimize images and assets
- Minimize HTTP requests
- Use efficient CSS and JavaScript
- Implement lazy loading
- Add loading indicators
- Optimize for Core Web Vitals
- Ensure fast page load times
- Mobile performance optimization

PROJECT REQUIREMENTS:
Business Type: ${enhancedDescription}
Industry Context: Professional service business requiring premium web presence

IMPORTANT: Generate a website that:
- Looks like it was designed by a top-tier agency
- Uses sophisticated color schemes and typography
- Has smooth, professional animations
- Contains rich, engaging content
- Is fully responsive and accessible
- Demonstrates premium quality in every detail
- Would impress Fortune 500 clients
- Has multiple sections with substantial content
- Uses advanced CSS techniques for modern aesthetics

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

    // Validate project structure and ensure CSS exists
    if (!projectData.name || !projectData.files || typeof projectData.files !== 'object') {
      console.error("❌ Invalid project structure:", projectData);
      return res.status(500).json({ error: "Invalid project structure from Gemini API" });
    }

    // Check if CSS file exists and has content
    const hasCSSFile = Object.keys(projectData.files).some(filename => filename.endsWith('.css'));
    if (!hasCSSFile) {
      console.log("⚠️ No CSS file found, adding fallback CSS");
      projectData.files['css/style.css'] = {
        content: `
/* Fallback Premium CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #1a1b3a 0%, #2c2c2c 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  background: rgba(26, 27, 58, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #d4af37;
  text-decoration: none;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 5px;
}

.nav-links a:hover {
  color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

main {
  margin-top: 80px;
}

.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(135deg, rgba(26, 27, 58, 0.9), rgba(44, 44, 44, 0.9));
  color: #fff;
  padding: 4rem 0;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #d4af37, #f4d03f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.btn {
  display: inline-block;
  background: linear-gradient(45deg, #d4af37, #b87333);
  color: #fff;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(212, 175, 55, 0.4);
}

.section {
  padding: 5rem 0;
}

.section h2 {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: #d4af37;
  font-weight: 700;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.service-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
  text-align: center;
}

.service-card:hover {
  transform: translateY(-10px);
  border-color: #d4af37;
  box-shadow: 0 20px 40px rgba(212, 175, 55, 0.2);
}

.service-card h3 {
  color: #d4af37;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.service-card p {
  color: #fff;
  opacity: 0.9;
}

footer {
  background: #1a1b3a;
  color: #fff;
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .nav-links {
    display: none;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
}
        `,
        type: 'css'
      };
    }

    // Ensure HTML file has proper CSS link
    const htmlFile = Object.keys(projectData.files).find(f => f.endsWith('.html'));
    if (htmlFile && projectData.files[htmlFile]) {
      let htmlContent = projectData.files[htmlFile].content;
      if (!htmlContent.includes('<link') && !htmlContent.includes('style.css')) {
        // Add CSS link to head
        htmlContent = htmlContent.replace(
          '</head>',
          '  <link rel="stylesheet" href="css/style.css">\n</head>'
        );
        projectData.files[htmlFile].content = htmlContent;
      }
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

    // Prepare for file creation
    const createdFiles = [];
    let htmlContent = '';
    let cssContent = '';
    let jsContent = '';

    // First, collect all CSS and JS content
    Object.entries(projectData.files).forEach(([filename, fileData]) => {
      if (filename.endsWith('.html')) {
        htmlContent = fileData.content;
      } else if (filename.endsWith('.css')) {
        cssContent += fileData.content + '\n';
      } else if (filename.endsWith('.js')) {
        jsContent += fileData.content + '\n';
      }
    });

    // Create all files with proper content
    for (const [filename, fileData] of Object.entries(projectData.files)) {
      try {
        const filePath = path.join(projectDir, filename);
        const dir = path.dirname(filePath);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write file content with proper path handling
        let content = fileData.content;
        
        if (filename === 'index.html') {
          // Fix CSS and JS file references to use relative paths
          content = content.replace(
            /<link[^>]*href=["'](?!http|\/\/|https:)([^"']+\.css)["'][^>]*>/g,
            (match, cssPath) => {
              // Convert to relative path
              const relativePath = cssPath.startsWith('/') ? cssPath.substring(1) : cssPath;
              return match.replace(cssPath, relativePath);
            }
          );
          
          content = content.replace(
            /<script[^>]*src=["'](?!http|\/\/|https:)([^"']+\.js)["'][^>]*>/g,
            (match, jsPath) => {
              // Convert to relative path  
              const relativePath = jsPath.startsWith('/') ? jsPath.substring(1) : jsPath;
              return match.replace(jsPath, relativePath);
            }
          );
        }
        
        fs.writeFileSync(filePath, content, 'utf-8');
        createdFiles.push(filename);
        console.log("📄 Created file:", filename, "- Size:", content.length, "bytes");
      } catch (fileError) {
        console.error(`❌ Error creating file ${filename}:`, fileError);
      }
    }

    // Start preview server for this specific project
    const uniquePort = 5000 + Math.floor(Math.random() * 1000);
    
    const previewServer = express();
    
    // Enable static file serving with proper MIME types
    previewServer.use(express.static(projectDir, {
      setHeaders: (res, filePath) => {
        // Set proper content types for different file types
        if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        if (filePath.endsWith('.html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
        // Disable caching for development
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }));
    
    // Add CORS headers for better compatibility
    previewServer.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      next();
    });

    // Log requests to help with debugging
    previewServer.use((req, res, next) => {
      console.log(`📄 Preview server request: ${req.method} ${req.url}`);
      next();
    });

    // Serve specific file types explicitly
    previewServer.get('*.css', (req, res) => {
      const cssPath = path.join(projectDir, req.path);
      console.log(`🎨 CSS request: ${req.path} -> ${cssPath}`);
      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf-8');
        console.log(`📄 CSS file size: ${cssContent.length} bytes`);
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(cssContent);
      } else {
        console.log(`❌ CSS file not found: ${cssPath}`);
        res.status(404).send('/* CSS file not found */');
      }
    });

    previewServer.get('*.js', (req, res) => {
      const jsPath = path.join(projectDir, req.path);
      console.log(`⚡ JS request: ${req.path} -> ${jsPath}`);
      if (fs.existsSync(jsPath)) {
        const jsContent = fs.readFileSync(jsPath, 'utf-8');
        console.log(`📄 JS file size: ${jsContent.length} bytes`);
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(jsContent);
      } else {
        console.log(`❌ JS file not found: ${jsPath}`);
        res.status(404).send('// JavaScript file not found');
      }
    });
    
    // Handle all other routes - serve index.html for any route that doesn't match a file
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
    
    // Get file details
    const fileDetails = {};
    files.forEach(file => {
      const filePath = path.join(projectDir, file);
      if (fs.statSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath, 'utf-8');
        fileDetails[file] = {
          size: content.length,
          preview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
        };
      }
    });
    
    res.json({
      exists: true,
      files: files.length,
      hasPreviewServer,
      projectPath: projectDir,
      fileDetails
    });
  } else {
    res.json({ exists: false });
  }
});

// Debug endpoint to check project files
app.get('/api/debug-project/:projectName', (req, res) => {
  const projectName = req.params.projectName;
  const projectDir = path.join(__dirname, 'projects', projectName.replace(/[^a-zA-Z0-9-_]/g, ''));
  
  if (fs.existsSync(projectDir)) {
    const files = {};
    const walkDir = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relPath = path.join(relativePath, item);
        if (fs.statSync(fullPath).isFile()) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          files[relPath] = {
            size: content.length,
            content: content
          };
        } else if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath, relPath);
        }
      });
    };
    walkDir(projectDir);
    
    res.json({
      projectName,
      projectDir,
      files
    });
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`User projects will be served from: http://localhost:${PORT}/user-projects/`);
});
