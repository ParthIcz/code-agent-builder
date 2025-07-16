import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ChatAgent } from "@/components/ChatAgent";
import { CodeEditor } from "@/components/CodeEditor";
import { LivePreview } from "@/components/LivePreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
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
  // Always call hooks at the top level
  const location = useLocation();
  const navigate = useNavigate();

  // Counter to ensure unique message IDs
  const messageIdRef = useRef(0);
  const [files, setFiles] = useState<Record<string, ProjectFile>>({});
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activePanel, setActivePanel] = useState<"chat" | "code" | "preview">(
    "chat",
  );
  const [chatOpen, setChatOpen] = useState(false);

  // Panel size persistence
  const [panelSizes, setPanelSizes] = useState(() => {
    try {
      const saved = localStorage.getItem("editor-panel-sizes");
      return saved ? JSON.parse(saved) : [25, 45, 30];
    } catch {
      return [25, 45, 30];
    }
  });

  const handlePanelResize = (sizes: number[]) => {
    setPanelSizes(sizes);
    try {
      localStorage.setItem("editor-panel-sizes", JSON.stringify(sizes));
    } catch {
      // Silently fail if localStorage is not available
    }
  };

  const handleProjectGenerated = (
    generatedFiles: Record<string, ProjectFile>,
  ) => {
    setFiles(generatedFiles);

    // Select first file by default
    const firstFile = Object.keys(generatedFiles)[0];
    if (firstFile) {
      setSelectedFile(firstFile);
    }

    toast({
      title: "Project Generated",
      description: `Successfully generated ${Object.keys(generatedFiles).length} files`,
    });
  };

  const loadInitialProject = () => {
    // Set empty initial state - projects will be generated via AI
    setFiles({});
    setSelectedFile("");

    // Add welcome message
    setChatMessages([
      {
        id: "welcome-1",
        type: "system",
        content: `🤖 Welcome to AI Code Builder! Describe what you want to build and I'll generate the complete project for you.`,
        timestamp: new Date(),
      },
    ]);
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
        id: `msg-${++messageIdRef.current}-${Date.now()}`,
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
          id: `msg-${++messageIdRef.current}-${Date.now()}`,
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
            id: `msg-${++messageIdRef.current}-${Date.now()}`,
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
                id: `msg-${++messageIdRef.current}-${Date.now()}`,
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
            id: `msg-${++messageIdRef.current}-${Date.now()}`,
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
    const initialPrompt = location?.state?.initialPrompt;
    if (initialPrompt && typeof handleChatSubmit === "function") {
      setTimeout(() => {
        handleChatSubmit(initialPrompt);
      }, 1000);
    }
  }, [location?.state, handleChatSubmit]);

  return (
    <div
      className={`min-h-screen bg-background text-foreground ${theme} relative`}
    >
      {/* Subtle gradient background overlay */}
      <div className="absolute inset-0 luxury-gradient opacity-10 pointer-events-none" />
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  try {
                    navigate("/");
                  } catch (error) {
                    window.location.href = "/";
                  }
                }}
                className="lg:hidden"
              >
                <Home className="h-4 w-4" />
              </Button>

              <div className="hidden lg:flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    try {
                      navigate("/");
                    } catch (error) {
                      window.location.href = "/";
                    }
                  }}
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
                  <SheetTitle className="sr-only">AI Chat Assistant</SheetTitle>
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
      <div className="h-[calc(100vh-73px)] relative z-10">
        {/* Desktop: Resizable Panels */}
        <div className="hidden lg:block h-full">
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full"
            onLayout={handlePanelResize}
          >
            {/* Chat Agent Panel */}
            <ResizablePanel
              defaultSize={panelSizes[0]}
              minSize={20}
              maxSize={40}
              className="bg-card/30"
            >
              <ChatAgent
                messages={chatMessages}
                onSubmit={handleChatSubmit}
                isGenerating={isGenerating}
              />
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="w-2 bg-border/50 hover:bg-primary/20 transition-colors duration-200"
            />

            {/* Code Editor Panel */}
            <ResizablePanel
              defaultSize={panelSizes[1]}
              minSize={30}
              maxSize={60}
            >
              <CodeEditor
                files={files}
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
                onFileUpdate={handleFileUpdate}
              />
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="w-2 bg-border/50 hover:bg-primary/20 transition-colors duration-200"
            />

            {/* Live Preview Panel */}
            <ResizablePanel
              defaultSize={panelSizes[2]}
              minSize={20}
              maxSize={50}
            >
              <LivePreview files={files} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile: Single Panel View */}
        <div className="flex-1 lg:hidden h-full">
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
