import { useState, useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  File,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Code,
  Palette,
  Settings,
  Menu,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { ProjectFile, FileTreeNode } from "@/types";

interface CodeEditorProps {
  files: Record<string, ProjectFile>;
  selectedFile: string;
  onFileSelect: (filename: string) => void;
  onFileUpdate: (filename: string, content: string) => void;
}

export function CodeEditor({
  files,
  selectedFile,
  onFileSelect,
  onFileUpdate,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["app", "components"]),
  );
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Build file tree from files
  useEffect(() => {
    const tree: FileTreeNode[] = [];
    const folderMap = new Map<string, FileTreeNode>();

    // Sort files by path
    const sortedFiles = Object.keys(files).sort();

    sortedFiles.forEach((filepath) => {
      const parts = filepath.split("/");
      let currentPath = "";

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (isLast) {
          // It's a file
          const extension = part.split(".").pop();
          const fileNode: FileTreeNode = {
            name: part,
            fullPath: filepath,
            type: "file",
            extension,
          };

          if (parentPath) {
            const parent = folderMap.get(parentPath);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(fileNode);
            }
          } else {
            tree.push(fileNode);
          }
        } else {
          // It's a folder
          if (!folderMap.has(currentPath)) {
            const folderNode: FileTreeNode = {
              name: part,
              fullPath: currentPath,
              type: "folder",
              children: [],
            };

            folderMap.set(currentPath, folderNode);

            if (parentPath) {
              const parent = folderMap.get(parentPath);
              if (parent) {
                parent.children = parent.children || [];
                parent.children.push(folderNode);
              }
            } else {
              tree.push(folderNode);
            }
          }
        }
      });
    });

    setFileTree(tree);
  }, [files]);

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorRef.current) return;

    const currentFile = files[selectedFile];
    if (!currentFile) return;

    // Create minimal extensions array
    const extensions = [
      EditorView.theme({
        "&": {
          fontSize: "14px",
          height: "100%",
          backgroundColor: "hsl(var(--editor-background))",
        },
        ".cm-content": {
          padding: "16px",
          minHeight: "100%",
          color: "hsl(var(--foreground))",
        },
        ".cm-focused": {
          outline: "none",
        },
        ".cm-editor": {
          height: "100%",
        },
        ".cm-scroller": {
          fontFamily:
            "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace",
        },
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onFileUpdate(selectedFile, update.state.doc.toString());
        }
      }),
    ];

    const state = EditorState.create({
      doc: currentFile.content,
      extensions,
    });

    editorViewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => {
      editorViewRef.current?.destroy();
    };
  }, [selectedFile, files, onFileUpdate]);

  const getFileIcon = (extension?: string) => {
    switch (extension) {
      case "tsx":
      case "jsx":
      case "ts":
      case "js":
        return <Code className="h-4 w-4 text-blue-400" />;
      case "css":
        return <Palette className="h-4 w-4 text-pink-400" />;
      case "html":
        return <FileText className="h-4 w-4 text-orange-400" />;
      case "json":
        return <Settings className="h-4 w-4 text-yellow-400" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.fullPath);
      const isSelected = selectedFile === node.fullPath;
      const paddingLeft = depth * 16;

      return (
        <div key={node.fullPath}>
          <div
            className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-editor-hover transition-colors ${
              isSelected ? "bg-editor-active border-r-2 border-primary" : ""
            }`}
            style={{ paddingLeft: `${paddingLeft + 8}px` }}
            onClick={() => {
              if (node.type === "folder") {
                toggleFolder(node.fullPath);
              } else {
                onFileSelect(node.fullPath);
                setSidebarOpen(false); // Close mobile sidebar after selection
              }
            }}
          >
            {node.type === "folder" ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-primary" />
                ) : (
                  <Folder className="h-4 w-4 text-primary" />
                )}
              </>
            ) : (
              <>
                <div className="w-4" />
                {getFileIcon(node.extension)}
              </>
            )}
            <span className="text-sm truncate flex-1">{node.name}</span>
            {node.type === "file" && node.extension && (
              <Badge variant="outline" className="text-xs ml-2">
                {node.extension}
              </Badge>
            )}
          </div>

          {node.type === "folder" && isExpanded && node.children && (
            <div>{renderFileTree(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  const FileTreeContent = () => (
    <div className="h-full bg-editor-sidebar">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm">Files</h3>
      </div>
      <ScrollArea className="h-[calc(100%-57px)]">
        <div className="py-2">{renderFileTree(fileTree)}</div>
      </ScrollArea>
    </div>
  );

  return (
    <div
      className={`flex h-full ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}
    >
      {/* Desktop File Tree */}
      <div className="hidden lg:block w-64 border-r border-border">
        <FileTreeContent />
      </div>

      {/* Mobile File Tree */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 lg:hidden">
          <FileTreeContent />
        </SheetContent>
      </Sheet>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Header */}
        <div className="p-2 sm:p-3 border-b border-border bg-card/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            {selectedFile && (
              <>
                {getFileIcon(selectedFile.split(".").pop())}
                <span className="font-mono text-sm truncate flex-1 min-w-0">
                  {selectedFile}
                </span>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {files[selectedFile]?.type || "file"}
                </Badge>
              </>
            )}

            {/* Fullscreen toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden sm:flex"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 relative min-h-0">
          {selectedFile ? (
            <div
              ref={editorRef}
              className="h-full w-full bg-editor-background overflow-hidden"
            />
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              <Card className="max-w-md w-full">
                <CardContent className="p-6 sm:p-8 text-center">
                  <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No file selected
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Select a file from the tree to start editing
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden"
                  >
                    <Menu className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
