export interface ProjectFile {
  content: string;
  type: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
}

export interface FileTreeNode {
  name: string;
  fullPath: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  extension?: string;
}