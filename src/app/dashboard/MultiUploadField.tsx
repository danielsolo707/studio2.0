"use client"

import { useCallback, useMemo, useRef, useState } from 'react';

type QueueItem = {
  file: File;
  id: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
};

export function MultiUploadField({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next = Array.from(files).map((file) => ({
      file,
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
      progress: 0,
      status: 'idle' as const,
    }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  const uploadItem = useCallback(async (item: QueueItem) => {
    setItems((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 0, message: '' } : q)),
    );

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/admin/upload/media', true);
      xhr.responseType = 'json';
      xhr.setRequestHeader('x-project-id', projectId);
      xhr.setRequestHeader('x-file-name', item.file.name);
      xhr.setRequestHeader('x-file-type', item.file.type || 'application/octet-stream');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setItems((prev) => prev.map((q) => (q.id === item.id ? { ...q, progress: pct } : q)));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setItems((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, status: 'success', progress: 100, message: 'Uploaded' } : q,
            ),
          );
          setTimeout(() => window.location.reload(), 400);
        } else {
          const message =
            (xhr.response && xhr.response.error) ||
            xhr.statusText ||
            `Upload failed (${xhr.status})`;
          setItems((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, status: 'error', message } : q,
            ),
          );
        }
        resolve();
      };

      xhr.onerror = () => {
        setItems((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: 'error', message: 'Network error' } : q,
          ),
        );
        resolve();
      };

      xhr.send(item.file);
    });
  }, [projectId]);

  const startUpload = useCallback(() => {
    items.filter((i) => i.status === 'idle').forEach((i) => uploadItem(i));
  }, [items, uploadItem]);

  const accept = useMemo(() => 'image/*,video/*', []);

  return (
    <div className="w-full max-w-xl border border-white/10 p-3 rounded-md">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="text-xs"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-3 py-2 border border-white/30 text-xs tracking-widest"
        >
          CHOOSE FILES
        </button>
        <button
          type="button"
          onClick={startUpload}
          disabled={items.every((i) => i.status !== 'idle')}
          className="px-3 py-2 bg-[#DFFF00] text-black text-xs tracking-widest disabled:opacity-40"
        >
          UPLOAD MEDIA
        </button>
      </div>

      {items.length > 0 ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="border border-white/10 px-2 py-1 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] truncate">{item.file.name}</p>
                <p className="text-[10px] text-white/40">
                  {(item.file.size / 1024 / 1024).toFixed(1)}MB • {item.file.type || 'unknown'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1 bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#DFFF00]"
                    style={{ width: `${item.progress}%`, transition: 'width 0.1s linear' }}
                  />
                </div>
                <span className="text-[11px]">
                  {item.status === 'uploading' ? `${item.progress}%` : item.status === 'success' ? '✓' : item.status === 'error' ? 'ERR' : ''}
                </span>
              </div>
              {item.message ? (
                <p className={`text-[10px] ${item.status === 'error' ? 'text-red-400' : 'text-[#DFFF00]'}`}>
                  {item.message}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
