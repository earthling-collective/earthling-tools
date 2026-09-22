"use client";

import { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import glsl from "highlight.js/lib/languages/glsl";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import plaintext from "highlight.js/lib/languages/plaintext";
import xml from "highlight.js/lib/languages/xml";
import { cn } from "earthling-ui/utils/cn";
import { CopyButton } from "./tool/copy-button";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("glsl", glsl);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("html", xml);

// Highlighted, copyable code block
export function Code({
  children = "",
  language,
  label,
  className,
}: {
  children?: string;
  language: string;
  label?: string;
  className?: string;
}) {
  const html = useMemo(
    () => hljs.highlight(children, { language: hljs.getLanguage(language) ? language : "plaintext" }).value,
    [children, language],
  );
  return (
    <div className={cn("code-block overflow-hidden rounded-xl border", className)}>
      <div className="flex h-11 items-center justify-between border-b px-4">
        <span className="text-muted-foreground font-mono text-xs">{label ?? language}</span>
        <CopyButton content={children} className="-mr-2 h-7 px-2 text-xs" />
      </div>
      <pre tabIndex={0} className="m-0 overflow-auto p-4 text-[13px] leading-6">
        <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
