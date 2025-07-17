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
      {/* Subtle gradient background */}
      <div className="absolute inset-0 hero-gradient opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      {/* Subtle animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 premium-gradient rounded-full opacity-10 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 premium-gradient rounded-full opacity-8 blur-3xl animate-pulse delay-1000" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-xl glow-gradient border border-purple-500/30 shadow-2xl">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-pulse-glow" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold glow-gradient bg-clip-text text-transparent">
                  AI Code Builder
                </h1>
                <p className="text-xs text-gray-300 hidden sm:block">
                  Build with AI • Ship faster
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex text-gray-300 hover:text-white border-white/20 hover:border-white/40"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-gray-300 hover:text-white border-white/20 hover:border-white/40 text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden xs:inline">Sign In</span>
                <span className="xs:hidden">In</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/signup")}
                className="expensive-gradient text-white border-0 hover:opacity-90 shadow-lg text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden xs:inline">Sign Up</span>
                <span className="xs:hidden">Up</span>
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
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full luxury-gradient border border-purple-400/30 mb-8 shadow-2xl">
              <Sparkles className="h-5 w-5 text-purple-300 animate-pulse-glow" />
              <span className="text-sm font-medium text-purple-100">
                Powered by Advanced AI
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="glow-gradient bg-clip-text text-transparent animate-pulse-glow">
                Build Extraordinary
              </span>
              <br />
              <span className="text-white drop-shadow-2xl">
                Web Applications
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Transform your ideas into stunning web applications with our
              premium AI-powered platform. Experience the future of development.
            </p>
          </div>

          {/* Chat Interface */}
          <div className="mb-12 lg:mb-16">
            <Card className="max-w-3xl mx-auto expensive-gradient border border-purple-500/30 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl accent-gradient border border-purple-400/30 shadow-xl">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        Elite AI Assistant
                      </h3>
                      <p className="text-sm text-purple-200">
                        Ready to craft your masterpiece
                      </p>
                    </div>
                  </div>

                  <div className="luxury-gradient rounded-xl p-6 mb-6 border border-purple-500/20">
                    <p className="text-sm text-purple-200 mb-4 font-medium">
                      Experience premium AI generation:
                    </p>
                    <div className="grid gap-3">
                      {examplePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => setChatInput(prompt)}
                          className="text-left p-4 rounded-xl premium-dark-gradient border border-purple-400/20 hover:border-purple-300/40 hover:luxury-gradient transition-all text-sm group shadow-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-purple-100 font-medium">
                              {prompt}
                            </span>
                            <ArrowRight className="h-4 w-4 text-purple-300 group-hover:text-white transition-colors group-hover:translate-x-1 transition-transform" />
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
                      placeholder="Describe your extraordinary vision..."
                      className="h-16 text-base pr-16 luxury-gradient border-purple-400/30 focus:border-purple-300/60 text-white placeholder:text-purple-300/70 shadow-xl"
                    />
                    <Button
                      type="submit"
                      disabled={!chatInput.trim()}
                      size="icon"
                      className="absolute right-2 top-2 h-12 w-12 glow-gradient hover:opacity-90 shadow-xl"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs expensive-gradient text-white border-0"
                    >
                      React & TypeScript
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs accent-gradient text-white border-0"
                    >
                      Premium Components
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs luxury-gradient text-white border-0"
                    >
                      Responsive Design
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs glow-gradient text-white border-0"
                    >
                      AI-Optimized
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
                className="luxury-gradient border border-purple-500/30 hover:border-purple-400/50 transition-all group shadow-2xl"
              >
                <CardContent className="p-6 text-center">
                  <div className="p-4 rounded-xl expensive-gradient inline-flex mb-6 group-hover:glow-gradient transition-all shadow-xl border border-purple-400/20">
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="font-semibold mb-3 text-xl text-white">
                    {feature.title}
                  </h3>
                  <p className="text-purple-200 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="glow-gradient shadow-2xl text-base px-10 h-14 text-white border-0 hover:opacity-90 font-semibold"
                onClick={() => navigate("/editor")}
              >
                Start Creating Magic
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-10 h-14 expensive-gradient text-white border-purple-400/30 hover:border-purple-300/50"
              >
                Explore Premium Features
              </Button>
            </div>

            <p className="text-xs text-purple-300 mt-6 font-medium">
              No limits • Unlimited premium generations • Enterprise-grade AI
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
