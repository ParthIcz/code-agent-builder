import { useState, useEffect } from 'react';
import { ChatAgent } from '@/components/ChatAgent';
import { CodeEditor } from '@/components/CodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Play, Sun, Moon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { downloadProjectAsZip } from '@/lib/files';
import type { ProjectFile, ChatMessage } from '@/types';

export default function Editor() {
  const [files, setFiles] = useState<Record<string, ProjectFile>>({});
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load project files on mount
  useEffect(() => {
    loadProjectFiles();
  }, []);

  const loadProjectFiles = async () => {
    try {
      const response = await fetch('/project.json');
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
          id: '1',
          type: 'system',
          content: `✅ Loaded project: ${data.name}`,
          timestamp: new Date(),
        }
      ]);
    } catch (error) {
      console.error('Failed to load project files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project files',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpdate = (filename: string, content: string) => {
    setFiles(prev => ({
      ...prev,
      [filename]: {
        ...prev[filename],
        content
      }
    }));
    
    // Add chat message
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'system',
      content: `🛠 Updated \`${filename}\``,
      timestamp: new Date(),
    }]);
  };

  const handleChatSubmit = async (message: string) => {
    setIsGenerating(true);
    
    // Add user message
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    }]);
    
    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add AI response
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I'll help you with that! Let me update the files accordingly.`,
        timestamp: new Date(),
      }]);
      
      // Simulate file updates
      setTimeout(() => {
        const filesToUpdate = Object.keys(files).slice(0, 2);
        filesToUpdate.forEach(filename => {
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'system',
            content: `✅ Updated \`${filename}\``,
            timestamp: new Date(),
          }]);
        });
      }, 1000);
      
    } catch (error) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: `⚠️ Error: Failed to process request`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadProjectAsZip(files);
      toast({
        title: 'Success',
        description: 'Project downloaded successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download project',
        variant: 'destructive',
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme}`}>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold premium-gradient bg-clip-text text-transparent">
                AI Code Builder
              </h1>
              <div className="text-sm text-muted-foreground">
                Build with AI • Edit • Preview
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download ZIP
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Chat Agent */}
        <div className="w-80 border-r border-border bg-card/30">
          <ChatAgent
            messages={chatMessages}
            onSubmit={handleChatSubmit}
            isGenerating={isGenerating}
          />
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex-1 border-r border-border">
          <CodeEditor
            files={files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onFileUpdate={handleFileUpdate}
          />
        </div>

        {/* Right Panel - Live Preview */}
        <div className="w-96">
          <LivePreview files={files} />
        </div>
      </div>
    </div>
  );
}