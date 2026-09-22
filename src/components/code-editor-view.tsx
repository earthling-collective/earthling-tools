"use client";

import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, placeholder as cmPlaceholder } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { useEffect, useRef } from "react";

const theme = EditorView.theme({
  "&": { backgroundColor: "transparent", color: "var(--color-foreground)", fontSize: "13px", flex: "1" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    lineHeight: "1.7",
    minHeight: "300px",
    maxHeight: "600px",
  },
  ".cm-content": { padding: "12px 0", caretColor: "var(--color-foreground)" },
  ".cm-line": { padding: "0 16px" },
  "&.cm-focused": { outline: "none" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "color-mix(in oklch, var(--color-accent) 30%, transparent)",
  },
  ".cm-cursor": { borderLeftColor: "var(--color-foreground)" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--color-muted-foreground)",
    opacity: "0.6",
    paddingLeft: "8px",
  },
  ".cm-activeLineGutter": { backgroundColor: "transparent", opacity: "1" },
  ".cm-placeholder": { color: "var(--color-muted-foreground)" },
});

const highlights = syntaxHighlighting(
  HighlightStyle.define([
    { tag: [t.keyword, t.operatorKeyword, t.definitionKeyword, t.modifier], color: "var(--syntax-keyword)" },
    { tag: [t.string, t.special(t.string)], color: "var(--syntax-string)" },
    { tag: [t.number, t.bool, t.null, t.atom], color: "var(--syntax-number)" },
    { tag: [t.propertyName, t.attributeName, t.tagName, t.angleBracket], color: "var(--syntax-title)" },
    { tag: t.comment, color: "var(--color-muted-foreground)", fontStyle: "italic" },
  ]),
);

export type EditorLanguage = "json" | "html";

// Cheap shape detection, no statistical guessing
function detectLanguage(text: string): EditorLanguage | null {
  const trimmed = text.trimStart();
  if (!trimmed || text.length > 100_000) return null;
  if (/^[\[{]/.test(trimmed)) {
    try {
      JSON.parse(text);
      return "json";
    } catch {
      return null;
    }
  }
  return trimmed.startsWith("<") ? "html" : null;
}

const languageExtension = (lang: EditorLanguage | null): Extension =>
  lang === "json" ? json() : lang === "html" ? html() : [];

export function CodeEditorView({
  value,
  onChange,
  readOnly,
  placeholder,
  language,
  autoFocus,
}: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  language?: EditorLanguage;
  autoFocus?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const lang = useRef(new Compartment());
  const hint = useRef(new Compartment());
  const activeLang = useRef<EditorLanguage | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // The view is built once; later changes go through dispatches below
  useEffect(() => {
    const initial = language ?? detectLanguage(value);
    activeLang.current = initial;
    const v = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          theme,
          highlights,
          lang.current.of(languageExtension(initial)),
          lineNumbers(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.lineWrapping,
          hint.current.of(cmPlaceholder(placeholder ?? "")),
          EditorState.readOnly.of(!!readOnly),
          EditorView.updateListener.of((u) => u.docChanged && onChangeRef.current?.(u.state.doc.toString())),
        ],
      }),
      parent: host.current!,
    });
    view.current = v;
    if (autoFocus) v.focus();
    return () => {
      v.destroy();
      view.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const current = v.state.doc.toString();
    if (current !== value) v.dispatch({ changes: { from: 0, to: current.length, insert: value } });
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({ effects: hint.current.reconfigure(cmPlaceholder(placeholder ?? "")) });
  }, [placeholder]);

  useEffect(() => {
    const next = language ?? detectLanguage(value);
    if (next === activeLang.current) return;
    activeLang.current = next;
    view.current?.dispatch({ effects: lang.current.reconfigure(languageExtension(next)) });
  }, [language, value]);

  return <div ref={host} className="flex min-h-[300px] flex-1 flex-col" />;
}
