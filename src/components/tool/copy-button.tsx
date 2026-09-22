"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Button } from "earthling-ui/button";
import { cn } from "earthling-ui/utils/cn";

export function CopyButton({
  content,
  children = "Copy",
  className,
  onClick,
  ...rest
}: ComponentProps<typeof Button> & { content: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Button
      material="ghost"
      scheme="neutral"
      size="sm"
      {...rest}
      className={cn("gap-1.5", className)}
      onClick={async (e) => {
        onClick?.(e);
        await navigator.clipboard.writeText(content);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1800);
      }}
    >
      <i aria-hidden="true" className={copied ? "icon-[lucide--check] text-good" : "icon-[lucide--copy]"} />
      <span aria-live="polite">{copied ? "Copied" : children}</span>
    </Button>
  );
}
