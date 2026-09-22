"use client";

import { useState } from "react";
import { Badge } from "earthling-ui/badge";
import { Button } from "earthling-ui/button";
import { TextArea } from "earthling-ui/textarea";
import { cn } from "earthling-ui/utils/cn";
import { Panel, PanelHeader, ToolHeader, Workbench } from "@/components/tool";
import { diffStats, lineDiff } from "./diff";

const editorClass =
  "min-h-[280px] flex-1 resize-none rounded-none border-0 bg-transparent p-4 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0";

const lineCount = (value: string) =>
  value ? `${value.split("\n").length.toLocaleString()} lines` : undefined;

export function DiffTool() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const ready = a !== "" && b !== "";
  const lines = ready ? lineDiff(a, b) : [];
  const stats = diffStats(lines);

  // Git-style gutters: a line number on the side it actually exists on
  let oldNo = 0;
  let newNo = 0;
  const rows = lines.map((line) => {
    if (line.type !== "add") oldNo += 1;
    if (line.type !== "del") newNo += 1;
    return { ...line, old: line.type === "add" ? null : oldNo, next: line.type === "del" ? null : newNo };
  });

  const side = (
    label: string,
    value: string,
    setValue: (next: string) => void,
    placeholder: string,
    clearLabel: string,
  ) => (
    <Panel>
      <PanelHeader label={label} meta={lineCount(value)}>
        <Button
          material="ghost"
          scheme="neutral"
          size="sm"
          disabled={!value}
          aria-label={clearLabel}
          className="-mr-2 gap-1.5"
          onClick={() => setValue("")}
        >
          <i aria-hidden="true" className="icon-[lucide--x]" />
          Clear
        </Button>
      </PanelHeader>
      <TextArea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        spellCheck={false}
        aria-label={`${label} text`}
        placeholder={placeholder}
        className={editorClass}
      />
    </Panel>
  );

  return (
    <>
      <ToolHeader
        title="Text Diff Checker"
        description="Paste two versions of a text and see the line-by-line differences, compared entirely in the browser."
      />

      <Workbench className="mt-8">
        <div className="grid gap-4 md:grid-cols-2">
          {side("Original", a, setA, "Paste the original text", "Clear original text")}
          {side("Changed", b, setB, "Paste the changed text", "Clear changed text")}
        </div>

        <Panel>
          <PanelHeader
            label="Diff"
            meta={
              ready ? (
                <span className="flex items-center gap-1.5">
                  <Badge scheme="good">+{stats.added}</Badge>
                  <Badge scheme="bad">−{stats.removed}</Badge>
                </span>
              ) : undefined
            }
          >
            <Button
              material="ghost"
              scheme="neutral"
              size="sm"
              disabled={!a && !b}
              className="-mr-2 gap-1.5"
              onClick={() => {
                setA(b);
                setB(a);
              }}
            >
              <i aria-hidden="true" className="icon-[lucide--arrow-left-right]" />
              Swap
            </Button>
          </PanelHeader>

          <div aria-live="polite" className="flex min-w-0 flex-1 flex-col">
            {!ready ? (
              <p className="text-muted-foreground flex min-h-32 items-center justify-center p-8 text-center text-sm">
                Paste text on both sides to compare.
              </p>
            ) : stats.added === 0 && stats.removed === 0 ? (
              <p className="text-muted-foreground flex min-h-32 items-center justify-center p-8 text-center text-sm">
                No differences.
              </p>
            ) : (
              <div className="overflow-x-auto py-1 font-mono text-sm tabular-nums">
                {rows.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-row gap-3 px-4 whitespace-pre",
                      line.type === "add" && "bg-good/10 text-good",
                      line.type === "del" && "bg-bad/10 text-bad",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground w-[4ch] flex-none text-right select-none"
                    >
                      {line.old ?? ""}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground w-[4ch] flex-none text-right select-none"
                    >
                      {line.next ?? ""}
                    </span>
                    <span aria-hidden="true" className="w-[1ch] flex-none opacity-60 select-none">
                      {line.type === "add" ? "+" : line.type === "del" ? "−" : " "}
                    </span>
                    <span>{line.text || " "}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </Workbench>
    </>
  );
}
