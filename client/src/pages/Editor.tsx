import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ChatAgent } from "@/components/ChatAgent";
import { AutoSaveCodeEditor } from "@/components/AutoSaveCodeEditor";
import { RealtimePreview } from "@/components/RealtimePreview";
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
import { FileService } from "@/services/fileService";

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
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);

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

  const handleProjectGenerated = async (
    generatedFiles: Record<string, ProjectFile>,
    previewUrl?: string,
  ) => {
    setFiles(generatedFiles);

    // Generate a unique project ID
    const newProjectId = FileService.generateProjectId();
    setProjectId(newProjectId);

    // Create project on server
    try {
      const result = await FileService.createProject(newProjectId, generatedFiles);
      if (result.success) {
        setPreviewUrl(result.previewUrl || FileService.getPreviewUrl(newProjectId));
        toast({
          title: "Project Created",
          description: `Successfully created project with ${Object.keys(generatedFiles).length} files`,
        });
      } else {
        toast({
          title: "Project Creation Failed",
          description: result.error || "Failed to create project on server",
          variant: "destructive",
        });
        // Fall back to local preview
        setPreviewUrl(previewUrl);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Project Creation Error",
        description: "Failed to create project on server",
        variant: "destructive",
      });
      // Fall back to local preview
      setPreviewUrl(previewUrl);
    }

    // Select first file by default
    const firstFile = Object.keys(generatedFiles)[0];
    if (firstFile) {
      setSelectedFile(firstFile);
    }
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
        content: `🤖 Welcome to Gemini Code Builder! Describe what you want to build and I'll generate the complete project for you using Google's Gemini AI.`,
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
    // setChatMessages((prev) => [
    //   ...prev,
    //   {
    //     id: `msg-${++messageIdRef.current}-${Date.now()}`,
    //     type: "system",
    //     content: `🛠 Updated \`${filename}\``,
    //     timestamp: new Date(),
    //   },
    // ]);
  };

  const handleChatSubmit = useCallback((message: string) => {
    // Add message to chat history
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${++messageIdRef.current}-${Date.now()}`,
        type:
          message.startsWith("✅") || message.startsWith("❌")
            ? "assistant"
            : "user",
        content: message,
        timestamp: new Date(),
      },
    ]);
  }, []);

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

  // Initialize with empty project on mount
  useEffect(() => {
    loadInitialProject();
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
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
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
                className="lg:hidden shrink-0"
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

              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-2xl font-bold glow-gradient bg-clip-text text-transparent truncate">
                  <span className="hidden sm:inline">Gemini Code Builder</span>
                  <span className="sm:hidden">Gemini</span>
                </h1>
                <div className="hidden md:block text-xs lg:text-sm text-muted-foreground truncate">
                  Build with Gemini AI • Edit • Preview
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Mobile Navigation */}
              <div className="flex lg:hidden bg-muted/20 rounded-md p-1">
                <Button
                  variant={activePanel === "chat" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActivePanel("chat")}
                  className="h-8 w-8 p-0"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={activePanel === "code" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActivePanel("code")}
                  className="h-8 w-8 p-0"
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={activePanel === "preview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActivePanel("preview")}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="w-px h-4 bg-border hidden sm:block" />

              <Button variant="outline" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="hidden sm:flex h-8"
              >
                <Download className="h-3.5 w-3.5 mr-2" />
                <span className="hidden md:inline">Download ZIP</span>
              </Button>

              {/* Mobile Chat Toggle */}
              <Sheet open={chatOpen} onOpenChange={setChatOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden h-8 w-8 p-0">
                    <Menu className="h-3.5 w-3.5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetTitle className="sr-only">AI Chat Assistant</SheetTitle>
                  <ChatAgent
                    messages={chatMessages}
                    onSubmit={handleChatSubmit}
                    isGenerating={isGenerating}
                    onProjectGenerated={handleProjectGenerated}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="h-[calc(100vh-60px)] sm:h-[calc(100vh-65px)] lg:h-[calc(100vh-73px)] relative z-10">
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
                onProjectGenerated={handleProjectGenerated}
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
              className="h-full"
            >
              <AutoSaveCodeEditor
                files={files}
                selectedFile={selectedFile}
                projectId={projectId}
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
              className="h-full"
            >
              <RealtimePreview 
                projectId={projectId}
                previewUrl={previewUrl} 
              />
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
              onProjectGenerated={handleProjectGenerated}
            />
          )}
          {activePanel === "code" && (
            <AutoSaveCodeEditor
              files={files}
              selectedFile={selectedFile}
              projectId={projectId}
              onFileSelect={setSelectedFile}
              onFileUpdate={handleFileUpdate}
            />
          )}
          {activePanel === "preview" && (
            <RealtimePreview 
              projectId={projectId}
              previewUrl={previewUrl} 
            />
          )}
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
