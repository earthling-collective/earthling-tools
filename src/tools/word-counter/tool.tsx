"use client";

import { useState } from "react";
import { Button } from "earthling-ui/button";
import { TextArea } from "earthling-ui/textarea";
import { Panel, PanelHeader, ToolHeader, Workbench } from "@/components/tool";
import { textStats } from "./counts";

export function WordCounterTool() {
  const [input, setInput] = useState("");
  const stats = textStats(input);
  const minutes = (n: number) => (stats.words === 0 ? "—" : `${n} min`);

  const rows = [
    ["Words", stats.words.toLocaleString()],
    ["Characters", stats.characters.toLocaleString()],
    ["Without spaces", stats.charactersNoSpaces.toLocaleString()],
    ["Unique words", stats.uniqueWords.toLocaleString()],
    ["Sentences", stats.sentences.toLocaleString()],
    ["Paragraphs", stats.paragraphs.toLocaleString()],
    ["Lines", stats.lines.toLocaleString()],
    ["Reading time", minutes(stats.readingMinutes)],
    ["Speaking time", minutes(stats.speakingMinutes)],
  ] as const;

  return (
    <div>
      <ToolHeader
        title="Word Counter"
        description="Live word, character, sentence and paragraph counts with reading time, as you type or paste."
      />

      <Workbench className="mt-8">
        <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
          <Panel>
            <PanelHeader label="Text" meta={input ? `${stats.characters.toLocaleString()} chars` : undefined}>
              {input && (
                <Button
                  material="ghost"
                  scheme="neutral"
                  size="sm"
                  className="-mr-2 gap-1.5"
                  onClick={() => setInput("")}
                >
                  <i aria-hidden="true" className="icon-[lucide--x]" />
                  Clear
                </Button>
              )}
            </PanelHeader>
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              aria-label="Text to count"
              placeholder="Type or paste your text here"
              className="min-h-[360px] flex-1 resize-none rounded-none border-0 bg-transparent p-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </Panel>

          <Panel>
            <PanelHeader label="Counts" />
            <div aria-live="polite" className="flex flex-col divide-y">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                  <span className="text-muted-foreground text-sm">{label}</span>
                  <span className="font-mono text-sm tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </Workbench>
    </div>
  );
}
