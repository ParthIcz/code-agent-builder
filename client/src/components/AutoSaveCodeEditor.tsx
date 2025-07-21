import { useState, useEffect, useRef, useMemo } from "react";
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
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
} from "lucide-react";
import type { ProjectFile, FileTreeNode } from "@/types";
import { FileService, FileOperationResult } from "@/services/fileService";
import { toast } from "@/hooks/use-toast";

// VS Code syntax highlighting style (moved outside component to avoid re-creation)
const vsCodeHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#569cd6" },
  {
    tag: [
      tags.name,
      tags.deleted,
      tags.character,
      tags.propertyName,
      tags.macroName,
    ],
    color: "#9cdcfe",
  },
  {
    tag: [tags.function(tags.variableName), tags.labelName],
    color: "#dcdcaa",
  },
  {
    tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)],
    color: "#4fc1ff",
  },
  { tag: [tags.definition(tags.name), tags.separator], color: "#c586c0" },
  {
    tag: [
      tags.typeName,
      tags.className,
      tags.number,
      tags.changed,
      tags.annotation,
      tags.modifier,
      tags.self,
      tags.namespace,
    ],
    color: "#4ec9b0",
  },
  { tag: [tags.operator, tags.operatorKeyword], color: "#d4d4d4" },
  { tag: [tags.tagName], color: "#569cd6" },
  { tag: [tags.squareBracket], color: "#d4d4d4" },
  { tag: [tags.angleBracket], color: "#808080" },
  { tag: [tags.attributeName], color: "#9cdcfe" },
  { tag: [tags.regexp], color: "#d16969" },
  { tag: [tags.quote], color: "#ce9178" },
  { tag: [tags.string], color: "#ce9178" },
  { tag: tags.link, color: "#ce9178", textDecoration: "underline" },
  { tag: [tags.url, tags.escape, tags.special(tags.string)], color: "#d7ba7d" },
  { tag: [tags.meta], color: "#569cd6" },
  { tag: [tags.comment], color: "#6a9955", fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.heading, fontWeight: "bold", color: "#569cd6" },
  { tag: [tags.heading1, tags.heading2], fontSize: "1.4em" },
  { tag: [tags.heading3, tags.heading4], fontSize: "1.2em" },
  { tag: [tags.heading5, tags.heading6], fontSize: "1.1em" },
]);

// Get language extension based on file extension (moved outside component)
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

interface AutoSaveCodeEditorProps {
  files: Record<string, ProjectFile>;
  selectedFile: string;
  projectId?: string;
  onFileSelect: (filename: string) => void;
  onFileUpdate: (filename: string, content: string) => void;
}

export function AutoSaveCodeEditor({
  files,
  selectedFile,
  projectId,
  onFileSelect,
  onFileUpdate,
}: AutoSaveCodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["app", "components", "src"]),
  );
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<{
    [key: string]: 'saved' | 'saving' | 'unsaved' | 'error';
  }>({});

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

  // Enhanced editor extensions
  const extensions = useMemo(() => [
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
    syntaxHighlighting(vsCodeHighlightStyle),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
    ]),
    EditorView.lineWrapping,
    EditorView.theme({
      "&": {
        fontSize: "14px",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      },
      ".cm-content": {
        padding: "16px",
        minHeight: "0",
        flex: "1 1 auto",
      },
      ".cm-focused": {
        outline: "none",
      },
      ".cm-editor": {
        height: "100%",
        display: "flex",
        flexDirection: "column",
      },
      ".cm-scroller": {
        flex: "1 1 auto",
        overflow: "auto",
        scrollBehavior: "smooth",
        fontFamily: "inherit",
        minHeight: "0",
      },
      ".cm-line": {
        lineHeight: "1.6",
      },
      ".cm-editor.cm-focused": {
        outline: "none",
      },
      ".cm-gutters": {
        borderRight: "1px solid var(--border)",
        backgroundColor: "transparent",
        flexShrink: 0,
      },
    }),
    // Force scroll behavior
    EditorView.domEventHandlers({
      scroll: () => true,
    }),
    oneDark,
    ...getLanguageExtension(selectedFile),
  ], [selectedFile]);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current || !selectedFile || !files[selectedFile]) return;

    const selectedFileContent = files[selectedFile]?.content;

    // Auto-save functionality
    const handleContentChange = (content: string) => {
      // Update local state immediately
      onFileUpdate(selectedFile, content);

      // Set saving status
      setSaveStatus((prev) => ({
        ...prev,
        [selectedFile]: "saving",
      }));

      // Auto-save to server if projectId is available
      if (projectId) {
        FileService.autoSaveFile(
          projectId,
          selectedFile,
          content,
          () => {
            // On save start
            setSaveStatus((prev) => ({
              ...prev,
              [selectedFile]: "saving",
            }));
          },
          (result: FileOperationResult) => {
            // On save complete
            setSaveStatus((prev) => ({
              ...prev,
              [selectedFile]: result.success ? "saved" : "error",
            }));

            if (!result.success) {
              toast({
                title: "Save Error",
                description: result.error || "Failed to save file",
                variant: "destructive",
              });
            }
          }
        );
      } else {
        // No project ID, mark as unsaved
        setSaveStatus((prev) => ({
          ...prev,
          [selectedFile]: "unsaved",
        }));
      }
    };

    // Initialize editor only once
    if (!editorViewRef.current) {
      const state = EditorState.create({
        doc: selectedFileContent,
        extensions: [
          ...extensions,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const content = update.state.doc.toString();
              handleContentChange(content);
            }
          }),
        ],
      });

      const view = new EditorView({
        state,
        parent: editorRef.current,
      });

      editorViewRef.current = view;
    } else {
      const currentContent = editorViewRef.current.state.doc.toString();
      const newContent = selectedFileContent;

      if (currentContent !== newContent) {
        const transaction = editorViewRef.current.state.update({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: newContent,
          },
        });
        editorViewRef.current.dispatch(transaction);
      }
    }

    return () => {
      // Do not destroy the editor to preserve focus
      editorViewRef.current?.destroy();
      editorViewRef.current = null;
    };
  }, [selectedFile, files, extensions, onFileUpdate, projectId]);

  // Update editor content when file changes
  useEffect(() => {
    if (editorViewRef.current && selectedFile && files[selectedFile]) {
      const currentContent = editorViewRef.current.state.doc.toString();
      const newContent = files[selectedFile].content;

      if (currentContent !== newContent) {
        const transaction = editorViewRef.current.state.update({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: newContent,
          },
          selection: editorViewRef.current.state.selection, // Preserve cursor position
        });
        editorViewRef.current.dispatch(transaction);
      }
    }
  }, [files, selectedFile]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  const closeTab = (filename: string) => {
    setOpenTabs((prev) => {
      const filtered = prev.filter((f) => f !== filename);
      // If closing the active tab, switch to another tab
      if (filename === selectedFile && filtered.length > 0) {
        onFileSelect(filtered[filtered.length - 1]);
      }
      return filtered;
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "html":
      case "htm":
        return <FileText className="w-4 h-4 text-orange-500" />;
      case "css":
      case "scss":
      case "sass":
        return <Palette className="w-4 h-4 text-blue-500" />;
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return <Code className="w-4 h-4 text-yellow-500" />;
      case "json":
        return <Settings className="w-4 h-4 text-green-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSaveStatusIcon = (filename: string) => {
    const status = saveStatus[filename] || 'saved';
    switch (status) {
      case 'saving':
        return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />;
      case 'saved':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'unsaved':
        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
      default:
        return null;
    }
  };

  const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.fullPath}>
        <div
          className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer hover:bg-muted ${
            node.type === "file" && selectedFile === node.fullPath
              ? "bg-muted"
              : ""
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.fullPath);
            } else {
              onFileSelect(node.fullPath);
            }
          }}
        >
          {node.type === "folder" ? (
            <>
              {expandedFolders.has(node.fullPath) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              {expandedFolders.has(node.fullPath) ? (
                <FolderOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <Folder className="w-4 h-4 text-blue-500" />
              )}
            </>
          ) : (
            <>
              <div className="w-4" />
              {getFileIcon(node.name)}
            </>
          )}
          <span className="text-sm truncate flex-1">{node.name}</span>
          {node.type === "file" && getSaveStatusIcon(node.fullPath)}
        </div>
        {node.type === "folder" &&
          expandedFolders.has(node.fullPath) &&
          node.children &&
          renderFileTree(node.children, depth + 1)}
      </div>
    ));
  };

  const sidebar = (
    <div className="h-full flex flex-col bg-card">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold">Explorer</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">{renderFileTree(fileTree)}</div>
      </ScrollArea>
    </div>
  );

  return (
    <Card className="flex-1 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>

          <div className="flex items-center space-x-1">
            {openTabs.slice(0, 5).map((filename) => (
              <div
                key={filename}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs cursor-pointer ${
                  selectedFile === filename
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
                onClick={() => onFileSelect(filename)}
              >
                {getFileIcon(filename)}
                <span className="max-w-20 truncate">
                  {filename.split("/").pop()}
                </span>
                {getSaveStatusIcon(filename)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(filename);
                  }}
                >
                  <X className="w-3 h-3" />4
                </Button>
              </div>
            ))}
            {openTabs.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{openTabs.length - 5}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {projectId && (
            <Badge variant="outline" className="text-xs">
              Auto-save enabled
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {sidebarOpen && (
          <div className="w-64 border-r flex-shrink-0">{sidebar}</div>
        )}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 relative min-h-0">
            {selectedFile && files[selectedFile] ? (
              <div ref={editorRef} className="h-full w-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <File className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Select a file to start editing
                  </p>
                </div>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/50 text-xs flex-shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">
                  {selectedFile.split("/").pop()}
                </span>
                {projectId && (
                  <div className="flex items-center space-x-1">
                    {getSaveStatusIcon(selectedFile)}
                    <span className="text-muted-foreground">
                      {saveStatus[selectedFile] === 'saving' && 'Saving...'}
                      {saveStatus[selectedFile] === 'saved' && 'Saved'}
                      {saveStatus[selectedFile] === 'error' && 'Save failed'}
                      {saveStatus[selectedFile] === 'unsaved' && 'Unsaved changes'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>Lines: {files[selectedFile]?.content.split('\n').length}</span>
                <span>Characters: {files[selectedFile]?.content.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
