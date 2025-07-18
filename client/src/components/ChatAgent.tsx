import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  User,
  AlertCircle,
  CheckCircle,
  Settings,
  Sparkles,
  Zap,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  geminiService,
  type ProjectGenerationRequest,
} from "@/services/gemini";
import type { ChatMessage, ProjectFile } from "@/types";

interface ChatAgentProps {
  messages: ChatMessage[];
  onSubmit: (message: string) => void;
  isGenerating: boolean;
  onProjectGenerated?: (
    files: Record<string, ProjectFile>,
    previewUrl?: string,
  ) => void;
}

export function ChatAgent({
  messages,
  onSubmit,
  isGenerating,
  onProjectGenerated,
}: ChatAgentProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const handleAIGeneration = async (message: string) => {
    setIsAIGenerating(true);

    try {
      // Parse the user message to extract project requirements
      const projectRequest: ProjectGenerationRequest = {
        description: message,
        projectType: detectProjectType(message),
        framework: "React/Next.js",
        styling: "Tailwind CSS",
        features: extractFeatures(message),
      };

      let generatedProject;

      try {
        // Try backend API first
        console.log("Attempting to call backend API...");
        const response = await fetch(
          "http://localhost:8082/api/generate-project",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(projectRequest),
          },
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        generatedProject = await response.json();
        console.log("Backend API call successful");
      } catch (backendError) {
        console.warn(
          "Backend API failed, falling back to direct Gemini API:",
          backendError,
        );

        // Update project request for direct Gemini API
        const directProjectRequest = {
          ...projectRequest,
          framework: "HTML/CSS/JS",
          styling: "CSS3",
        };

        // Fallback to direct Gemini API call
        generatedProject =
          await geminiService.generateProject(directProjectRequest);
        console.log("Direct Gemini API call successful");
      }

      // Convert generated project to ProjectFile format
      const projectFiles: Record<string, ProjectFile> = {};
      Object.entries(generatedProject.files).forEach(([filename, fileData]) => {
        // Type assertion to ensure fileData has content and type
        const typedFileData = fileData as { content: string; type: string };
        projectFiles[filename] = {
          content: typedFileData.content,
          type: typedFileData.type,
        };
      });

      // Notify parent component about the generated project
      if (onProjectGenerated) {
        // Pass previewUrl if present
        (onProjectGenerated as any)(projectFiles, generatedProject.previewUrl);
      }

      return `✅ Successfully generated "${generatedProject.name}"!\n\n${generatedProject.description}\n\nGenerated ${Object.keys(projectFiles).length} files. You can now edit them in the code editor and see the live preview.${generatedProject.previewUrl ? `\n\nPreview: ${generatedProject.previewUrl}` : ""}`;
    } catch (error) {
      console.error("AI Generation Error:", error);
      return `❌ Failed to generate project: ${error instanceof Error ? error.message : "Unknown error"}`;
    } finally {
      setIsAIGenerating(false);
    }
  };

  const detectProjectType = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes("portfolio") || lower.includes("personal website"))
      return "portfolio";
    if (lower.includes("todo") || lower.includes("task")) return "todo-app";
    if (lower.includes("dashboard") || lower.includes("admin"))
      return "dashboard";
    if (lower.includes("ecommerce") || lower.includes("shop"))
      return "ecommerce";
    if (lower.includes("blog")) return "blog";
    if (lower.includes("landing") || lower.includes("saas"))
      return "landing-page";
    return "web-application";
  };

  const extractFeatures = (message: string): string[] => {
    const features: string[] = [];
    const lower = message.toLowerCase();

    if (lower.includes("dark mode") || lower.includes("theme"))
      features.push("Dark mode toggle");
    if (lower.includes("responsive")) features.push("Responsive design");
    if (lower.includes("animation") || lower.includes("motion"))
      features.push("Animations");
    if (lower.includes("form") || lower.includes("contact"))
      features.push("Contact form");
    if (lower.includes("chart") || lower.includes("graph"))
      features.push("Data visualization");
    if (lower.includes("auth") || lower.includes("login"))
      features.push("Authentication");
    if (lower.includes("search")) features.push("Search functionality");
    if (lower.includes("filter")) features.push("Filtering");

    return features.length > 0 ? features : ["Modern UI", "Responsive design"];
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating && !isAIGenerating) {
      const userMessage = input.trim();
      setInput("");

      // First call the original onSubmit to add user message
      onSubmit(userMessage);

      // Then handle AI generation
      const aiResponse = await handleAIGeneration(userMessage);

      // Add AI response message
      onSubmit(aiResponse);
    }
  };

  const quickPrompts = [
    "Create a modern portfolio website with HTML, CSS, and JavaScript",
    "Build a todo app with HTML, CSS, and JavaScript",
    "Generate a landing page for a SaaS product with HTML, CSS, and JavaScript",
    "Create a dashboard with charts and data visualization using HTML, CSS, and JavaScript",
    "Build an e-commerce product catalog with HTML, CSS, and JavaScript",
    "Generate a blog website with markdown support using HTML, CSS, and JavaScript",
  ];

  const getMessageIcon = (type: ChatMessage["type"]) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "assistant":
        return <Bot className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getMessageStyle = (type: ChatMessage["type"]) => {
    switch (type) {
      case "user":
        return "bg-gradient-to-r from-primary to-primary/80 text-white ml-4 shadow-md border border-primary/20";
      case "assistant":
        return "bg-gradient-to-r from-card to-card-elevated text-foreground mr-4 border border-primary/10 shadow-sm";
      case "system":
        return "bg-gradient-to-r from-muted to-muted/80 text-muted-foreground mx-4 border border-border/50";
      case "error":
        return "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground mx-4 border border-destructive/20";
      default:
        return "bg-muted text-muted-foreground mx-4";
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base lg:text-lg truncate">
              Gemini AI Assistant
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isGenerating || isAIGenerating
                ? "Generating..."
                : "Ready to help"}
            </p>
          </div>
          {(isGenerating || isAIGenerating) && (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-2 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 mx-2 sm:mx-0">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <div className="p-3 rounded-xl bg-primary/10 inline-flex mb-4">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
                  </div>
                  <h3 className="font-semibold mb-3 text-base sm:text-lg">
                    Welcome to Gemini Code Builder
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
                    I'll help you build and modify your project using Google's
                    Gemini AI. Try commands like:
                  </p>
                  <div className="space-y-2 text-xs sm:text-sm">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(prompt)}
                        className="block w-full p-3 rounded-xl bg-gradient-to-r from-muted to-muted/50 border border-primary/20 hover:border-primary/40 hover:from-primary/10 hover:to-primary/5 transition-all text-left shadow-sm group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-foreground font-medium">
                            {prompt}
                          </span>
                          <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 sm:gap-3 animate-slide-up ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type !== "user" && (
                <div
                  className={`p-1.5 rounded-lg flex-shrink-0 shadow-sm ${
                    message.type === "assistant"
                      ? "bg-gradient-to-br from-primary to-primary/70"
                      : message.type === "system"
                        ? "bg-gradient-to-br from-muted to-muted/70"
                        : message.type === "error"
                          ? "bg-gradient-to-br from-destructive to-destructive/70"
                          : "bg-muted"
                  }`}
                >
                  <div
                    className={
                      message.type === "assistant"
                        ? "text-white"
                        : message.type === "system"
                          ? "text-muted-foreground"
                          : message.type === "error"
                            ? "text-destructive-foreground"
                            : "text-muted-foreground"
                    }
                  >
                    {getMessageIcon(message.type)}
                  </div>
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}
              >
                <Card
                  className={`${getMessageStyle(message.type)} backdrop-blur-sm`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-2 text-purple-200">
                      {formatDistanceToNow(message.timestamp, {
                        addSuffix: true,
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {message.type === "user" && (
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex-shrink-0 shadow-sm">
                  <div className="text-white">
                    {getMessageIcon(message.type)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {(isGenerating || isAIGenerating) && (
            <div className="flex items-start gap-2 sm:gap-3 animate-pulse">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex-shrink-0 shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <Card className="bg-gradient-to-r from-card to-card-elevated text-foreground max-w-[80%] mr-4 shadow-sm border border-primary/10">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    </div>
                    <span>
                      {isAIGenerating
                        ? "Generating with Gemini..."
                        : "Thinking..."}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>

      {/* Input Section */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-t border-border bg-card/50">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe what you want to build..."
                disabled={isGenerating || isAIGenerating}
                className="flex-1 text-sm bg-background/80 border-border/50 focus:border-primary/50 h-12 pr-14"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isGenerating || isAIGenerating}
                size="icon"
                className="absolute right-1 top-1 h-10 w-10 premium-gradient"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {quickPrompts.slice(0, 2).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 px-3 border-border/50 hover:border-primary/50"
                onClick={() => setInput(prompt)}
                disabled={isGenerating || isAIGenerating}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </form>

        <div className="text-xs text-purple-300 mt-3 text-center flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3" />
          <span>Press Enter to send • Powered by Google Gemini</span>
          <Sparkles className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
