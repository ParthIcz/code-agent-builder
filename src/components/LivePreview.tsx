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

    let styles = "";
    cssFiles.forEach(([path, file]) => {
      styles += file.content + "\n";
    });

    // Extract JSX content from React component
    const jsxMatch = mainContent.match(/return\s*\(([\s\S]*?)\);?\s*\}/);
    let bodyContent = "";

    if (jsxMatch) {
      bodyContent = jsxMatch[1]
        .replace(/className=/g, "class=")
        .replace(/htmlFor=/g, "for=")
        .replace(/{`([^`]*)`}/g, "$1")
        .replace(/{([^}]*)}/g, (match, p1) => {
          if (p1.startsWith('"') || p1.startsWith("'")) return p1;
          return ""; // Remove JS expressions for static preview
        });
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated App Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${styles}
    
    /* Additional responsive utilities */
    @media (max-width: 768px) {
      .text-6xl { font-size: 3rem; }
      .text-8xl { font-size: 4rem; }
      .py-20 { padding-top: 3rem; padding-bottom: 3rem; }
    }
  </style>
</head>
<body>
  ${bodyContent || generateFallbackContent(files)}
  
  <script>
    // Basic interactivity for generated content
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
          alert('Form submitted! (This is a preview)');
        });
      });
      
      // Handle button clicks
      const buttons = document.querySelectorAll('button:not([type="submit"])');
      buttons.forEach(button => {
        if (!button.querySelector('svg') && !button.onclick) {
          button.addEventListener('click', function() {
            console.log('Button clicked:', this.textContent);
          });
        }
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
    const fileList = Object.keys(files);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Project Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen p-8">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Generated Project
      </h1>
      <p class="text-gray-400">Your AI-generated project is ready! Generated ${fileList.length} files.</p>
    </div>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      ${fileList
        .map(
          (filename) => `
        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
            <span class="text-sm font-mono text-gray-300">${filename}</span>
          </div>
          <div class="text-xs text-gray-500">${files[filename].type || "file"}</div>
        </div>
      `,
        )
        .join("")}
    </div>
    
    <div class="text-center">
      <div class="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2">
        <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-blue-400 text-sm">Use the code editor to view and modify your files</span>
      </div>
    </div>
  </div>
</body>
</html>`;
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
