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
        return "glow-gradient text-white ml-4 shadow-luxury";
      case "assistant":
        return "luxury-gradient text-white mr-4 shadow-expensive border border-purple-500/20";
      case "system":
        return "expensive-gradient text-white mx-4 shadow-luxury border border-blue-500/20";
      case "error":
        return "bg-gradient-to-r from-red-900 to-red-800 text-white mx-4 shadow-lg border border-red-500/30";
      default:
        return "bg-muted text-muted-foreground mx-4";
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm relative">
      {/* Subtle gradient background overlay */}
      <div className="absolute inset-0 expensive-gradient opacity-5 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-purple-500/30 luxury-gradient shadow-expensive">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl glow-gradient border border-purple-400/40 shadow-luxury animate-pulse-glow">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg lg:text-xl text-white">
              <span className="glow-gradient bg-clip-text text-transparent">
                Elite AI Assistant
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-200">
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Zap className="h-3 w-3 animate-pulse" />
                  Crafting magic...
                </span>
              ) : (
                "Ready to build extraordinary apps"
              )}
            </p>
          </div>
          {isGenerating && (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-purple-200 rounded-full animate-bounce"></div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2 sm:p-4 relative z-10">
        <div className="space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 mx-2 sm:mx-0 shadow-luxury backdrop-blur-sm">
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
                        className="block w-full p-3 rounded-xl luxury-gradient border border-purple-400/20 hover:border-purple-300/40 hover:glow-gradient transition-all text-left shadow-expensive group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-purple-100 font-medium">
                            {prompt}
                          </span>
                          <Sparkles className="h-4 w-4 text-purple-300 group-hover:text-white transition-colors" />
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
                  className={`p-1.5 rounded-lg flex-shrink-0 shadow-expensive ${
                    message.type === "assistant"
                      ? "glow-gradient"
                      : message.type === "system"
                        ? "expensive-gradient"
                        : message.type === "error"
                          ? "bg-gradient-to-r from-red-900 to-red-800"
                          : "bg-muted"
                  }`}
                >
                  <div className="text-white">
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
                <div className="p-1.5 rounded-lg accent-gradient flex-shrink-0 shadow-luxury">
                  <div className="text-white">
                    {getMessageIcon(message.type)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-start gap-2 sm:gap-3 animate-pulse">
              <div className="p-1.5 rounded-lg glow-gradient flex-shrink-0 shadow-luxury animate-pulse-glow">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <Card className="luxury-gradient text-white max-w-[80%] mr-4 shadow-expensive border border-purple-500/20 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-purple-200 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-purple-100 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-purple-100">
                      Generating premium code...
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
      <div className="relative z-10 p-3 sm:p-4 border-t border-purple-500/30 luxury-gradient shadow-expensive">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your premium vision..."
                disabled={isGenerating}
                className="flex-1 text-sm expensive-gradient border-purple-400/30 focus:border-purple-300/60 text-white placeholder:text-purple-300/70 shadow-luxury h-12 pr-14"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isGenerating}
                size="icon"
                className="absolute right-1 top-1 h-10 w-10 glow-gradient hover:opacity-90 shadow-luxury"
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
                className="text-xs h-8 px-3 expensive-gradient text-white border-purple-400/30 hover:border-purple-300/50 hover:glow-gradient shadow-expensive"
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
