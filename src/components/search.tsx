"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "earthling-ui/dialog";
import { Button } from "earthling-ui/button";
import { Kbd } from "earthling-ui/kbd";
import { cn } from "earthling-ui/utils/cn";
import { findCategory, tools } from "@/lib/tools";

type Entry = {
  label: string;
  description: string;
  href: string;
  icon: string;
  group: string;
  keywords: string;
  variant?: boolean;
};

const index: Entry[] = tools.flatMap((tool) => {
  const group = findCategory(tool.category).label;
  return [
    {
      label: tool.title,
      description: tool.description,
      href: tool.href,
      icon: tool.icon,
      group,
      keywords: tool.keywords,
    },
    ...(tool.variants ?? []).map((v) => ({
      label: `${tool.title} · ${v.label}`,
      description: tool.description,
      href: v.href,
      icon: tool.icon,
      group,
      keywords: v.label,
      variant: true,
    })),
  ];
});

function score(entry: Entry, q: string) {
  const label = entry.label.toLowerCase();
  if (label === q) return 5;
  if (label.startsWith(q)) return 4;
  if (label.includes(q)) return 3;
  if (entry.keywords.toLowerCase().includes(q)) return 2;
  if (entry.description.toLowerCase().includes(q)) return 1;
  return 0;
}

export function Search({ className }: { className?: string }) {
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.filter((e) => !e.variant);
    return index
      .map((entry) => ({ entry, score: score(entry, q) - (entry.variant ? 0.5 : 0) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
      .map((r) => r.entry);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, id]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        material="paper"
        scheme="muted"
        size="sm"
        className={cn("justify-start", className)}
        onClick={() => setOpen(true)}
        aria-label="Search tools"
      >
        <i aria-hidden="true" className="icon-[lucide--search]" />
        <span className="hidden flex-1 text-left text-xs sm:block">Search tools</span>
        <Kbd size="sm" className="max-sm:hidden">
          ⌘K
        </Kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-24 max-w-lg translate-y-0 gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Search tools</DialogTitle>
          <DialogDescription className="sr-only">
            Type to filter. Use the arrow keys to select a result and Enter to open it.
          </DialogDescription>
          <div className="flex items-center gap-2 border-b px-4">
            <i aria-hidden="true" className="text-muted-foreground icon-[lucide--search] size-4 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(i + 1, results.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter" && results[active]) {
                  e.preventDefault();
                  go(results[active].href);
                }
              }}
              placeholder="Search tools…"
              className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-sm outline-none"
              role="combobox"
              aria-label="Search tools"
              aria-expanded="true"
              aria-autocomplete="list"
              aria-controls={`${id}-list`}
              aria-activedescendant={results[active] ? `${id}-${active}` : undefined}
            />
          </div>
          <ul id={`${id}-list`} role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 && (
              <li role="presentation" className="text-muted-foreground px-3 py-8 text-center text-sm">
                No tools match “{query}”
              </li>
            )}
            {results.map((entry, i) => (
              <li key={entry.href} role="presentation">
                {(i === 0 || results[i - 1].group !== entry.group) && (
                  <div className="eyebrow text-muted-foreground px-3 pt-3 pb-1.5">{entry.group}</div>
                )}
                <Link
                  id={`${id}-${i}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={i === active}
                  href={entry.href}
                  onClick={() => setOpen(false)}
                  onMouseMove={() => setActive(i)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                    i === active && "bg-foreground/8",
                  )}
                >
                  <i aria-hidden="true" className={cn("text-muted-foreground size-4 shrink-0", entry.icon)} />
                  <div className="min-w-0">
                    <div className="font-medium">{entry.label}</div>
                    <div className="text-muted-foreground truncate text-xs">{entry.description}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
