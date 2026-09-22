"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "earthling-ui/button";
import { cn } from "earthling-ui/utils/cn";
import {
  CopyButton,
  Field,
  MonoInput,
  Panel,
  PanelHeader,
  Prose,
  Toolbar,
  ToolHeader,
  ToolSelect,
  Workbench,
} from "@/components/tool";
import { swapUrl } from "@/lib/swap-url";
import { detectBase, formatInBase, getBase, numberBases, parseInBase } from "./bases";

const baseOptions = numberBases.map((b) => ({ value: b.slug, label: b.label }));

// One component serves /base and every /base/[pair] page
export function BaseTool({ initialFrom, initialTo }: { initialFrom?: string; initialTo?: string }) {
  const [fromSlug, setFromSlug] = useState(initialFrom ?? "decimal");
  const [toSlug, setToSlug] = useState(initialTo ?? "hex");
  const from = getBase(fromSlug) ?? numberBases[2];
  const to = getBase(toSlug) ?? numberBases[3];

  const [input, setInput] = useState(from.sample);
  const value = parseInBase(input, from);

  const dirty = useRef(false);

  const changeFrom = (nextSlug: string) => {
    const next = getBase(nextSlug);
    if (!next) return;
    dirty.current = true;
    setFromSlug(nextSlug);
    setToSlug(nextSlug === toSlug ? fromSlug : toSlug);
    setInput(value !== null ? formatInBase(value, next) : next.sample);
  };

  const changeTo = (nextSlug: string) => {
    dirty.current = true;
    const nextFrom = nextSlug === fromSlug ? toSlug : fromSlug;
    if (nextFrom !== fromSlug) {
      const next = getBase(nextFrom)!;
      setInput(value !== null ? formatInBase(value, next) : next.sample);
    }
    setFromSlug(nextFrom);
    setToSlug(nextSlug);
  };

  const swap = () => {
    dirty.current = true;
    setFromSlug(toSlug);
    setToSlug(fromSlug);
    setInput(value !== null ? formatInBase(value, to) : to.sample);
  };

  // Click a base row to convert from it; the previous input becomes the output
  const useBaseAsInput = (slug: string) => {
    const next = getBase(slug);
    if (!next || value === null || slug === fromSlug) return;
    dirty.current = true;
    setToSlug(fromSlug);
    setFromSlug(slug);
    setInput(formatInBase(value, next));
  };

  // Typing an 0x/0b/0o prefix switches the source base automatically
  const onInput = (v: string) => {
    dirty.current = true;
    setInput(v);
    const detected = detectBase(v);
    if (detected && detected !== fromSlug) {
      setToSlug(detected === toSlug ? fromSlug : toSlug);
      setFromSlug(detected);
    }
  };

  // Land with ?v= and hydrate
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("v");
    if (!param) return;
    const parsed = parseInBase(param, from);
    if (parsed !== null) setInput(formatInBase(parsed, from));
    else onInput(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shareable address bar, debounced
  useEffect(() => {
    if (!dirty.current) return;
    const base = `/base/${fromSlug}-to-${toSlug}`;
    const url = value !== null ? `${base}?v=${formatInBase(value, from)}` : base;
    const timer = setTimeout(() => swapUrl(url), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, fromSlug, toSlug]);

  // Pair pages get prose about the two bases, rendered from live state so the
  // dropdowns keep it honest
  const showProse = Boolean(initialFrom && initialTo);
  const sampleValue = parseInBase(from.sample, from);
  const example = sampleValue !== null ? formatInBase(sampleValue, to) : null;

  const result = value !== null ? formatInBase(value, to) : null;
  const bits = value !== null && value !== 0n ? (value < 0n ? -value : value).toString(2).length : null;
  const invalid = value === null && input.trim() !== "";

  return (
    <div>
      <ToolHeader
        title={`${from.label} to ${to.label} Converter`}
        description={`Convert ${from.label.toLowerCase()} numbers to ${to.label.toLowerCase()} instantly, at any size. Everything runs in the browser.`}
      />

      <Toolbar className="mt-8">
        <Field label="From">
          <ToolSelect
            value={from.slug}
            onValueChange={changeFrom}
            options={baseOptions}
            aria-label="Convert from"
          />
        </Field>
        <Button
          material="ghost"
          scheme="neutral"
          shape="icon"
          size="sm"
          aria-label="Swap bases"
          onClick={swap}
        >
          <i aria-hidden="true" className="icon-[lucide--arrow-left-right]" />
        </Button>
        <Field label="To">
          <ToolSelect
            value={to.slug}
            onValueChange={changeTo}
            options={baseOptions}
            aria-label="Convert to"
          />
        </Field>
      </Toolbar>

      <Workbench className="mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Panel className={cn(invalid && "border-bad/40")}>
            <PanelHeader label="Input" meta={from.label} />
            <div className="p-4">
              <MonoInput
                type="text"
                spellCheck={false}
                value={input}
                onChange={(e) => onInput(e.target.value)}
                placeholder={from.sample}
                aria-label={`${from.label} number`}
                aria-invalid={invalid}
                material="paper"
                size="lg"
                className="h-12 px-4 !text-lg"
              />
            </div>
            {invalid && (
              <p className="text-bad border-t px-4 py-3 text-sm">
                Can&apos;t read that as {from.label.toLowerCase()} — try {from.sample}
              </p>
            )}
          </Panel>

          <Panel>
            <PanelHeader label="Output" meta={bits !== null ? `${bits} bits` : undefined}>
              {result && <CopyButton content={result} className="-mr-2" />}
            </PanelHeader>
            <div aria-live="polite" className="p-4 font-mono text-2xl break-all tabular-nums select-all">
              {result ?? <span className="text-muted-foreground text-base">—</span>}
            </div>
          </Panel>
        </div>

        <Panel>
          <PanelHeader label="All bases" meta="click a row to convert from it" />
          <div className="flex flex-col divide-y">
            {numberBases.map((b) => {
              const active = b.slug === fromSlug;
              return (
                <div
                  key={b.slug}
                  className={cn(
                    "flex items-center gap-3 px-4 transition-colors",
                    active ? "bg-muted" : "hover:bg-muted/40",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => useBaseAsInput(b.slug)}
                    disabled={value === null || active}
                    aria-current={active || undefined}
                    title={active ? undefined : `Convert from ${b.label}`}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-3 py-2 text-left",
                      !active && value !== null && "cursor-pointer",
                    )}
                  >
                    <span
                      className={cn(
                        "w-[9ch] flex-none text-xs font-medium",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {b.label}
                    </span>
                    <span className="min-w-0 flex-1 font-mono text-sm break-all tabular-nums">
                      {value !== null ? formatInBase(value, b) : "—"}
                    </span>
                    {active && (
                      <span className="text-muted-foreground flex-none text-xs font-medium">in</span>
                    )}
                  </button>
                  {value !== null && (
                    <CopyButton
                      content={formatInBase(value, b)}
                      shape="icon"
                      aria-label={`Copy ${b.label}`}
                      className="-mr-2 self-center [&>span]:sr-only"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      </Workbench>

      {showProse && (
        <Prose>
          <h2>
            About {from.label.toLowerCase()} and {to.label.toLowerCase()}
          </h2>
          <p>{from.about}</p>
          <p>{to.about}</p>
          {example && (
            <p>
              For example, {from.label.toLowerCase()} <code>{from.sample}</code> is <code>{example}</code> in{" "}
              {to.label.toLowerCase()}. The converter uses BigInt, so numbers of any size convert without
              losing precision, entirely in the browser.
            </p>
          )}
        </Prose>
      )}
    </div>
  );
}
