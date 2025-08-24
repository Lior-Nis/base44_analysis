import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, File, Image as ImageIcon, X } from 'lucide-react';

export default function DownloadManager({ isOpen, onClose, project }) {

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    // Main HTML
    downloadFile(project.generated_html, 'index.html', 'text/html');
    // CSS
    if (project.generated_css) {
      downloadFile(project.generated_css, 'style.css', 'text/css');
    }
    // JS
    if (project.generated_js) {
      downloadFile(project.generated_js, 'script.js', 'text/javascript');
    }
    // Additional Pages
    (project.pages || []).forEach(page => {
      downloadFile(page.html, `${page.slug}.html`, 'text/html');
    });
    // For images, we can't easily zip them on the frontend, so we instruct the user.
    // In a real app, a backend would handle zipping.
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Your Website
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Download the files for your website. For a complete package, a backend would zip these files. Here you can download them individually.
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <span className="flex items-center gap-2"><File className="w-4 h-4"/> index.html</span>
              <Button size="sm" variant="ghost" onClick={() => downloadFile(project.generated_html, 'index.html', 'text/html')}><Download className="w-4 h-4"/></Button>
            </div>
            {(project.pages || []).map(page => (
              <div key={page.slug} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <span className="flex items-center gap-2"><File className="w-4 h-4"/> {page.slug}.html</span>
                <Button size="sm" variant="ghost" onClick={() => downloadFile(page.html, `${page.slug}.html`, 'text/html')}><Download className="w-4 h-4"/></Button>
              </div>
            ))}
            {(project.images || []).length > 0 && (
              <div className="pt-4 space-y-2">
                <h4 className="font-medium flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Image Assets</h4>
                <p className="text-xs text-gray-500">Right-click and "Save Image As..." to download images.</p>
                <div className="grid grid-cols-4 gap-2">
                  {(project.images || []).map(img => (
                    <a key={img.url} href={img.url} target="_blank" rel="noreferrer"><img src={img.url} className="rounded-md" alt={img.prompt}/></a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}><X className="w-4 h-4 mr-2"/>Close</Button>
          <Button onClick={handleDownloadAll} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="w-4 h-4 mr-2"/>Download All Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}