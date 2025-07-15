import { useState, useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  File, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  FileText,
  Code,
  Palette,
  Settings
} from 'lucide-react';
import type { ProjectFile, FileTreeNode } from '@/types';

interface CodeEditorProps {
  files: Record<string, ProjectFile>;
  selectedFile: string;
  onFileSelect: (filename: string) => void;
  onFileUpdate: (filename: string, content: string) => void;
}

export function CodeEditor({ files, selectedFile, onFileSelect, onFileUpdate }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['app', 'components']));
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);

  // Build file tree from files
  useEffect(() => {
    const tree: FileTreeNode[] = [];
    const folderMap = new Map<string, FileTreeNode>();

    // Sort files by path
    const sortedFiles = Object.keys(files).sort();

    sortedFiles.forEach(filepath => {
      const parts = filepath.split('/');
      let currentPath = '';
      
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (isLast) {
          // It's a file
          const extension = part.split('.').pop();
          const fileNode: FileTreeNode = {
            name: part,
            fullPath: filepath,
            type: 'file',
            extension
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
              type: 'folder',
              children: []
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

    const getLanguage = (filename: string) => {
      const ext = filename.split('.').pop();
      switch (ext) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
          return javascript({ jsx: true, typescript: ext === 'ts' || ext === 'tsx' });
        case 'html':
          return html();
        case 'css':
          return css();
        case 'json':
          return json();
        default:
          return javascript();
      }
    };

    const currentFile = files[selectedFile];
    if (!currentFile) return;

    const state = EditorState.create({
      doc: currentFile.content,
      extensions: [
        basicSetup,
        getLanguage(selectedFile),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onFileUpdate(selectedFile, update.state.doc.toString());
          }
        })
      ]
    });

    editorViewRef.current = new EditorView({
      state,
      parent: editorRef.current
    });

    return () => {
      editorViewRef.current?.destroy();
    };
  }, [selectedFile, files, onFileUpdate]);

  const getFileIcon = (extension?: string) => {
    switch (extension) {
      case 'tsx':
      case 'jsx':
      case 'ts':
      case 'js':
        return <Code className="h-4 w-4 text-blue-400" />;
      case 'css':
        return <Palette className="h-4 w-4 text-pink-400" />;
      case 'html':
        return <FileText className="h-4 w-4 text-orange-400" />;
      case 'json':
        return <Settings className="h-4 w-4 text-yellow-400" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
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
            className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-editor-hover transition-colors ${
              isSelected ? 'bg-editor-active border-r-2 border-primary' : ''
            }`}
            style={{ paddingLeft: `${paddingLeft + 8}px` }}
            onClick={() => {
              if (node.type === 'folder') {
                toggleFolder(node.fullPath);
              } else {
                onFileSelect(node.fullPath);
              }
            }}
          >
            {node.type === 'folder' ? (
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
            <span className="text-sm truncate">{node.name}</span>
            {node.type === 'file' && node.extension && (
              <Badge variant="outline" className="ml-auto text-xs">
                {node.extension}
              </Badge>
            )}
          </div>
          
          {node.type === 'folder' && isExpanded && node.children && (
            <div>{renderFileTree(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-full">
      {/* File Tree */}
      <div className="w-64 border-r border-border bg-editor-sidebar">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Files</h3>
        </div>
        <ScrollArea className="h-[calc(100%-57px)]">
          <div className="py-2">
            {renderFileTree(fileTree)}
          </div>
        </ScrollArea>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="p-3 border-b border-border bg-card/50">
          <div className="flex items-center gap-2">
            {selectedFile && (
              <>
                {getFileIcon(selectedFile.split('.').pop())}
                <span className="font-mono text-sm">{selectedFile}</span>
                <Badge variant="secondary" className="ml-auto">
                  {files[selectedFile]?.type || 'file'}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 relative">
          {selectedFile ? (
            <div 
              ref={editorRef} 
              className="h-full w-full bg-editor-background"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Card className="p-8 text-center">
                <CardContent>
                  <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No file selected</h3>
                  <p className="text-muted-foreground">
                    Select a file from the tree to start editing
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}