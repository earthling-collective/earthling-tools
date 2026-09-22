import type { ReactNode } from "react";
import { cn } from "earthling-ui/utils/cn";

// Explanatory copy under a tool, server-rendered for crawlers
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={cn(
        "text-muted-foreground mt-12 flex max-w-2xl flex-col gap-4 text-sm leading-6",
        "[&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight first:[&_h2]:mt-0",
        "[&_a]:docs-link",
        "[&_code]:bg-muted [&_code]:text-foreground [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
        className,
      )}
    >
      {children}
    </article>
  );
}
