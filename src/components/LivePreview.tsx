import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, ExternalLink, Eye, EyeOff } from 'lucide-react';
import type { ProjectFile } from '@/types';

interface LivePreviewProps {
  files: Record<string, ProjectFile>;
}

export function LivePreview({ files }: LivePreviewProps) {
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate preview content
  useEffect(() => {
    try {
      const htmlContent = generatePreviewHTML(files);
      setPreviewContent(htmlContent);
      setHasError(false);
      setErrorMessage('');
    } catch (error) {
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Preview generation failed');
    }
  }, [files]);

  const generatePreviewHTML = (files: Record<string, ProjectFile>): string => {
    // Find the main CSS file
    const cssFile = files['app/globals.css'] || files['styles/globals.css'];
    const cssContent = cssFile ? cssFile.content : '';

    // Simple preview template
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
  </style>
</head>
<body>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          JD
        </div>
        <div class="hidden md:flex space-x-8">
          <a href="#home" class="text-slate-400 hover:text-white transition-colors">Home</a>
          <a href="#about" class="text-slate-400 hover:text-white transition-colors">About</a>
          <a href="#projects" class="text-slate-400 hover:text-white transition-colors">Projects</a>
          <a href="#contact" class="text-slate-400 hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </nav>

  <section id="home" class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900 to-pink-900/20"></div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="text-center max-w-4xl mx-auto">
        <h1 class="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          John Doe
        </h1>
        <p class="text-xl md:text-2xl text-slate-400 mb-8">
          Full-Stack Developer crafting exceptional digital experiences
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
            View My Work
          </button>
          <button class="px-8 py-3 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all">
            Download CV
          </button>
        </div>
      </div>
    </div>
  </section>

  <section id="about" class="py-20 bg-slate-800/50">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12 text-white">
          About Me
        </h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <p class="text-lg text-slate-400 mb-6">
              I'm a passionate full-stack developer with 5+ years of experience 
              building modern web applications. I love creating digital experiences 
              that are both functional and beautiful.
            </p>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">React</span>
              <span class="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">Next.js</span>
              <span class="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">TypeScript</span>
              <span class="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">Node.js</span>
            </div>
          </div>
          <div class="space-y-4">
            <div class="p-4 bg-slate-700/50 rounded-lg">
              <h3 class="font-semibold text-white mb-2">Full-Stack Development</h3>
              <p class="text-slate-400 text-sm">Building scalable web applications from frontend to backend</p>
            </div>
            <div class="p-4 bg-slate-700/50 rounded-lg">
              <h3 class="font-semibold text-white mb-2">UI/UX Design</h3>
              <p class="text-slate-400 text-sm">Creating intuitive and beautiful user interfaces</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="projects" class="py-20">
    <div class="container mx-auto px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12 text-white">
          Featured Projects
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-slate-800/50 rounded-lg p-6 hover:bg-slate-700/50 transition-all">
            <h3 class="text-xl font-semibold text-white mb-2">E-commerce Platform</h3>
            <p class="text-slate-400 mb-4">Modern e-commerce solution with Next.js, Stripe, and Prisma</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Next.js</span>
              <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">TypeScript</span>
            </div>
            <div class="flex gap-2">
              <button class="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">Code</button>
              <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">Demo</button>
            </div>
          </div>
          
          <div class="bg-slate-800/50 rounded-lg p-6 hover:bg-slate-700/50 transition-all">
            <h3 class="text-xl font-semibold text-white mb-2">Task Management App</h3>
            <p class="text-slate-400 mb-4">Collaborative task management with real-time updates</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">React</span>
              <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Node.js</span>
            </div>
            <div class="flex gap-2">
              <button class="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">Code</button>
              <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">Demo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="contact" class="py-20 bg-slate-800/50">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-12 text-white">
          Get In Touch
        </h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-2xl font-semibold mb-6 text-white">
              Let's work together
            </h3>
            <p class="text-slate-400 mb-8">
              I'm always open to discussing new opportunities and interesting projects.
            </p>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <span class="text-purple-400">📧</span>
                <span class="text-slate-300">john.doe@example.com</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-purple-400">📱</span>
                <span class="text-slate-300">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
          <div class="bg-slate-700/50 rounded-lg p-6">
            <form class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Your Name" class="w-full p-3 bg-slate-800 text-white rounded border border-slate-600 focus:border-purple-400 focus:outline-none">
                <input type="email" placeholder="Your Email" class="w-full p-3 bg-slate-800 text-white rounded border border-slate-600 focus:border-purple-400 focus:outline-none">
              </div>
              <input type="text" placeholder="Subject" class="w-full p-3 bg-slate-800 text-white rounded border border-slate-600 focus:border-purple-400 focus:outline-none">
              <textarea placeholder="Your Message" rows="4" class="w-full p-3 bg-slate-800 text-white rounded border border-slate-600 focus:border-purple-400 focus:outline-none resize-none"></textarea>
              <button type="submit" class="w-full p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded hover:from-purple-700 hover:to-pink-700 transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
  
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
      
      // Handle form submissions
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          alert('Form submitted! (This is a preview)');
        });
      });
    });
  </script>
</body>
</html>
    `;
  };

  const handleRefresh = () => {
    // Force re-render
    setPreviewContent('');
    setTimeout(() => {
      const htmlContent = generatePreviewHTML(files);
      setPreviewContent(htmlContent);
    }, 100);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([previewContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-lg">Live Preview</h2>
            {hasError && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Error
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative">
        {hasError ? (
          <div className="h-full flex items-center justify-center">
            <Card className="p-8 text-center max-w-md">
              <CardContent>
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <CardTitle className="text-lg mb-2">Preview Error</CardTitle>
                <p className="text-muted-foreground mb-4">
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
          <iframe
            ref={iframeRef}
            srcDoc={previewContent}
            className="w-full h-full border-0 bg-white"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Card className="p-8 text-center">
              <CardContent>
                <EyeOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="text-lg mb-2">Preview Hidden</CardTitle>
                <p className="text-muted-foreground mb-4">
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