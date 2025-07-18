import JSZip from 'jszip';
import type { ProjectFile } from '@/types';

export async function downloadProjectAsZip(files: Record<string, ProjectFile>) {
  const zip = new JSZip();
  
  // Add each file to the zip
  Object.entries(files).forEach(([filename, file]) => {
    zip.file(filename, file.content);
  });
  
  // Generate the zip file
  const content = await zip.generateAsync({ type: 'blob' });
  
  // Create download link
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}