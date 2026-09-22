"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { CodeEditorView } from "./code-editor-view";

// CodeMirror is client-only and heavy, so it loads on demand
export const CodeEditor = dynamic<ComponentProps<typeof CodeEditorView>>(
  () => import("./code-editor-view").then((m) => m.CodeEditorView),
  { ssr: false, loading: () => <div className="bg-foreground/[0.02] min-h-[300px] flex-1 animate-pulse" /> },
);

export type { EditorLanguage } from "./code-editor-view";
