import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Send,
  Code,
  Zap,
  Bot,
  ArrowRight,
  Github,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState("");

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      // Navigate to editor with the prompt
      navigate("/editor", { state: { initialPrompt: chatInput.trim() } });
    }
  };

  const examplePrompts = [
    "Create a modern landing page for a SaaS app",
    "Build a responsive blog layout with dark mode",
    "Design a dashboard with charts and analytics",
    "Make a portfolio site with animations",
  ];

  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "AI-Powered Generation",
      description: "Describe your idea and watch AI build it instantly",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Live Code Editor",
      description: "Edit code with syntax highlighting and IntelliSense",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Preview",
      description: "See your changes instantly with hot reload",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold premium-gradient bg-clip-text text-transparent">
                  AI Code Builder
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Build with AI • Ship faster
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/editor")}
              >
                Open Editor
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary animate-pulse-glow" />
              <span className="text-sm font-medium text-primary">
                Powered by AI
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="premium-gradient bg-clip-text text-transparent">
                Build web apps
              </span>
              <br />
              <span className="text-foreground">with just a prompt</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Describe your idea and watch AI generate a complete web
              application with modern frameworks, responsive design, and clean
              code.
            </p>
          </div>

          {/* Chat Interface */}
          <div className="mb-12 lg:mb-16">
            <Card className="max-w-3xl mx-auto card-gradient border border-border/50 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Assistant</h3>
                      <p className="text-sm text-muted-foreground">
                        Ready to build your app
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Try one of these examples:
                    </p>
                    <div className="grid gap-2">
                      {examplePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => setChatInput(prompt)}
                          className="text-left p-3 rounded-md bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm group"
                        >
                          <div className="flex items-center justify-between">
                            <span>{prompt}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleChatSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Describe the web app you want to build..."
                      className="h-14 text-base pr-14 bg-background/80 border-border/50 focus:border-primary/50"
                    />
                    <Button
                      type="submit"
                      disabled={!chatInput.trim()}
                      size="icon"
                      className="absolute right-2 top-2 h-10 w-10 premium-gradient"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      React & TypeScript
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Tailwind CSS
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Responsive Design
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Modern Components
                    </Badge>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="card-gradient border-border/50 hover:border-primary/30 transition-all group"
              >
                <CardContent className="p-6 text-center">
                  <div className="p-3 rounded-xl bg-primary/10 inline-flex mb-4 group-hover:bg-primary/20 transition-colors">
                    <div className="text-primary">{feature.icon}</div>
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="premium-gradient shadow-glow text-base px-8 h-12"
                onClick={() => navigate("/editor")}
              >
                Start Building Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-12 border-border/50 hover:border-primary/50"
              >
                View Examples
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              No signup required • Generate unlimited projects
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
