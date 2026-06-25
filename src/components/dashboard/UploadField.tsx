"use client"

import { useEffect, useMemo, useRef, useState } from 'react';

type UploadKind = 'video' | 'image';

type UploadFieldProps = {
  projectId: string;
  kind: UploadKind;
};

const ACCEPT: Record<UploadKind, string> = {
  video: 'video/mp4,video/webm,video/mov',
  image: 'image/png,image/jpeg,image/webp,image/avif',
};

export function UploadField({ projectId, kind }: UploadFieldProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const previewUrl = useMemo(() => {
    if (!file) return '';
    return URL.createObjectURL(file);
  }, [file]);

  // Revoke old object URLs to prevent memory leaks
  const prevUrlRef = useRef<string>('');
  useEffect(() => {
    if (prevUrlRef.current && prevUrlRef.current !== previewUrl) {
      URL.revokeObjectURL(prevUrlRef.current);
    }
    prevUrlRef.current = previewUrl;
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const label = kind === 'video' ? 'UPLOAD VIDEO' : 'UPLOAD IMAGE';
  const endpoint = kind === 'video' ? '/api/admin/upload/video' : '/api/admin/upload/image';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    setStatus('uploading');
    setProgress(0);
    setMessage('');

    const formData = new FormData();
    formData.append('id', projectId);
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);
    xhr.responseType = 'json';

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      setProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setStatus('success');
        setMessage('Uploaded successfully');
        setTimeout(() => window.location.reload(), 300);
        return;
      }

      const errorText =
        (xhr.response && typeof xhr.response === 'object' && xhr.response.error) ||
        xhr.responseText ||
        `Upload failed (${xhr.status})`;
      setStatus('error');
      setMessage(String(errorText));
    };

    xhr.onerror = () => {
      setStatus('error');
      setMessage('Upload failed (network error)');
    };

    xhr.send(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={projectId} />
      <input
        name="file"
        type="file"
        accept={ACCEPT[kind]}
        className="text-xs"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {previewUrl ? (
        <div className="w-40 h-24 border border-white/10 overflow-hidden">
          {kind === 'image' ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <video src={previewUrl} className="w-full h-full object-cover" muted playsInline />
          )}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!file || status === 'uploading'}
        className="px-3 py-2 border border-white/20 text-xs tracking-widest disabled:opacity-50"
      >
        {status === 'uploading' ? `UPLOADING ${progress}%` : label}
      </button>

      {message ? (
        <p className={`text-[11px] ${status === 'error' ? 'text-red-400' : 'text-[#DFFF00]'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
