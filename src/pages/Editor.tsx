import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ChatAgent } from "@/components/ChatAgent";
import { CodeEditor } from "@/components/CodeEditor";
import { LivePreview } from "@/components/LivePreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Download,
  Play,
  Sun,
  Moon,
  Menu,
  MessageSquare,
  Code,
  Eye,
  Home,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { downloadProjectAsZip } from "@/lib/files";
import type { ProjectFile, ChatMessage } from "@/types";
import { useNavigate } from "react-router-dom";

export default function Editor() {
  const location = useLocation();
  const navigate = useNavigate();
  const [files, setFiles] = useState<Record<string, ProjectFile>>({});
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activePanel, setActivePanel] = useState<"chat" | "code" | "preview">(
    "chat",
  );
  const [chatOpen, setChatOpen] = useState(false);

  const loadProjectFiles = async () => {
    try {
      const response = await fetch("/project.json");
      const data = await response.json();
      setFiles(data.files);

      // Select first file by default
      const firstFile = Object.keys(data.files)[0];
      if (firstFile) {
        setSelectedFile(firstFile);
      }

      // Add system message
      setChatMessages([
        {
          id: "1",
          type: "system",
          content: `✅ Loaded project: ${data.name}`,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Failed to load project files:", error);
      toast({
        title: "Error",
        description: "Failed to load project files",
        variant: "destructive",
      });
    }
  };

  const handleFileUpdate = (filename: string, content: string) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: {
        ...prev[filename],
        content,
      },
    }));

    // Add chat message
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "system",
        content: `🛠 Updated \`${filename}\``,
        timestamp: new Date(),
      },
    ]);
  };

  const handleChatSubmit = useCallback(
    async (message: string) => {
      setIsGenerating(true);

      // Add user message
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "user",
          content: message,
          timestamp: new Date(),
        },
      ]);

      try {
        // Simulate AI response
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Add AI response
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "assistant",
            content: `I'll help you with that! Let me update the files accordingly.`,
            timestamp: new Date(),
          },
        ]);

        // Simulate file updates
        setTimeout(() => {
          const filesToUpdate = Object.keys(files).slice(0, 2);
          filesToUpdate.forEach((filename) => {
            setChatMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                type: "system",
                content: `✅ Updated \`${filename}\``,
                timestamp: new Date(),
              },
            ]);
          });
        }, 1000);
      } catch (error) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "error",
            content: `⚠️ Error: Failed to process request`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsGenerating(false);
      }
    },
    [files],
  );

  const handleDownload = async () => {
    try {
      await downloadProjectAsZip(files);
      toast({
        title: "Success",
        description: "Project downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download project",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  // Load project files on mount
  useEffect(() => {
    loadProjectFiles();
  }, []);

  // Handle initial prompt from landing page
  useEffect(() => {
    const initialPrompt = location.state?.initialPrompt;
    if (initialPrompt) {
      setTimeout(() => {
        handleChatSubmit(initialPrompt);
      }, 1000);
    }
  }, [location.state, handleChatSubmit]);

  return (
    <div
      className={`min-h-screen luxury-gradient text-foreground ${theme} relative`}
    >
      {/* Gradient background overlay */}
      <div className="absolute inset-0 mesh-gradient opacity-20 pointer-events-none" />
      {/* Header */}
      <header className="border-b border-purple-500/30 expensive-gradient backdrop-blur-sm sticky top-0 z-50 shadow-luxury">
        <div className="container mx-auto px-4 py-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="lg:hidden"
              >
                <Home className="h-4 w-4" />
              </Button>

              <div className="hidden lg:flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="gap-2 text-purple-200 hover:text-white hover:expensive-gradient"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
                <div className="w-px h-4 bg-border" />
              </div>

              <h1 className="text-xl lg:text-2xl font-bold glow-gradient bg-clip-text text-transparent">
                AI Code Builder
              </h1>
              <div className="hidden sm:block text-sm text-muted-foreground">
                Build with AI • Edit • Preview
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Navigation */}
              <div className="flex lg:hidden">
                <Button
                  variant={activePanel === "chat" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActivePanel("chat")}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant={activePanel === "code" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActivePanel("code")}
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button
                  variant={activePanel === "preview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActivePanel("preview")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              <div className="w-px h-4 bg-border hidden sm:block" />

              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Download ZIP</span>
              </Button>

              {/* Mobile Chat Toggle */}
              <Sheet open={chatOpen} onOpenChange={setChatOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <ChatAgent
                    messages={chatMessages}
                    onSubmit={handleChatSubmit}
                    isGenerating={isGenerating}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Desktop: Left Panel - Chat Agent */}
        <div className="hidden lg:block w-80 xl:w-96 border-r border-border bg-card/30">
          <ChatAgent
            messages={chatMessages}
            onSubmit={handleChatSubmit}
            isGenerating={isGenerating}
          />
        </div>

        {/* Mobile: Single Panel View */}
        <div className="flex-1 lg:hidden">
          {activePanel === "chat" && (
            <ChatAgent
              messages={chatMessages}
              onSubmit={handleChatSubmit}
              isGenerating={isGenerating}
            />
          )}
          {activePanel === "code" && (
            <CodeEditor
              files={files}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onFileUpdate={handleFileUpdate}
            />
          )}
          {activePanel === "preview" && <LivePreview files={files} />}
        </div>

        {/* Desktop: Center Panel - Code Editor */}
        <div className="hidden lg:block flex-1 border-r border-border">
          <CodeEditor
            files={files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onFileUpdate={handleFileUpdate}
          />
        </div>

        {/* Desktop: Right Panel - Live Preview */}
        <div className="hidden lg:block w-80 xl:w-96">
          <LivePreview files={files} />
        </div>
      </div>

      {/* Mobile FAB for Download */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleDownload}
          size="icon"
          className="h-12 w-12 rounded-full glow-gradient shadow-luxury"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
