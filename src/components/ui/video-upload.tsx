"use client";

import { useRef, useState } from "react";
import { Film, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MAX_MB = 64;

export function VideoUpload({
  value,
  onChange,
  className,
  label,
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  className?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  async function upload(file: File) {
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file (MP4 or WebM)");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Video too large (max ${MAX_MB} MB)`);
      return;
    }
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/video", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      onChange(data.url);
      toast.success("Video uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function pick() {
    if (isUploading) return;
    inputRef.current?.click();
  }

  const fileName = value ? value.split("/").pop() : null;

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          // reset so re-picking the same file fires onChange again
          e.target.value = "";
        }}
      />

      {value ? (
        // Compact "uploaded" row — the live hero preview alongside already
        // shows the video, so this stays out of the way.
        <div className="flex items-center gap-3 rounded-[10px] border border-line bg-paper px-3 py-2.5">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[8px] bg-gold-soft text-gold-deep">
            <Film className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-ink" title={value}>
            {fileName}
          </span>
          <button
            type="button"
            onClick={pick}
            disabled={isUploading}
            className="tc-btn tc-btn-ghost tc-btn-sm"
          >
            {isUploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Upload />
            )}
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[8px] text-bad transition-colors hover:bg-bad-soft"
            aria-label="Remove video"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) upload(f);
          }}
          disabled={isUploading}
          className={cn(
            "h-28 w-full rounded-[10px] border-2 border-dashed bg-paper-2 transition-all",
            "flex flex-col items-center justify-center gap-2 text-muted",
            "hover:border-[var(--gold-line)] hover:bg-paper",
            isDragging
              ? "border-[var(--gold-line)] bg-gold-soft/50 text-gold-deep"
              : "border-line",
            isUploading && "cursor-wait opacity-60"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-xs uppercase tracking-[0.18em]">Uploading…</p>
            </>
          ) : (
            <>
              <Film className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.18em]">
                {label ?? "Click or drop a video"}
              </p>
              <p className="text-[10px] tracking-wide">
                MP4 · WebM · max {MAX_MB} MB
              </p>
            </>
          )}
        </button>
      )}
    </div>
  );
}
