"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "earthling-ui/utils/cn";
import { CopyButton, MonoInput, Panel, PanelHeader, Prose, ToolHeader, Workbench } from "@/components/tool";
import { swapUrl } from "@/lib/swap-url";
import {
  describeCron,
  fieldPhrase,
  findPresetByExpression,
  FIELD_DEFS,
  nextRuns,
  parseCron,
  PHRASE_CFGS,
} from "./cron";

// Coarse relative time, enough to orient the next-runs list
const rel = (d: Date, now: Date) => {
  const mins = Math.round((d.getTime() - now.getTime()) / 60000);
  if (mins < 1) return "in under a minute";
  if (mins < 120) return `in ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `in ${hours} hours`;
  return `in ${Math.round(hours / 24)} days`;
};

const absFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// One component serves /cron and every /cron/[preset] page
export function CronTool({ initialExpression }: { initialExpression?: string }) {
  const [input, setInput] = useState(initialExpression ?? "*/5 * * * *");
  const result = parseCron(input);
  const preset = findPresetByExpression(input);

  // No URL writes until the user actually edits
  const dirty = useRef(false);

  // Land with ?e= and hydrate (underscores stand in for spaces)
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("e");
    if (param) setInput(param.replace(/_/g, " "));
  }, []);

  // Preset expressions get their canonical page URL, everything else rides in ?e=
  useEffect(() => {
    if (!dirty.current) return;
    const url = preset
      ? `/cron/${preset.slug}`
      : result.ok
        ? `/cron?e=${input.trim().split(/\s+/).join("_")}`
        : "/cron";
    const timer = setTimeout(() => swapUrl(url), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Run times depend on the wall clock, so they only exist client-side
  const [runs, setRuns] = useState<{ abs: string; rel: string }[]>([]);
  useEffect(() => {
    if (!result.ok) {
      setRuns([]);
      return;
    }
    const now = new Date();
    setRuns(nextRuns(result.cron, 5, now).map((d) => ({ abs: absFmt.format(d), rel: rel(d, now) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const description = result.ok ? describeCron(result.cron) : null;

  // Preset pages explain whatever is in the box right now
  const showProse = Boolean(initialExpression);
  const proseFields = result.ok
    ? FIELD_DEFS.map((def, i) => ({
        label: def.label,
        token: result.tokens[i],
        phrase: fieldPhrase(result.cron[def.key], PHRASE_CFGS[def.key]),
      }))
    : [];

  return (
    <div>
      <ToolHeader
        title={preset ? `Cron: ${preset.label}` : "Cron Expression Explainer"}
        description="Type a cron schedule and get plain English, a field-by-field breakdown and the next run times, all in the browser."
      />

      <Workbench className="mt-8">
        <Panel className={cn(!result.ok && "border-bad/40")}>
          <PanelHeader label="Expression">
            {result.ok && <CopyButton content={input.trim()} className="-mr-2" />}
          </PanelHeader>
          <div className="flex flex-col gap-3 p-4">
            <MonoInput
              type="text"
              spellCheck={false}
              value={input}
              onChange={(e) => {
                dirty.current = true;
                setInput(e.target.value);
              }}
              placeholder="*/5 * * * *"
              aria-label="Cron expression"
              aria-invalid={!result.ok}
              material="paper"
              size="lg"
              className="h-12 px-4 !text-lg tracking-widest"
            />
            {result.ok && (
              <p aria-live="polite" className="text-lg font-medium text-balance">
                {description}
              </p>
            )}
          </div>
          {!result.ok && (
            <p className="text-bad border-t px-4 py-3 text-sm">Can&apos;t read that — {result.error}</p>
          )}
        </Panel>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel>
            <PanelHeader label="Fields" />
            <div className="flex flex-col divide-y">
              {FIELD_DEFS.map((def, i) => (
                <div key={def.key} className="flex items-baseline gap-3 px-4 py-2.5">
                  <span className="text-muted-foreground w-[11ch] flex-none text-xs font-medium">
                    {def.label}
                  </span>
                  <span className="w-[9ch] flex-none font-mono text-sm">
                    {result.ok ? result.tokens[i] : "—"}
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    {result.ok ? fieldPhrase(result.cron[def.key], PHRASE_CFGS[def.key]) : ""}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader label="Next runs" meta={runs.length ? "local time" : undefined} />
            {runs.length === 0 ? (
              <p className="text-muted-foreground flex min-h-32 items-center justify-center p-4 text-center text-sm">
                {result.ok ? "No upcoming runs within 5 years." : "Fix the expression to see upcoming runs."}
              </p>
            ) : (
              <div aria-live="polite" className="flex flex-col divide-y">
                {runs.map((r, i) => (
                  <div key={r.abs} className="flex items-baseline gap-3 px-4 py-2.5">
                    <span className="text-muted-foreground w-[2ch] flex-none text-right font-mono text-xs tabular-nums">
                      {i + 1}
                    </span>
                    <span className="font-mono text-sm tabular-nums">{r.abs}</span>
                    <span className="flex-1" />
                    <span className="text-muted-foreground text-xs whitespace-nowrap">{r.rel}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </Workbench>

      {showProse && result.ok && (
        <Prose>
          <h2>
            {preset ? `The cron expression for ${preset.label.toLowerCase()}` : "What this expression means"}
          </h2>
          <p>
            {preset ? `To run a job ${preset.label.toLowerCase()}, use ` : "The expression "}
            <code>{input.trim()}</code>. Read aloud it means: {description}.
          </p>
          <p>
            Field by field:{" "}
            {proseFields.map((f, i) => (
              <span key={f.label}>
                {f.label} <code>{f.token}</code> — {f.phrase}
                {i < proseFields.length - 1 ? "; " : "."}
              </span>
            ))}
          </p>
          <p>
            The expression drops into a crontab, a CI schedule or anything else that speaks standard
            five-field cron syntax. The times above are in the local timezone of this browser; most cron
            daemons run in the server&apos;s timezone, so mind the difference when it matters.
          </p>
        </Prose>
      )}
    </div>
  );
}
