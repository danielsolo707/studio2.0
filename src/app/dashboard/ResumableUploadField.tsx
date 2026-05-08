"use client"

import { useCallback, useRef, useState } from 'react';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

type UploadItem = {
  file: File;
  id: string;
  uploadId: string | null;
  progress: number;
  status: 'idle' | 'uploading' | 'paused' | 'success' | 'error';
  message?: string;
  completedChunks: number;
  totalChunks: number;
};

function getFingerprint(file: File): string {
  return `upload-${file.name}-${file.size}-${file.lastModified}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)}GB`;
}

function uploadChunk(
  uploadId: string,
  chunkIndex: number,
  blob: Blob,
  signal: AbortSignal,
  onProgress: (loaded: number) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', '/api/admin/upload/chunk', true);
    xhr.setRequestHeader('x-upload-id', uploadId);
    xhr.setRequestHeader('x-chunk-index', String(chunkIndex));

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded);
    };

    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.onabort = () => resolve(false);

    signal.addEventListener('abort', () => xhr.abort());
    xhr.send(blob);
  });
}

export function ResumableUploadField({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<Map<string, AbortController>>(new Map());

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next = Array.from(files).map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Math.random().toString(16).slice(2)}`,
      uploadId: null,
      progress: 0,
      status: 'idle' as const,
      message: undefined,
      completedChunks: 0,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
    }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  const doUpload = useCallback(
    async (item: UploadItem) => {
      const controller = new AbortController();
      abortRef.current.set(item.id, controller);

      setItems((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: 'uploading', message: undefined } : q,
        ),
      );

      try {
        let uploadId = item.uploadId;
        let startChunk = 0;

        // Check localStorage for a previous upload of same file
        if (!uploadId) {
          const fp = getFingerprint(item.file);
          const stored = localStorage.getItem(fp);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const statusRes = await fetch(
                `/api/admin/upload/status?uploadId=${parsed.uploadId}`,
              );
              if (statusRes.ok) {
                const statusData = await statusRes.json();
                uploadId = parsed.uploadId;
                startChunk = statusData.completedChunks.length;
              }
            } catch {
              // Previous upload invalid, start fresh
            }
          }
        }

        // Initialize new upload session if needed
        if (!uploadId) {
          const initRes = await fetch('/api/admin/upload/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: item.file.name,
              fileSize: item.file.size,
              fileType: item.file.type || 'application/octet-stream',
              projectId,
              chunkSize: CHUNK_SIZE,
            }),
          });
          if (!initRes.ok) throw new Error('Failed to initialize upload');
          const initData = await initRes.json();
          uploadId = initData.uploadId as string;

          const fp = getFingerprint(item.file);
          localStorage.setItem(fp, JSON.stringify({ uploadId }));
        }

        setItems((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, uploadId } : q)),
        );

        const totalChunks = Math.ceil(item.file.size / CHUNK_SIZE);

        // Upload chunks
        for (let i = startChunk; i < totalChunks; i++) {
          if (controller.signal.aborted) return;

          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, item.file.size);
          const blob = item.file.slice(start, end);

          let success = false;
          let retries = 0;
          while (!success && retries < 3) {
            if (controller.signal.aborted) return;
            success = await uploadChunk(
              uploadId!,
              i,
              blob,
              controller.signal,
              (loaded) => {
                const totalLoaded = i * CHUNK_SIZE + loaded;
                const pct = Math.round((totalLoaded / item.file.size) * 100);
                setItems((prev) =>
                  prev.map((q) =>
                    q.id === item.id ? { ...q, progress: Math.min(pct, 99), completedChunks: i } : q,
                  ),
                );
              },
            );
            if (!success) {
              retries++;
              if (retries < 3) {
                await new Promise((r) => setTimeout(r, 1000 * retries));
              }
            }
          }

          if (!success) {
            setItems((prev) =>
              prev.map((q) =>
                q.id === item.id
                  ? {
                      ...q,
                      status: 'paused',
                      message: `Failed at chunk ${i + 1}/${totalChunks}. Click RESUME to retry.`,
                    }
                  : q,
              ),
            );
            return;
          }
        }

        // Complete upload
        const completeRes = await fetch('/api/admin/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadId }),
        });

        if (!completeRes.ok) {
          const err = await completeRes.json().catch(() => ({ error: 'Complete failed' }));
          throw new Error(err.error || 'Failed to finalize upload');
        }

        const fp = getFingerprint(item.file);
        localStorage.removeItem(fp);

        setItems((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'success', progress: 100, message: 'Uploaded' }
              : q,
          ),
        );
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        if (!controller.signal.aborted) {
          setItems((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? {
                    ...q,
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Upload failed',
                  }
                : q,
            ),
          );
        }
      } finally {
        abortRef.current.delete(item.id);
      }
    },
    [projectId],
  );

  const startUpload = useCallback(() => {
    items
      .filter((i) => i.status === 'idle' || i.status === 'paused')
      .forEach((i) => doUpload(i));
  }, [items, doUpload]);

  const cancelItem = useCallback((itemId: string) => {
    const controller = abortRef.current.get(itemId);
    if (controller) controller.abort();
    setItems((prev) => prev.filter((q) => q.id !== itemId));
  }, []);

  const hasActionable = items.some((i) => i.status === 'idle' || i.status === 'paused');
  const hasPaused = items.some((i) => i.status === 'paused');

  return (
    <div className="w-full max-w-xl border border-white/10 p-3 rounded-md">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (e.target) e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-3 py-2 border border-white/30 text-xs tracking-widest hover:bg-white/5 transition-colors"
        >
          CHOOSE FILES
        </button>
        <button
          type="button"
          onClick={startUpload}
          disabled={!hasActionable}
          className="px-3 py-2 bg-[#DFFF00] text-black text-xs tracking-widest disabled:opacity-40"
        >
          {hasPaused ? 'RESUME' : 'UPLOAD MEDIA'}
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-white/10 px-2 py-1 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] truncate">{item.file.name}</p>
                <p className="text-[10px] text-white/40">
                  {formatSize(item.file.size)}
                  {item.totalChunks > 1 ? ` \u2022 ${item.totalChunks} chunks` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1 bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#DFFF00]"
                    style={{
                      width: `${item.progress}%`,
                      transition: 'width 0.15s linear',
                    }}
                  />
                </div>
                <span className="text-[11px] w-10 text-right">
                  {item.status === 'uploading'
                    ? `${item.progress}%`
                    : item.status === 'success'
                      ? '\u2713'
                      : item.status === 'paused'
                        ? '\u23F8'
                        : item.status === 'error'
                          ? 'ERR'
                          : ''}
                </span>
                {(item.status === 'uploading' ||
                  item.status === 'paused' ||
                  item.status === 'error') && (
                  <button
                    type="button"
                    onClick={() => cancelItem(item.id)}
                    className="text-[10px] text-red-400 hover:text-red-300"
                    aria-label="Cancel upload"
                  >
                    \u2715
                  </button>
                )}
              </div>
              {item.message && (
                <p
                  className={`text-[10px] ${
                    item.status === 'error' || item.status === 'paused'
                      ? 'text-red-400'
                      : 'text-[#DFFF00]'
                  }`}
                >
                  {item.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[9px] text-white/30 mt-2">
        No size limit \u2022 Resumable upload \u2022 Auto-retry on failure
      </p>
    </div>
  );
}
