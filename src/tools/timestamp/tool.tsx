"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "earthling-ui/button";
import { ToggleGroup, ToggleGroupItem } from "earthling-ui/toggle-group";
import { cn } from "earthling-ui/utils/cn";
import {
  CopyButton,
  Field,
  MonoInput,
  Panel,
  PanelHeader,
  Stat,
  Toolbar,
  ToolHeader,
  Workbench,
} from "@/components/tool";
import { swapUrl } from "@/lib/swap-url";
import { parseTime, relativeTime, toIsoUtc, type TimeUnit } from "./time";

const localFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZoneName: "short",
});

const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "long" });

const units: { value: TimeUnit; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "seconds", label: "s" },
  { value: "millis", label: "ms" },
  { value: "micros", label: "µs" },
];

const sourceLabels: Record<string, string> = {
  seconds: "read as seconds",
  millis: "read as milliseconds",
  micros: "read as microseconds",
  date: "read as a date",
};

// Stat label with its own copy action
const labelWithCopy = (label: string, value: string) => (
  <span className="flex items-center gap-1">
    {label}
    <CopyButton
      content={value}
      shape="icon"
      aria-label={`Copy ${label}`}
      className="text-muted-foreground -my-1 size-6 [&>span]:sr-only"
    />
  </span>
);

export function TimestampTool() {
  const [input, setInput] = useState("");
  const [unit, setUnit] = useState<TimeUnit>("auto");
  const dirty = useRef(false);

  // Live clock, ticking once a second. Null until mounted, so SSR stays stable.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Land with ?t= and hydrate
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("t");
    if (param) setInput(param);
  }, []);

  // Shareable address bar for explicit inputs
  useEffect(() => {
    if (!dirty.current) return;
    const url = input.trim() !== "" ? `/timestamp?t=${encodeURIComponent(input.trim())}` : "/timestamp";
    const timer = setTimeout(() => swapUrl(url), 150);
    return () => clearTimeout(timer);
  }, [input]);

  const explicit = input.trim() !== "";
  const parsed = explicit ? parseTime(input, unit) : null;
  const date = parsed?.ok ? parsed.date : null;
  const invalid = Boolean(parsed && !parsed.ok);

  const stats = date
    ? [
        { label: "Unix seconds", value: `${Math.floor(date.getTime() / 1000)}` },
        { label: "Unix millis", value: `${date.getTime()}` },
        { label: "ISO 8601 UTC", value: toIsoUtc(date), small: true },
        { label: "Local", value: localFmt.format(date), small: true },
        { label: "Relative", value: now ? relativeTime(date, now) : "—", small: true },
        { label: "Day of week", value: dayFmt.format(date), small: true },
      ]
    : [];

  const nowSeconds = now ? `${Math.floor(now.getTime() / 1000)}` : "—";

  return (
    <div>
      <ToolHeader
        title="Unix Timestamp Converter"
        description="Paste an epoch timestamp — seconds, milliseconds or microseconds — or any date string, and convert both ways. The current time ticks along below."
      />

      <Toolbar
        className="mt-8"
        actions={
          <Button
            material="outline"
            scheme="neutral"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              dirty.current = true;
              setInput(`${Math.floor(Date.now() / 1000)}`);
              setUnit("seconds");
            }}
          >
            <i aria-hidden="true" className="icon-[lucide--clock]" />
            Now
          </Button>
        }
      >
        <Field label="Read numbers as">
          <ToggleGroup
            type="single"
            size="sm"
            value={unit}
            onValueChange={(v) => v && setUnit(v as TimeUnit)}
            aria-label="Number unit"
          >
            {units.map((u) => (
              <ToggleGroupItem key={u.value} value={u.value} size="sm" className="font-mono">
                {u.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      </Toolbar>

      <Workbench className="mt-4">
        <Panel className={cn(invalid && "border-bad/40")}>
          <PanelHeader label="Input" meta={parsed?.ok ? sourceLabels[parsed.source] : undefined} />
          <div className="p-4">
            <MonoInput
              type="text"
              spellCheck={false}
              value={input}
              onChange={(e) => {
                dirty.current = true;
                setInput(e.target.value);
              }}
              placeholder="1700000000 or 2023-11-14T22:13:20Z"
              aria-label="Timestamp or date"
              aria-invalid={invalid}
              material="paper"
              size="lg"
              className="h-12 px-4 !text-lg tabular-nums"
            />
          </div>
          {parsed && !parsed.ok && <p className="text-bad border-t px-4 py-3 text-sm">{parsed.error}</p>}
        </Panel>

        <Panel>
          <PanelHeader label="Converted" />
          {stats.length === 0 ? (
            <p className="text-muted-foreground flex min-h-32 items-center justify-center p-4 text-center text-sm">
              {explicit
                ? "Fix the input to see conversions."
                : "Enter a timestamp or date above to convert it."}
            </p>
          ) : (
            <div aria-live="polite" className="grid gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((s) => (
                <Stat
                  key={s.label}
                  label={labelWithCopy(s.label, s.value)}
                  value={s.small ? <span className="text-base">{s.value}</span> : s.value}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHeader label="Current time" meta={now ? "live" : undefined}>
            {now && (
              <CopyButton content={nowSeconds} className="-mr-2">
                Copy epoch
              </CopyButton>
            )}
          </PanelHeader>
          <div className="grid gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Unix seconds" value={nowSeconds} />
            <Stat label="Unix millis" value={now ? `${now.getTime()}` : "—"} />
            <Stat
              label="ISO 8601 UTC"
              value={<span className="text-base">{now ? toIsoUtc(now) : "—"}</span>}
            />
          </div>
        </Panel>
      </Workbench>
    </div>
  );
}
