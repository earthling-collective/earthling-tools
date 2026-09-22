"use client";

import { useMemo, useState } from "react";
import { Button } from "earthling-ui/button";
import { CodeEditor } from "@/components/code-editor";
import {
  CopyButton,
  Field,
  Panel,
  PanelHeader,
  ToolHeader,
  Toolbar,
  ToolSelect,
  Workbench,
} from "@/components/tool";
import { swapUrl } from "@/lib/swap-url";
import { getTextTransform, textTransformGroups, textTransforms } from "./transforms";

const groups = textTransformGroups.map((group) => ({
  label: group,
  options: textTransforms.filter((t) => t.group === group).map((t) => ({ value: t.slug, label: t.label })),
}));

const chars = (value: string) => `${value.length.toLocaleString()} chars`;

// One component serves every /text/[transform] page; the route seeds the switcher
export function TextTool({ initialSlug }: { initialSlug: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [input, setInput] = useState("");

  const transform = getTextTransform(slug) ?? textTransforms[0];

  const result = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: transform.apply(input), error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : `${e}` };
    }
  }, [input, transform]);

  return (
    <>
      <ToolHeader title={transform.title} description={transform.description} />

      <Toolbar className="mt-8">
        <Field label="Transform">
          <ToolSelect
            aria-label="Transform"
            value={transform.slug}
            groups={groups}
            onValueChange={(value) => {
              setSlug(value);
              swapUrl(`/text/${value}`);
            }}
          />
        </Field>
      </Toolbar>

      <Workbench className="mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Panel>
            <PanelHeader label="Input" meta={input ? chars(input) : undefined}>
              <Button
                material="ghost"
                scheme="neutral"
                size="sm"
                disabled={!input}
                className="-mr-2 gap-1.5"
                onClick={() => setInput("")}
              >
                <i aria-hidden="true" className="icon-[lucide--x]" />
                Clear
              </Button>
            </PanelHeader>
            <CodeEditor
              autoFocus
              value={input}
              onChange={setInput}
              placeholder={transform.placeholder ?? "Paste or type text here…"}
              language={transform.inputLanguage}
            />
          </Panel>

          <Panel className={result.error ? "border-bad/40" : undefined}>
            <PanelHeader label="Output" meta={result.output ? chars(result.output) : undefined}>
              <Button
                material="ghost"
                scheme="neutral"
                size="sm"
                disabled={!result.output}
                className="gap-1.5"
                onClick={() => setInput(result.output)}
              >
                <i aria-hidden="true" className="icon-[lucide--corner-up-left]" />
                Use as input
              </Button>
              <CopyButton content={result.output} disabled={!result.output} className="-mr-2" />
            </PanelHeader>
            <div aria-live="polite" className="flex min-w-0 flex-1 flex-col">
              <CodeEditor
                readOnly
                value={result.output}
                placeholder="Result appears here…"
                language={transform.outputLanguage}
              />
            </div>
            {result.error && <p className="text-bad border-t px-4 py-3 text-sm">{result.error}</p>}
          </Panel>
        </div>
      </Workbench>
    </>
  );
}
