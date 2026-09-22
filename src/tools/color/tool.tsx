"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "earthling-ui/button";
import { cn } from "earthling-ui/utils/cn";
import {
  CopyButton,
  Field,
  MonoInput,
  Panel,
  PanelHeader,
  ToolHeader,
  Toolbar,
  ToolSelect,
  Workbench,
} from "@/components/tool";
import { swapUrl } from "@/lib/swap-url";
import { colorSpaces, detectSpace, getSpace, toColorParam, type Rgba } from "./spaces";

const options = colorSpaces.map((s) => ({ value: s.slug, label: s.label }));

// Alpha reads honestly against a checkerboard rather than the panel surface
function Swatch({ css, children }: { css: string | null; children?: ReactNode }) {
  return (
    <span className="relative block size-12 flex-none overflow-hidden rounded-lg border">
      <span
        aria-hidden="true"
        className="text-foreground/15 absolute inset-0 [background-image:repeating-conic-gradient(currentColor_0deg_90deg,transparent_90deg_180deg)] bg-[size:10px_10px]"
      />
      <span aria-hidden="true" className="absolute inset-0" style={css ? { background: css } : undefined} />
      {children}
    </span>
  );
}

// One component serves /color and every /color/[pair] page
export function ColorTool({ initialFrom, initialTo }: { initialFrom?: string; initialTo?: string }) {
  const [fromSlug, setFromSlug] = useState(initialFrom ?? "hex");
  const [toSlug, setToSlug] = useState(initialTo ?? "rgb");
  const from = getSpace(fromSlug) ?? colorSpaces[0];
  const to = getSpace(toSlug) ?? colorSpaces[1];

  const [input, setInput] = useState(from.sample);

  const rgb = from.parse(input);
  const hexSpace = getSpace("hex")!;

  // No URL writes until something is changed, so landing on a pair page does
  // not immediately decorate the address bar
  const dirty = useRef(false);

  // Carry the current color across a mode change instead of dropping it
  const changeFrom = (nextSlug: string) => {
    const next = getSpace(nextSlug);
    if (!next) return;
    dirty.current = true;
    // Picking the space already in To swaps them, so both stay distinct
    setFromSlug(nextSlug);
    setToSlug(nextSlug === toSlug ? fromSlug : toSlug);
    setInput(rgb ? next.format(rgb) : next.sample);
  };

  const changeTo = (nextSlug: string) => {
    dirty.current = true;
    const nextFrom = nextSlug === fromSlug ? toSlug : fromSlug;
    if (nextFrom !== fromSlug) {
      const next = getSpace(nextFrom)!;
      setInput(rgb ? next.format(rgb) : next.sample);
    }
    setFromSlug(nextFrom);
    setToSlug(nextSlug);
  };

  const swap = () => {
    dirty.current = true;
    setFromSlug(toSlug);
    setToSlug(fromSlug);
    setInput(rgb ? to.format(rgb) : to.sample);
  };

  // Clicking a format row promotes it to the input and demotes the old input
  const useSpaceAsInput = (slug: string) => {
    const next = getSpace(slug);
    if (!next || !rgb || slug === fromSlug) return;
    dirty.current = true;
    setToSlug(fromSlug);
    setFromSlug(slug);
    setInput(next.format(rgb));
  };

  // Pasting an explicit rgb(…)/hsl(…)/#hex switches From automatically
  const onInput = (value: string) => {
    dirty.current = true;
    setInput(value);
    const detected = detectSpace(value);
    if (detected && detected !== fromSlug) {
      setToSlug(detected === toSlug ? fromSlug : toSlug);
      setFromSlug(detected);
    }
  };

  // Hydrate from ?color= client-side so the pair pages stay static
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("color");
    if (!param) return;
    const parsed = from.parse(param);
    if (parsed) setInput(from.format(parsed));
    else onInput(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirror the color into the address bar so it is always shareable; the
  // debounce keeps picker drags off the history API rate limit
  useEffect(() => {
    if (!dirty.current) return;
    const base = `/color/${fromSlug}-to-${toSlug}`;
    const url = rgb ? `${base}?color=${toColorParam(from, rgb)}` : base;
    const timer = setTimeout(() => swapUrl(url), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, fromSlug, toSlug]);

  const result = rgb ? to.format(rgb) : null;
  const swatchHex = rgb ? hexSpace.format(rgb) : null;
  const invalid = !rgb && input.trim() !== "";

  return (
    <>
      <ToolHeader
        title={`${from.label} to ${to.label} Converter`}
        description={`Convert ${from.label} colors to ${to.label} instantly. Paste a color — with or without alpha — and the conversion runs entirely in the browser.`}
      />

      <Toolbar className="mt-8">
        <Field label="From">
          <ToolSelect
            value={from.slug}
            onValueChange={changeFrom}
            options={options}
            aria-label="Input format"
          />
        </Field>
        <Button
          material="ghost"
          scheme="neutral"
          shape="icon"
          size="sm"
          aria-label="Swap formats"
          onClick={swap}
        >
          <i aria-hidden="true" className="icon-[lucide--arrow-left-right]" />
        </Button>
        <Field label="To">
          <ToolSelect value={to.slug} onValueChange={changeTo} options={options} aria-label="Output format" />
        </Field>
      </Toolbar>

      <Workbench className="mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Panel className={cn(invalid && "border-bad/40")}>
            <PanelHeader label="Input" meta={from.label} />
            <div className="flex flex-1 items-center gap-3 p-4">
              {/* The native picker doubles as the swatch; it cannot express
                  alpha, so picking a hue keeps the current transparency */}
              <Swatch css={swatchHex}>
                <input
                  type="color"
                  aria-label="Pick a color"
                  value={swatchHex ? swatchHex.slice(0, 7) : "#000000"}
                  onChange={(e) => {
                    dirty.current = true;
                    const picked = hexSpace.parse(e.target.value) as Rgba;
                    if (rgb) picked[3] = rgb[3];
                    setInput(from.format(picked));
                  }}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </Swatch>
              <MonoInput
                value={input}
                spellCheck={false}
                onChange={(e) => onInput(e.target.value)}
                placeholder={from.sample}
                aria-label={`${from.label} color`}
                className="h-12 min-w-0 flex-1"
              />
            </div>
            {invalid && (
              <p className="text-bad border-t px-4 py-3 text-sm">
                That is not readable as {from.label} — try {from.sample}
              </p>
            )}
          </Panel>

          <Panel>
            <PanelHeader label="Output" meta={to.label}>
              {result && <CopyButton content={result} className="-mr-2" />}
            </PanelHeader>
            <div className="flex flex-1 items-center gap-3 p-4">
              <Swatch css={result} />
              <span
                aria-live="polite"
                className="min-w-0 flex-1 font-mono text-2xl break-all tabular-nums select-all"
              >
                {result ?? <span className="text-muted-foreground text-base">—</span>}
              </span>
            </div>
          </Panel>
        </div>
      </Workbench>

      <Panel className="mt-4">
        <PanelHeader label="All formats" meta="click a row to convert from it" />
        <div className="flex flex-col divide-y">
          {colorSpaces.map((s) => {
            const active = s.slug === fromSlug;
            const value = rgb ? s.format(rgb) : null;
            return (
              <div
                key={s.slug}
                className={cn(
                  "flex items-center gap-3 px-4 transition-colors",
                  active ? "bg-muted" : "hover:bg-muted/40",
                )}
              >
                <button
                  type="button"
                  onClick={() => useSpaceAsInput(s.slug)}
                  disabled={!rgb || active}
                  aria-current={active || undefined}
                  title={active ? undefined : `Convert from ${s.label}`}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-3 py-2.5 text-left",
                    !active && rgb && "cursor-pointer",
                  )}
                >
                  <span
                    className={cn(
                      "w-[6ch] flex-none text-xs font-medium",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="min-w-0 flex-1 font-mono text-sm break-all tabular-nums">
                    {value ?? <span className="text-muted-foreground">—</span>}
                  </span>
                  {active && <span className="text-muted-foreground flex-none text-xs">in</span>}
                </button>
                {value && (
                  <CopyButton
                    content={value}
                    shape="icon"
                    aria-label={`Copy ${s.label}`}
                    className="-mr-2 [&>span]:sr-only"
                  />
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
