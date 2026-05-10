"use client"

import { useState, useEffect, useCallback } from 'react';
import { X, Folder, Image, Video, File, ChevronRight, ChevronLeft, RefreshCw, Upload, Check } from 'lucide-react';

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
};

type Breadcrumb = {
  id?: string;
  name: string;
};

type DriveBrowserProps = {
  projectId: string;
  onClose: () => void;
  onFileImported: (url: string, kind: 'image' | 'video', filename: string) => void;
};

export function DriveBrowser({ projectId, onClose, onFileImported }: DriveBrowserProps) {
  const [folders, setFolders] = useState<DriveFile[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ name: 'My Drive' }]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const fetchContent = useCallback(async (folderId?: string) => {
    setLoading(true);
    setError('');
    try {
      const url = folderId ? `/api/drive/browse?folderId=${folderId}` : '/api/drive/browse';
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load');
      }
      const data = await res.json();
      setFolders(data.folders || []);
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const navigateToFolder = async (folder: DriveFile) => {
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
    await fetchContent(folder.id);
  };

  const navigateBack = async () => {
    if (breadcrumbs.length <= 1) return;
    const newBreadcrumbs = breadcrumbs.slice(0, -1);
    setBreadcrumbs(newBreadcrumbs);
    const targetId = newBreadcrumbs[newBreadcrumbs.length - 1].id;
    setCurrentFolderId(targetId);
    await fetchContent(targetId);
  };

  const navigateToBreadcrumb = async (index: number) => {
    const target = breadcrumbs[index];
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setCurrentFolderId(target.id);
    await fetchContent(target.id);
  };

  const isImage = (mime: string) => mime.startsWith('image/');
  const isVideo = (mime: string) => mime.startsWith('video/');

  const importFile = async () => {
    if (!selectedFile) return;
    setImporting(true);
    setError('');

    try {
      const res = await fetch(`/api/drive/download?fileId=${selectedFile.id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Download failed');
      }

      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer]);
      const filename = selectedFile.name;
      const mimeType = selectedFile.mimeType;

      const uploadRes = await fetch('/api/admin/upload/media', {
        method: 'POST',
        headers: {
          'x-project-id': projectId,
          'x-file-name': filename,
          'x-file-type': mimeType,
          'content-length': String(buffer.byteLength),
        },
        body: blob,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || 'Upload failed');
      }

      const uploadData = await uploadRes.json();
      const kind = isImage(mimeType) ? 'image' : 'video';
      setImported(true);
      onFileImported(uploadData.files[0].url, kind, filename);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X size={18} className="text-white/60" />
            </button>
            <h2 className="text-xs tracking-widest text-white font-headline">GOOGLE DRIVE</h2>
          </div>
          <button
            onClick={() => fetchContent(currentFolderId)}
            className="p-1 hover:bg-white/10 rounded"
            disabled={loading}
          >
            <RefreshCw size={16} className={`text-white/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 text-xs">
          <button
            onClick={navigateBack}
            disabled={breadcrumbs.length <= 1}
            className="p-1 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded"
          >
            <ChevronLeft size={14} className="text-white/60" />
          </button>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <span className="text-white/30 mx-1">/</span>}
              <button
                onClick={() => navigateToBreadcrumb(i)}
                className={`hover:text-[#DFFF00] ${i === breadcrumbs.length - 1 ? 'text-white' : 'text-white/50'}`}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>

        <div className="flex-1 overflow-auto px-4 py-2">
          {loading ? (
            <div className="flex items-center justify-center h-full text-white/40 text-xs">
              LOADING...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-red-400 text-xs">{error}</p>
              <button
                onClick={() => fetchContent(currentFolderId)}
                className="px-4 py-2 border border-white/20 text-xs hover:border-[#DFFF00]"
              >
                RETRY
              </button>
            </div>
          ) : (
            <>
              {folders.length === 0 && files.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/30 text-xs">
                  NO FILES FOUND
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => navigateToFolder(folder)}
                      className="flex items-center gap-2 p-3 border border-white/10 hover:border-[#DFFF00]/50 text-left"
                    >
                      <Folder size={16} className="text-[#DFFF00] shrink-0" />
                      <span className="text-xs text-white/80 truncate">{folder.name}</span>
                    </button>
                  ))}
                  {files.map(file => {
                    const isImg = isImage(file.mimeType);
                    const isVid = isVideo(file.mimeType);
                    const isSelected = selectedFile?.id === file.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={`flex flex-col items-start gap-2 p-3 border text-left transition-colors ${
                          isSelected ? 'border-[#DFFF00] bg-[#DFFF00]/10' : 'border-white/10 hover:border-white/30'
                        } ${!isImg && !isVid ? 'opacity-50' : ''}`}
                        disabled={!isImg && !isVid}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {isImg && <Image size={16} className="text-white/60 shrink-0" />}
                          {isVid && <Video size={16} className="text-white/60 shrink-0" />}
                          {!isImg && !isVid && <File size={16} className="text-white/40 shrink-0" />}
                          <span className="text-xs text-white/80 truncate flex-1">{file.name}</span>
                        </div>
                        {isImg || isVid ? (
                          <span className="text-[10px] text-[#DFFF00]">READY TO IMPORT</span>
                        ) : (
                          <span className="text-[10px] text-white/30">NOT SUPPORTED</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              {isImage(selectedFile.mimeType) ? (
                <Image size={14} className="text-[#DFFF00]" />
              ) : (
                <Video size={14} className="text-[#DFFF00]" />
              )}
              <span className="text-xs text-white/80">{selectedFile.name}</span>
            </div>
            <button
              onClick={importFile}
              disabled={importing || imported}
              className="flex items-center gap-2 px-4 py-2 bg-[#DFFF00] text-black text-xs font-headline disabled:opacity-50"
            >
              {imported ? (
                <>
                  <Check size={14} />
                  IMPORTED
                </>
              ) : importing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  IMPORTING...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  IMPORT FILE
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
