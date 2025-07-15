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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessage } from "@/types";

interface ChatAgentProps {
  messages: ChatMessage[];
  onSubmit: (message: string) => void;
  isGenerating: boolean;
}

export function ChatAgent({
  messages,
  onSubmit,
  isGenerating,
}: ChatAgentProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  const quickPrompts = [
    "Add a hero section",
    "Create a contact form",
    "Make it responsive",
    "Add dark mode toggle",
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
              AI Assistant
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isGenerating ? "Generating..." : "Ready to help"}
            </p>
          </div>
          {isGenerating && (
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
                  <div className="p-4 rounded-xl glow-gradient inline-flex mb-4 shadow-luxury animate-expensive-glow">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-semibold mb-3 text-base sm:text-lg">
                    <span className="glow-gradient bg-clip-text text-transparent">
                      Welcome to Elite AI Builder
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-200 mb-4 leading-relaxed">
                    I'll help you craft exceptional web applications. Try these
                    premium commands:
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

          {isGenerating && (
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
                    <span>Thinking...</span>
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
                disabled={isGenerating}
                className="flex-1 text-sm bg-background/80 border-border/50 focus:border-primary/50 h-12 pr-14"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isGenerating}
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
                disabled={isGenerating}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </form>

        <div className="text-xs text-purple-300 mt-3 text-center flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3" />
          <span>Press Enter to send • Powered by Elite AI</span>
          <Sparkles className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
