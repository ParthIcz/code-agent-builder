import { useState, useEffect, useRef } from "react";
import {
  EditorView,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  dropCursor,
  rectangularSelection,
  keymap,
} from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import {
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap } from "@codemirror/search";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { HighlightStyle, syntaxHighlighting } from "@lezer/highlight";
import { tags } from "@lezer/highlight";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
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
  X,
  Plus,
  MoreHorizontal,
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
    new Set(["app", "components", "src"]),
  );
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openTabs, setOpenTabs] = useState<string[]>([]);

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

  // Add file to tabs when selected
  useEffect(() => {
    if (selectedFile && !openTabs.includes(selectedFile)) {
      setOpenTabs((prev) => [...prev, selectedFile]);
    }
  }, [selectedFile, openTabs]);

  // Get language extension based on file extension
  const getLanguageExtension = (filename: string): Extension[] => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
      case "mjs":
        return [javascript({ jsx: ext === "jsx" })];
      case "ts":
      case "tsx":
        return [javascript({ jsx: ext === "tsx", typescript: true })];
      case "html":
      case "htm":
        return [html()];
      case "css":
      case "scss":
      case "sass":
        return [css()];
      case "json":
        return [json()];
      default:
        return [];
    }
  };

  // VS Code-like theme
  const vsCodeTheme = EditorView.theme(
    {
      "&": {
        color: "#d4d4d4",
        backgroundColor: "#1e1e1e",
        fontSize: "14px",
        fontFamily:
          "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Mono', 'Roboto Mono', Consolas, 'Courier New', monospace",
      },
      ".cm-content": {
        padding: "0",
        minHeight: "100%",
        caretColor: "#d4d4d4",
      },
      ".cm-focused": {
        outline: "none",
      },
      ".cm-editor": {
        height: "100%",
      },
      ".cm-scroller": {
        fontFamily: "inherit",
        lineHeight: "1.6",
      },
      ".cm-gutters": {
        backgroundColor: "#1e1e1e",
        color: "#858585",
        border: "none",
        paddingLeft: "8px",
        paddingRight: "8px",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        padding: "0 8px 0 0",
        minWidth: "40px",
        textAlign: "right",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "#2a2a2a",
        color: "#d4d4d4",
      },
      ".cm-activeLine": {
        backgroundColor: "#2a2a2a",
      },
      ".cm-line": {
        padding: "0 16px",
      },
      ".cm-selectionBackground, ::selection": {
        backgroundColor: "#264f78",
      },
      ".cm-focused .cm-selectionBackground": {
        backgroundColor: "#264f78",
      },
      ".cm-searchMatch": {
        backgroundColor: "#515c6a",
        outline: "1px solid #457dff",
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "#6199ff",
      },
      ".cm-foldPlaceholder": {
        backgroundColor: "#2a2a2a",
        border: "1px solid #515151",
        color: "#d4d4d4",
      },
      ".cm-tooltip": {
        backgroundColor: "#252526",
        border: "1px solid #454545",
      },
      ".cm-tooltip-autocomplete": {
        backgroundColor: "#252526",
        border: "1px solid #454545",
      },
      ".cm-completionLabel": {
        color: "#d4d4d4",
      },
      ".cm-completionDetail": {
        color: "#9d9d9d",
      },
      // Syntax highlighting colors (VS Code style)
      ".cm-keyword": {
        color: "#569cd6", // VS Code blue for keywords
      },
      ".cm-string, .cm-string2": {
        color: "#ce9178", // VS Code orange for strings
      },
      ".cm-comment": {
        color: "#6a9955", // VS Code green for comments
        fontStyle: "italic",
      },
      ".cm-number": {
        color: "#b5cea8", // VS Code light green for numbers
      },
      ".cm-operator": {
        color: "#d4d4d4", // Default text color for operators
      },
      ".cm-punctuation": {
        color: "#d4d4d4", // Default text color for punctuation
      },
      ".cm-bracket": {
        color: "#ffd700", // Gold for brackets
      },
      ".cm-tag": {
        color: "#569cd6", // Blue for HTML tags
      },
      ".cm-attribute": {
        color: "#9cdcfe", // Light blue for attributes
      },
      ".cm-property": {
        color: "#9cdcfe", // Light blue for CSS properties
      },
      ".cm-function, .cm-method": {
        color: "#dcdcaa", // Yellow for functions
      },
      ".cm-variable": {
        color: "#9cdcfe", // Light blue for variables
      },
      ".cm-variableName": {
        color: "#9cdcfe", // Light blue for variable names
      },
      ".cm-type, .cm-typeName": {
        color: "#4ec9b0", // Teal for types
      },
      ".cm-className": {
        color: "#4ec9b0", // Teal for class names
      },
      ".cm-constant": {
        color: "#569cd6", // Blue for constants
      },
      ".cm-definition": {
        color: "#dcdcaa", // Yellow for definitions
      },
      ".cm-regexp": {
        color: "#d16969", // Red for regex
      },
      ".cm-escape": {
        color: "#d7ba7d", // Light yellow for escape characters
      },
      ".cm-meta": {
        color: "#569cd6", // Blue for meta
      },
      ".cm-qualifier": {
        color: "#d4d4d4", // Default for qualifiers
      },
      ".cm-builtin": {
        color: "#569cd6", // Blue for built-ins
      },
      ".cm-bracket": {
        color: "#d4d4d4", // Default for brackets
      },
      ".cm-atom": {
        color: "#569cd6", // Blue for atoms
      },
      ".cm-unit": {
        color: "#b5cea8", // Light green for units
      },
    },
    { dark: true },
  );

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorRef.current) return;

    const currentFile = files[selectedFile];
    if (!currentFile) return;

    // Destroy previous editor instance
    if (editorViewRef.current) {
      editorViewRef.current.destroy();
    }

    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
      ]),
      vsCodeTheme,
      ...getLanguageExtension(selectedFile),
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
        return (
          <div className="h-4 w-4 bg-blue-400 rounded-sm flex items-center justify-center text-white text-xs font-bold">
            R
          </div>
        );
      case "ts":
        return (
          <div className="h-4 w-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
            T
          </div>
        );
      case "js":
        return (
          <div className="h-4 w-4 bg-yellow-400 rounded-sm flex items-center justify-center text-black text-xs font-bold">
            J
          </div>
        );
      case "css":
        return (
          <div className="h-4 w-4 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
            C
          </div>
        );
      case "html":
        return (
          <div className="h-4 w-4 bg-orange-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
            H
          </div>
        );
      case "json":
        return (
          <div className="h-4 w-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
            J
          </div>
        );
      case "md":
        return (
          <div className="h-4 w-4 bg-gray-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
            M
          </div>
        );
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

  const closeTab = (filepath: string) => {
    setOpenTabs((prev) => {
      const newTabs = prev.filter((tab) => tab !== filepath);
      // If closing the active tab, switch to another tab
      if (filepath === selectedFile && newTabs.length > 0) {
        onFileSelect(newTabs[newTabs.length - 1]);
      }
      return newTabs;
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
            className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-[#2a2a2a] transition-colors text-sm ${
              isSelected ? "bg-[#37373d] border-l-2 border-[#007acc]" : ""
            }`}
            style={{ paddingLeft: `${paddingLeft + 8}px` }}
            onClick={() => {
              if (node.type === "folder") {
                toggleFolder(node.fullPath);
              } else {
                onFileSelect(node.fullPath);
                setSidebarOpen(false);
              }
            }}
          >
            {node.type === "folder" ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-[#cccccc]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#cccccc]" />
                )}
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-[#dcb67a]" />
                ) : (
                  <Folder className="h-4 w-4 text-[#dcb67a]" />
                )}
              </>
            ) : (
              <>
                <div className="w-4" />
                {getFileIcon(node.extension)}
              </>
            )}
            <span className="text-[#cccccc] truncate flex-1">{node.name}</span>
          </div>

          {node.type === "folder" && isExpanded && node.children && (
            <div>{renderFileTree(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  const FileTreeContent = () => (
    <div className="h-full bg-[#252526] text-[#cccccc]">
      <div className="p-3 border-b border-[#3e3e42] bg-[#2d2d30]">
        <h3 className="font-medium text-sm text-[#cccccc] uppercase tracking-wide">
          Explorer
        </h3>
      </div>
      <ScrollArea className="h-[calc(100%-57px)]">
        <div className="py-2">{renderFileTree(fileTree)}</div>
      </ScrollArea>
    </div>
  );

  return (
    <div
      className={`flex h-full ${isFullscreen ? "fixed inset-0 z-50 bg-[#1e1e1e]" : ""}`}
    >
      {/* Desktop File Tree */}
      <div className="hidden lg:block w-64 border-r border-[#3e3e42]">
        <FileTreeContent />
      </div>

      {/* Mobile File Tree */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 lg:hidden bg-[#252526]">
          <SheetTitle className="sr-only">File Explorer</SheetTitle>
          <FileTreeContent />
        </SheetContent>
      </Sheet>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        {/* Editor Header with Tabs */}
        <div className="flex-shrink-0 bg-[#2d2d30] border-b border-[#3e3e42]">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 text-[#cccccc] hover:bg-[#3e3e42]"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>

              {/* Tabs */}
              <div className="flex items-center">
                {openTabs.map((filepath) => (
                  <div
                    key={filepath}
                    className={`flex items-center gap-2 px-3 py-2 border-r border-[#3e3e42] cursor-pointer text-sm min-w-0 max-w-48 ${
                      filepath === selectedFile
                        ? "bg-[#1e1e1e] text-[#ffffff] border-t-2 border-t-[#007acc]"
                        : "bg-[#2d2d30] text-[#969696] hover:text-[#cccccc]"
                    }`}
                    onClick={() => onFileSelect(filepath)}
                  >
                    {getFileIcon(filepath.split(".").pop())}
                    <span className="truncate text-xs">
                      {filepath.split("/").pop()}
                    </span>
                    <button
                      className="ml-1 hover:bg-[#3e3e42] rounded p-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(filepath);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Fullscreen toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#cccccc] hover:bg-[#3e3e42]"
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
        </div>

        {/* Editor Content */}
        <div className="flex-1 relative min-h-0">
          {selectedFile ? (
            <div
              ref={editorRef}
              className="h-full w-full bg-[#1e1e1e] overflow-hidden"
            />
          ) : (
            <div className="h-full flex items-center justify-center p-4 bg-[#1e1e1e]">
              <Card className="max-w-md w-full bg-[#252526] border-[#3e3e42]">
                <CardContent className="p-6 text-center">
                  <Code className="h-12 w-12 mx-auto mb-4 text-[#cccccc]" />
                  <h3 className="text-lg font-semibold mb-2 text-[#cccccc]">
                    No file selected
                  </h3>
                  <p className="text-[#969696] text-sm mb-4">
                    Select a file from the explorer to start editing
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden bg-[#0e639c] border-[#0e639c] text-white hover:bg-[#1177bb]"
                  >
                    <Menu className="h-4 w-4 mr-2" />
                    Open Explorer
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
