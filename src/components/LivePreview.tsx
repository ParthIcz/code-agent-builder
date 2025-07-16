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
}

export function LivePreview({ files }: LivePreviewProps) {
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewportSize, setViewportSize] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate preview content
  useEffect(() => {
    try {
      const htmlContent = generatePreviewHTML(files);
      setPreviewContent(htmlContent);
      setHasError(false);
      setErrorMessage("");
    } catch (error) {
      setHasError(true);
      setErrorMessage(
        error instanceof Error ? error.message : "Preview generation failed",
      );
    }
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
  <title>Gemini Code Builder - Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center">
  <div class="text-center max-w-md mx-auto p-8">
    <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
    </div>
    <h1 class="text-2xl font-bold mb-2">No Project Generated</h1>
    <p class="text-gray-400 mb-4">Use the AI chat to generate your first project!</p>
    <div class="text-sm text-gray-500">
      Try: "Create a portfolio website" or "Build a todo app"
    </div>
  </div>
</body>
</html>`;
    }

    // Try to find and render the actual generated content
    return renderGeneratedContent(files);
    return `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${cssContent}
    
    /* Additional preview styles */
    .premium-gradient {
      background: linear-gradient(135deg, #8b5cf6, #a855f7);
    }
    
    .card-gradient {
      background: linear-gradient(135deg, #1e293b, #334155);
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: hsl(225, 15%, 8%);
      color: hsl(210, 40%, 98%);
    }
    
    /* Responsive utilities */
    @media (max-width: 768px) {
      .text-6xl { font-size: 3rem; }
      .text-8xl { font-size: 4rem; }
      .py-20 { padding-top: 3rem; padding-bottom: 3rem; }
    }
  </style>
</head>
<body>
  <!-- Mobile-first responsive navigation -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-14 sm:h-16">
        <div class="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          AI Builder
        </div>
        <div class="hidden md:flex space-x-6 lg:space-x-8">
          <a href="#home" class="text-slate-400 hover:text-white transition-colors text-sm lg:text-base">Home</a>
          <a href="#about" class="text-slate-400 hover:text-white transition-colors text-sm lg:text-base">About</a>
          <a href="#projects" class="text-slate-400 hover:text-white transition-colors text-sm lg:text-base">Projects</a>
          <a href="#contact" class="text-slate-400 hover:text-white transition-colors text-sm lg:text-base">Contact</a>
        </div>
        <button class="md:hidden p-2 text-slate-400 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <!-- Hero Section - Fully responsive -->
  <section id="home" class="min-h-screen flex items-center justify-center relative overflow-hidden pt-14 sm:pt-16">
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-pink-900/20"></div>
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-5xl mx-auto">
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
          AI Code Builder
        </h1>
        <p class="text-lg sm:text-xl md:text-2xl text-slate-400 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
          Building beautiful web applications with AI-powered code generation
        </p>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
          <button class="px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm sm:text-base">
            Start Building
          </button>
          <button class="px-6 sm:px-8 py-3 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all text-sm sm:text-base">
            View Examples
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="py-12 sm:py-16 lg:py-20 bg-slate-800/50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 text-white">
          Features
        </h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div class="p-6 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-all">
            <div class="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">AI-Powered</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Generate complete web applications with just a simple description
            </p>
          </div>
          
          <div class="p-6 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-all">
            <div class="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Live Editor</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Edit code with syntax highlighting and real-time preview
            </p>
          </div>
          
          <div class="p-6 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-all sm:col-span-2 lg:col-span-1">
            <div class="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Responsive</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              All generated code is mobile-first and fully responsive
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Projects Section -->
  <section id="projects" class="py-12 sm:py-16 lg:py-20">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 text-white">
          What You Can Build
        </h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div class="bg-slate-800/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all group">
            <div class="w-full h-32 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-2xl">🚀</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Landing Pages</h3>
            <p class="text-slate-400 text-sm mb-4 leading-relaxed">
              Modern landing pages with hero sections, features, and contact forms
            </p>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">React</span>
              <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Tailwind</span>
            </div>
          </div>
          
          <div class="bg-slate-800/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all group">
            <div class="w-full h-32 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-2xl">📊</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Dashboards</h3>
            <p class="text-slate-400 text-sm mb-4 leading-relaxed">
              Analytics dashboards with charts, tables, and interactive components
            </p>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Charts</span>
              <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Data</span>
            </div>
          </div>
          
          <div class="bg-slate-800/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all group sm:col-span-2 lg:col-span-1">
            <div class="w-full h-32 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-2xl">🛍️</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">E-commerce</h3>
            <p class="text-slate-400 text-sm mb-4 leading-relaxed">
              Online stores with product catalogs, shopping carts, and checkout
            </p>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Commerce</span>
              <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="py-12 sm:py-16 lg:py-20 bg-slate-800/50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 text-white">
          Get Started Today
        </h2>
        <div class="text-center">
          <p class="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of developers who are building faster with AI-powered code generation.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-base">
              Start Building Now
            </button>
            <button class="px-8 py-4 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all text-base">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 border-t border-slate-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <p class="text-slate-500 text-sm">
          © 2024 AI Code Builder. Built with ❤️ and AI.
        </p>
      </div>
    </div>
  </footer>
  
  <script>
    // Add basic interactivity
    document.addEventListener('DOMContentLoaded', function() {
      // Handle navigation
      const navLinks = document.querySelectorAll('nav a[href^="#"]');
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
      
      // Handle button clicks
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        if (!button.querySelector('svg')) { // Skip icon buttons
          button.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.textContent.includes('Start Building')) {
              alert('Ready to start building! This is a live preview.');
            } else {
              alert('Button clicked! This is a live preview.');
            }
          });
        }
      });
    });
  </script>
</body>
</html>
    `;
  };

  const handleRefresh = () => {
    // Force re-render
    setPreviewContent("");
    setTimeout(() => {
      const htmlContent = generatePreviewHTML(files);
      setPreviewContent(htmlContent);
    }, 100);
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
            {hasError && (
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
          <div className="h-full flex justify-center">
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
