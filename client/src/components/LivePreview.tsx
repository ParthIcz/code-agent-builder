import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";
import type { ProjectFile } from "@/types";

interface LivePreviewProps {
  files: Record<string, ProjectFile>;
  previewUrl?: string;
}

export function LivePreview({ files, previewUrl }: LivePreviewProps) {
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewportSize, setViewportSize] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate preview content with debouncing for smooth updates
  useEffect(() => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Show loading state
    setIsLoading(true);
    setHasError(false);

    // Debounce updates to avoid too frequent re-renders
    updateTimeoutRef.current = setTimeout(() => {
      try {
        console.log("Updating preview with files:", Object.keys(files));
        const htmlContent = generatePreviewHTML(files);
        setPreviewContent(htmlContent);
        setHasError(false);
        setErrorMessage("");
      } catch (error) {
        console.error("Preview generation error:", error);
        setHasError(true);
        setErrorMessage(
          error instanceof Error ? error.message : "Preview generation failed",
        );
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [files]);

  const generatePreviewHTML = (files: Record<string, ProjectFile>): string => {
    // If no files are generated yet, show empty state
    if (!files || Object.keys(files).length === 0) {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview - No Content</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen flex items-center justify-center">
  <div class="text-center max-w-md mx-auto p-8">
    <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
    </div>
    <h1 class="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Ready for Live Preview</h1>
    <p class="text-gray-400 mb-6 leading-relaxed">Generate your first project with AI and watch it come to life here in real-time!</p>
    <div class="text-sm text-gray-500 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <div class="font-medium mb-2">Try these prompts:</div>
      <div class="space-y-1">
        <div>• "Create a portfolio website"</div>
        <div>• "Build a todo app"</div>
        <div>• "Make a landing page"</div>
      </div>
    </div>
  </div>
</body>
</html>`;
    }

    // Try to find and render the actual generated content with enhanced logic
    return renderGeneratedContent(files);
  };

  const renderGeneratedContent = (
    files: Record<string, ProjectFile>,
  ): string => {
    // Find the main HTML file (could be various paths)
    const possibleHtmlFiles = [
      "index.html",
      "public/index.html",
      "src/index.html",
      "app/page.tsx",
      "src/App.tsx",
      "src/main.tsx",
      "App.tsx",
      "page.tsx",
    ];

    let mainHtmlFile = null;
    let mainContent = "";

    // Look for main HTML file
    for (const path of possibleHtmlFiles) {
      if (files[path]) {
        mainHtmlFile = files[path];
        mainContent = mainHtmlFile.content;
        break;
      }
    }

    // If we found a React component instead of HTML, we need to create HTML wrapper
    if (
      mainHtmlFile &&
      (mainHtmlFile.type === "tsx" || mainHtmlFile.type === "jsx")
    ) {
      return generateReactPreview(files, mainContent);
    }

    // If we found an HTML file, process it
    if (mainHtmlFile && mainHtmlFile.type === "html") {
      return processHtmlFile(files, mainContent);
    }

    // If no main file found, try to build from available files
    return buildFromAvailableFiles(files);
  };

  const generateReactPreview = (
    files: Record<string, ProjectFile>,
    mainContent: string,
  ): string => {
    // Find CSS files
    const cssFiles = Object.entries(files).filter(
      ([path, file]) => path.endsWith(".css") || file.type === "css",
    );

    // Find JS files for additional scripts
    const jsFiles = Object.entries(files).filter(
      ([path, file]) => path.endsWith(".js") || file.type === "js",
    );

    let styles = "";
    cssFiles.forEach(([path, file]) => {
      styles += file.content + "\n";
    });

    let scripts = "";
    jsFiles.forEach(([path, file]) => {
      scripts += file.content + "\n";
    });

    // Extract JSX content from React component with better parsing
    const jsxMatch = mainContent.match(/return\s*\(([\s\S]*?)\);?\s*\}/);
    let bodyContent = "";

    if (jsxMatch) {
      bodyContent = jsxMatch[1]
        .replace(/className=/g, "class=")
        .replace(/htmlFor=/g, "for=")
        .replace(/{`([^`]*)`}/g, "$1") // Template literals
        .replace(/{\s*"([^"]*)"\s*}/g, "$1") // String expressions
        .replace(/{\s*'([^']*)'\s*}/g, "$1") // String expressions with single quotes
        .replace(/{\s*(\d+)\s*}/g, "$1") // Number expressions
        .replace(/{[^}]*}/g, ""); // Remove remaining JS expressions
    }

    // If no JSX found, try to find other renderable content
    if (!bodyContent) {
      // Look for JSX-like content in the file
      const componentMatch = mainContent.match(/<[^>]+>[\s\S]*<\/[^>]+>/);
      if (componentMatch) {
        bodyContent = componentMatch[0]
          .replace(/className=/g, "class=")
          .replace(/htmlFor=/g, "for=");
      } else {
        // Fallback to a smart preview
        bodyContent = generateFallbackContent(files);
      }
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${styles}
    
    /* Enhanced responsive utilities and modern design */
    body { 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      line-height: 1.6;
    }
    
    @media (max-width: 768px) {
      .text-6xl { font-size: 3rem !important; }
      .text-8xl { font-size: 4rem !important; }
      .py-20 { padding-top: 3rem !important; padding-bottom: 3rem !important; }
      .px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
    }
    
    /* Smooth interactions */
    button, a, input, textarea {
      transition: all 0.2s ease-in-out;
    }
    
    button:hover, a:hover {
      transform: translateY(-1px);
    }
    
    /* Enhanced form styling */
    input, textarea, select {
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    input:focus, textarea:focus, select:focus {
      outline: none;
      ring: 2px;
      ring-color: #3b82f6;
      border-color: #3b82f6;
    }
  </style>
</head>
<body>
  ${bodyContent || generateFallbackContent(files)}
  
  <script>
    ${scripts}
    
    // Enhanced interactivity for React components preview
    document.addEventListener('DOMContentLoaded', function() {
      // Handle navigation links with smooth scrolling
      const navLinks = document.querySelectorAll('a[href^="#"]');
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
      
      // Enhanced form handling
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const formData = new FormData(this);
          const data = Object.fromEntries(formData.entries());
          
          // Show success feedback
          const feedback = document.createElement('div');
          feedback.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
          feedback.innerHTML = '✓ Form submitted successfully! (Preview mode)';
          document.body.appendChild(feedback);
          
          // Animate in
          setTimeout(() => feedback.style.transform = 'translateX(0)', 10);
          
          // Remove after delay
          setTimeout(() => {
            feedback.style.transform = 'translateX(100%)';
            setTimeout(() => feedback.remove(), 300);
          }, 3000);
          
          console.log('Form data:', data);
        });
      });
      
      // Enhanced button interactions
      const buttons = document.querySelectorAll('button:not([type="submit"])');
      buttons.forEach(button => {
        if (!button.onclick && !button.getAttribute('data-interactive')) {
          button.addEventListener('click', function() {
            // Add ripple effect
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.height, rect.width);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (rect.width / 2 - size / 2) + 'px';
            ripple.style.top = (rect.height / 2 - size / 2) + 'px';
            ripple.className = 'absolute rounded-full bg-white opacity-30 animate-ping pointer-events-none';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
            
            console.log('Button clicked:', this.textContent || this.innerHTML);
          });
        }
      });
      
      // Add hover effects to interactive elements
      const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');
      interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
          if (this.tagName === 'BUTTON' || this.tagName === 'A') {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }
        });
        
        element.addEventListener('mouseleave', function() {
          if (this.tagName === 'BUTTON' || this.tagName === 'A') {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
          }
        });
      });
      
      // Handle todo app interactions if present
      const todoInputs = document.querySelectorAll('input[type="checkbox"]');
      todoInputs.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          const parentItem = this.closest('div, li');
          if (parentItem) {
            const text = parentItem.querySelector('span');
            if (text) {
              if (this.checked) {
                text.style.textDecoration = 'line-through';
                text.style.opacity = '0.6';
                parentItem.style.transform = 'scale(0.98)';
              } else {
                text.style.textDecoration = 'none';
                text.style.opacity = '1';
                parentItem.style.transform = 'scale(1)';
              }
            }
          }
        });
      });
    });
  </script>
</body>
</html>`;
  };

  const processHtmlFile = (
    files: Record<string, ProjectFile>,
    htmlContent: string,
  ): string => {
    // Find and inject CSS files
    const cssFiles = Object.entries(files).filter(
      ([path, file]) => path.endsWith(".css") || file.type === "css",
    );

    let styles = "";
    cssFiles.forEach(([path, file]) => {
      styles += file.content + "\n";
    });

    // Inject Tailwind and custom styles
    const styledHtml = htmlContent.replace(
      "</head>",
      `  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${styles}
  </style>
</head>`,
    );

    return styledHtml;
  };

  const buildFromAvailableFiles = (
    files: Record<string, ProjectFile>,
  ): string => {
    // Try to intelligently construct a preview from available files
    const htmlFiles = Object.entries(files).filter(([path, file]) => 
      file.type === 'html' || path.endsWith('.html')
    );
    const cssFiles = Object.entries(files).filter(([path, file]) => 
      file.type === 'css' || path.endsWith('.css')
    );
    const jsFiles = Object.entries(files).filter(([path, file]) => 
      file.type === 'js' || path.endsWith('.js')
    );
    const reactFiles = Object.entries(files).filter(([path, file]) => 
      file.type === 'tsx' || file.type === 'jsx' || path.endsWith('.tsx') || path.endsWith('.jsx')
    );

    // Collect all CSS content
    let styles = '';
    cssFiles.forEach(([, file]) => {
      styles += file.content + '\n';
    });

    // Collect all JavaScript content
    let scripts = '';
    jsFiles.forEach(([, file]) => {
      scripts += file.content + '\n';
    });

    let bodyContent = '';

    // If we have React files, try to extract JSX content
    if (reactFiles.length > 0) {
      bodyContent = extractReactContent(reactFiles);
    }
    // If we have HTML files, use the first one
    else if (htmlFiles.length > 0) {
      const [, htmlFile] = htmlFiles[0];
      return processHtmlFile(files, htmlFile.content);
    }
    // Otherwise, create a meaningful preview from the file contents
    else {
      bodyContent = generateSmartPreview(files);
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${styles}
    
    /* Additional preview enhancements */
    body { font-family: system-ui, -apple-system, sans-serif; }
    .preview-container { min-height: 100vh; }
  </style>
</head>
<body>
  <div class="preview-container">
    ${bodyContent}
  </div>
  
  <script>
    ${scripts}
    
    // Enhanced interactivity for live preview
    document.addEventListener('DOMContentLoaded', function() {
      // Handle navigation links
      const navLinks = document.querySelectorAll('a[href^="#"]');
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
      
      // Handle form submissions
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          const formData = new FormData(this);
          const data = Object.fromEntries(formData.entries());
          console.log('Form submitted with data:', data);
          
          // Show feedback
          const feedback = document.createElement('div');
          feedback.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
          feedback.textContent = 'Form submitted successfully! (Preview mode)';
          document.body.appendChild(feedback);
          setTimeout(() => feedback.remove(), 3000);
        });
      });
      
      // Handle interactive elements
      const buttons = document.querySelectorAll('button:not([type="submit"])');
      buttons.forEach(button => {
        if (!button.onclick && !button.getAttribute('data-interactive')) {
          button.addEventListener('click', function() {
            console.log('Button clicked:', this.textContent || this.innerHTML);
            // Add ripple effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => this.style.transform = '', 150);
          });
        }
      });
    });
  </script>
</body>
</html>`;
  };

  const extractReactContent = (reactFiles: [string, ProjectFile][]): string => {
    // Take the first React file and try to extract renderable content
    const [, firstReactFile] = reactFiles[0];
    const content = firstReactFile.content;
    
    // Look for JSX return statement
    const jsxMatch = content.match(/return\s*\(([\s\S]*?)\);?\s*\}/);
    if (jsxMatch) {
      return jsxMatch[1]
        .replace(/className=/g, 'class=')
        .replace(/htmlFor=/g, 'for=')
        .replace(/{`([^`]*)`}/g, '$1')
        .replace(/{([^}]*)}/g, (match, p1) => {
          // Handle simple string values and remove complex expressions
          if (p1.match(/^["'].*["']$/)) return p1.slice(1, -1);
          if (p1.match(/^\d+$/)) return p1;
          return '';
        });
    }
    
    // Fallback: look for JSX-like content in the file
    const jsxLikeContent = content.match(/<[^>]+>[\s\S]*<\/[^>]+>/);
    if (jsxLikeContent) {
      return jsxLikeContent[0]
        .replace(/className=/g, 'class=')
        .replace(/htmlFor=/g, 'for=');
    }
    
    return generateSmartPreview({ [reactFiles[0][0]]: reactFiles[0][1] });
  };

  const generateSmartPreview = (files: Record<string, ProjectFile>): string => {
    const fileEntries = Object.entries(files);
    
    // Try to detect what kind of app this might be based on content
    const allContent = fileEntries.map(([, file]) => file.content).join(' ').toLowerCase();
    
    if (allContent.includes('todo') || allContent.includes('task')) {
      return `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
          <div class="max-w-2xl mx-auto">
            <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">Todo App</h1>
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="mb-4">
                <input type="text" placeholder="Add a new todo..." class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div class="space-y-2">
                <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input type="checkbox" class="mr-3">
                  <span>Sample todo item</span>
                </div>
                <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input type="checkbox" checked class="mr-3">
                  <span class="line-through text-gray-500">Completed todo</span>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }
    
    if (allContent.includes('portfolio') || allContent.includes('about') || allContent.includes('contact')) {
      return `
        <div class="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900">
          <nav class="p-6">
            <div class="flex justify-between items-center max-w-6xl mx-auto">
              <h1 class="text-2xl font-bold text-white">Portfolio</h1>
              <div class="space-x-6 text-white">
                <a href="#about" class="hover:text-purple-300">About</a>
                <a href="#projects" class="hover:text-purple-300">Projects</a>
                <a href="#contact" class="hover:text-purple-300">Contact</a>
              </div>
            </div>
          </nav>
          <div class="flex items-center justify-center min-h-[80vh] px-6">
            <div class="text-center max-w-4xl">
              <h2 class="text-6xl font-bold mb-6 text-white">Your Portfolio</h2>
              <p class="text-xl text-purple-200 mb-8">Welcome to your AI-generated portfolio website</p>
              <button class="bg-white text-purple-900 px-8 py-3 rounded-full font-semibold hover:bg-purple-100 transition-colors">
                View My Work
              </button>
            </div>
          </div>
        </div>`;
    }
    
    // Generic preview for other types of content
    return `
      <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Live Preview
            </h1>
            <p class="text-xl text-gray-300">Your generated application is ready</p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-8">
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-2xl font-bold mb-4 text-blue-400">Generated Files</h3>
              <div class="space-y-3">
                ${Object.keys(files).slice(0, 5).map(filename => `
                  <div class="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span class="font-mono text-sm">${filename}</span>
                  </div>
                `).join('')}
                ${Object.keys(files).length > 5 ? `
                  <div class="text-center text-gray-400 text-sm pt-2">
                    ... and ${Object.keys(files).length - 5} more files
                  </div>
                ` : ''}
              </div>
            </div>
            
            <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 class="text-2xl font-bold mb-4 text-green-400">Interactive Preview</h3>
              <p class="text-gray-300 mb-4">
                This is a live preview of your generated application. 
                Edit your files in the code editor to see changes in real-time!
              </p>
              <div class="mt-6">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors w-full">
                  Explore Your App
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  };

  const generateFallbackContent = (
    files: Record<string, ProjectFile>,
  ): string => {
    return `
  <div class="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center p-4">
    <div class="text-center max-w-2xl">
      <h1 class="text-5xl font-bold mb-6 text-white">Your Generated App</h1>
      <p class="text-xl text-purple-200 mb-8">
        Successfully generated ${Object.keys(files).length} files with AI
      </p>
      <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <p class="text-white/80">
          This is a preview of your AI-generated application. 
          Edit the files in the code editor to see changes in real-time!
        </p>
      </div>
    </div>
  </div>`;
  };

  const handleRefresh = () => {
    // Show loading state
    setIsLoading(true);
    setHasError(false);
    setPreviewContent("");

    // Force re-render with delay
    setTimeout(() => {
      try {
        console.log("Manual refresh triggered");
        const htmlContent = generatePreviewHTML(files);
        setPreviewContent(htmlContent);
        setHasError(false);
        setErrorMessage("");
      } catch (error) {
        console.error("Manual refresh error:", error);
        setHasError(true);
        setErrorMessage(
          error instanceof Error ? error.message : "Preview generation failed",
        );
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([previewContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const getViewportStyles = () => {
    switch (viewportSize) {
      case "mobile":
        return { width: "375px", height: "100%", maxWidth: "100%" };
      case "tablet":
        return { width: "768px", height: "100%", maxWidth: "100%" };
      default:
        return { width: "100%", height: "100%" };
    }
  };

  const getViewportIcon = () => {
    switch (viewportSize) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-card/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h2 className="font-semibold text-base sm:text-lg truncate">
              Live Preview
            </h2>
            {isLoading && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs animate-pulse"
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
                Updating
              </Badge>
            )}
            {hasError && !isLoading && (
              <Badge
                variant="destructive"
                className="flex items-center gap-1 text-xs"
              >
                <AlertCircle className="h-3 w-3" />
                Error
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Viewport selector - hidden on mobile */}
            <Select
              value={viewportSize}
              onValueChange={(value: "mobile" | "tablet" | "desktop") =>
                setViewportSize(value)
              }
            >
              <SelectTrigger className="w-[100px] sm:w-[120px] h-8 text-xs hidden sm:flex">
                <SelectValue>
                  <div className="flex items-center gap-1">
                    {getViewportIcon()}
                    <span className="hidden md:inline capitalize">
                      {viewportSize}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </div>
                </SelectItem>
                <SelectItem value="tablet">
                  <div className="flex items-center gap-2">
                    <Tablet className="h-4 w-4" />
                    Tablet
                  </div>
                </SelectItem>
                <SelectItem value="desktop">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="h-8 w-8 p-0"
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="h-8 w-8 p-0 hidden sm:flex"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative min-h-0 overflow-auto">
        {hasError ? (
          <div className="h-full flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6 sm:p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <CardTitle className="text-lg mb-2">Preview Error</CardTitle>
                <p className="text-muted-foreground text-sm mb-4">
                  {errorMessage}
                </p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : isVisible ? (
          <div className="h-full flex justify-center relative">
            {isLoading && (
              <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 shadow-lg">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    Updating preview...
                  </span>
                </div>
              </div>
            )}
            <div
              style={getViewportStyles()}
              className="transition-all duration-300 ease-in-out border-l border-r border-border/50"
            >
              <iframe
                ref={iframeRef}
                srcDoc={previewContent}
                className="w-full h-full border-0 bg-white"
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6 sm:p-8 text-center">
                <EyeOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="text-lg mb-2">Preview Hidden</CardTitle>
                <p className="text-muted-foreground text-sm mb-4">
                  Click the eye icon to show the preview
                </p>
                <Button onClick={() => setIsVisible(true)} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Show Preview
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
