const API_BASE_URL = 'http://localhost:8081';

export interface FileOperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class FileService {
  private static autoSaveTimeouts = new Map<string, NodeJS.Timeout>();
  private static autoSaveDelay = 500; // 500ms delay for auto-save

  /**
   * Save a single file to the server
   */
  static async saveFile(
    projectId: string, 
    filePath: string, 
    content: string
  ): Promise<FileOperationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/save-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          filePath,
          content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save file');
      }

      return result;
    } catch (error) {
      console.error('Error saving file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Auto-save a file with debouncing to prevent excessive API calls
   */
  static autoSaveFile(
    projectId: string,
    filePath: string,
    content: string,
    onSaveStart?: () => void,
    onSaveComplete?: (result: FileOperationResult) => void
  ): void {
    const key = `${projectId}:${filePath}`;

    // Clear existing timeout for this file
    const existingTimeout = this.autoSaveTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      onSaveStart?.();
      
      const result = await this.saveFile(projectId, filePath, content);
      
      onSaveComplete?.(result);
      
      // Remove timeout from map
      this.autoSaveTimeouts.delete(key);
    }, this.autoSaveDelay);

    this.autoSaveTimeouts.set(key, timeout);
  }

  /**
   * Create a new project with multiple files
   */
  static async createProject(
    projectId: string,
    files: Record<string, { content: string; type: string }>
  ): Promise<FileOperationResult & { previewUrl?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/create-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          files,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project');
      }

      return result;
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Clear all pending auto-save operations
   */
  static clearAllAutoSave(): void {
    this.autoSaveTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.autoSaveTimeouts.clear();
  }

  /**
   * Generate a unique project ID
   */
  static generateProjectId(): string {
    return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate preview URL for a project
   */
  static getPreviewUrl(projectId: string): string {
    return `${API_BASE_URL}/user-projects/${projectId}/index.html`;
  }
}
