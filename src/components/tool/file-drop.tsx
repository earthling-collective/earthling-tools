"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "earthling-ui/utils/cn";
import { prettySize } from "@/lib/files";

// Drop target that becomes a compact file row once something is loaded
export function FileDrop({
  file,
  onFile,
  accept,
  hint,
  icon = "icon-[lucide--file-up]",
  meta,
  preview,
  className,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  accept: string;
  hint: string;
  icon?: string;
  meta?: ReactNode;
  preview?: boolean;
  className?: string;
}) {
  const [inputKey, setInputKey] = useState(0);
  const [dragging, setDragging] = useState(false);
  const thumb = useMemo(() => (preview && file ? URL.createObjectURL(file) : ""), [file, preview]);
  useEffect(() => () => void (thumb && URL.revokeObjectURL(thumb)), [thumb]);

  return (
    <div
      className={cn("relative", className)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFile(e.dataTransfer.files?.[0] ?? null);
      }}
    >
      <input
        key={inputKey}
        type="file"
        accept={accept}
        aria-label={hint}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        onChange={(e) => {
          onFile(e.target.files?.[0] ?? null);
          setInputKey((k) => k + 1);
        }}
      />
      {file ? (
        <div className="bg-background hover:bg-muted/40 flex h-full items-center gap-4 rounded-xl border p-3 shadow-xs transition-colors">
          {thumb ? (
            <img src={thumb} alt="" className="size-14 flex-none rounded-lg border object-cover" />
          ) : (
            <span className="bg-muted/50 flex size-14 flex-none items-center justify-center rounded-lg border">
              <i aria-hidden="true" className={cn("text-muted-foreground size-6", icon)} />
            </span>
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="truncate text-sm font-medium">{file.name}</div>
            <div className="text-muted-foreground font-mono text-xs tabular-nums">
              {meta ?? `${file.type || "unknown"} · ${prettySize(file.size)}`}
            </div>
          </div>
          <span className="text-muted-foreground ml-auto text-xs whitespace-nowrap max-md:hidden">
            Click to replace
          </span>
        </div>
      ) : (
        <div
          className={cn(
            "bg-background/60 hover:bg-background flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-12 transition-colors hover:border-current/30",
            dragging && "border-foreground bg-background",
          )}
        >
          <i aria-hidden="true" className={cn("text-muted-foreground size-6", icon)} />
          <div className="text-sm font-medium">{hint}</div>
          <div className="text-muted-foreground text-xs">Stays on your device</div>
        </div>
      )}
    </div>
  );
}
