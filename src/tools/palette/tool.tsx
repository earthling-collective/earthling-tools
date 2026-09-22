"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "earthling-ui/button";
import { Slider } from "earthling-ui/slider";
import { Code } from "@/components/code";
import { NumberInput, Panel, PanelHeader, ToolHeader, Toolbar, Workbench } from "@/components/tool";
import { swapUrl } from "@/lib/swap-url";
import { parsePaletteParam, toPaletteParam } from "./param";
import { ShaderCanvas } from "./shader-canvas";
import { exampleFrags, stripFrag } from "./shaders";

// Inigo Quilez's default cosine palette
const DEFAULT: number[][] = [
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1, 1, 1],
  [0, 0.33, 0.67],
];

const VECTORS = ["a", "b", "c", "d"];
const CHANNELS = ["Red", "Green", "Blue"];
const STORAGE_KEY = "earthling-palette-saved";

const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);
const round2 = (x: number) => Math.round(x * 100) / 100;

// Saved palettes live in localStorage only; nothing leaves the browser
function useSavedPalettes() {
  const [saved, setSaved] = useState<number[][][]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) setSaved(parsed);
    } catch {}
  }, []);

  const write = (next: number[][][]) => {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  return {
    saved,
    save: (palette: number[][]) => write([...saved, palette]),
    remove: (index: number) => write(saved.filter((_, i) => i !== index)),
  };
}

export function PaletteTool() {
  const [palette, setPalette] = useState<number[][]>(DEFAULT);
  const { saved, save, remove } = useSavedPalettes();

  // Hydrate from ?p= client-side so the page stays static
  useEffect(() => {
    const parsed = parsePaletteParam(new URLSearchParams(window.location.search).get("p"));
    if (parsed) setPalette(parsed);
  }, []);

  // Mirror the palette into the address bar so it is always shareable; the
  // debounce keeps slider drags off the history API rate limit
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => swapUrl(`/palette?p=${toPaletteParam(palette)}`), 150);
    return () => clearTimeout(timer);
  }, [palette]);

  const setValue = (row: number, col: number, value: number) =>
    setPalette((p) => p.map((r, i) => (i === row ? r.map((v, c) => (c === col ? clamp01(value) : v)) : r)));

  const randomize = () => setPalette(DEFAULT.map((row) => row.map(() => round2(Math.random()))));

  const code = `// https://tools.earthling.dev/palette?p=${toPaletteParam(palette)}
vec3 palette(float t){
  vec3 a=vec3(${palette[0].join(",")});
  vec3 b=vec3(${palette[1].join(",")});
  vec3 c=vec3(${palette[2].join(",")});
  vec3 d=vec3(${palette[3].join(",")});
  return a+b*cos(6.28318*(c*t+d));
}`;

  return (
    <>
      <ToolHeader
        title="Shader Palette Generator"
        description="Design cosine-based color palettes for GLSL shaders. Drag the twelve parameters, watch four live shaders react, then copy the palette function straight into your code."
      />

      <Toolbar
        className="mt-8"
        actions={
          <>
            <Button material="outline" scheme="neutral" className="gap-1.5" onClick={randomize}>
              <i aria-hidden="true" className="icon-[lucide--dices]" />
              Randomize
            </Button>
            <Button material="outline" scheme="neutral" className="gap-1.5" onClick={() => save(palette)}>
              <i aria-hidden="true" className="icon-[lucide--bookmark-plus]" />
              Save palette
            </Button>
          </>
        }
      />

      <Workbench className="mt-4">
        <Panel>
          <PanelHeader label="Palette" meta="a + b·cos(2π(c·t + d))" />
          <div className="p-4">
            <div className="h-16 overflow-hidden rounded-lg border">
              <ShaderCanvas frag={stripFrag} palette={palette} />
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader label="Parameters" />
          <div className="grid gap-6 p-4 md:grid-cols-3">
            {CHANNELS.map((channel, col) => (
              <div key={channel} className="flex flex-col gap-3">
                <span className="text-muted-foreground text-xs font-medium">{channel}</span>
                {VECTORS.map((vector, row) => (
                  <div key={vector} className="flex items-center gap-3">
                    <span className="text-muted-foreground w-3 flex-none font-mono text-sm">{vector}</span>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[palette[row][col]]}
                      thumbLabels={[`${vector} ${channel.toLowerCase()}`]}
                      onValueChange={([value]) => setValue(row, col, value)}
                      className="flex-1"
                    />
                    <NumberInput
                      min={0}
                      max={1}
                      step={0.01}
                      value={palette[row][col]}
                      aria-label={`${vector} ${channel.toLowerCase()} value`}
                      onChange={(e) => setValue(row, col, parseFloat(e.target.value))}
                      className="w-20 flex-none text-center"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader label="Examples" />
          <div className="grid grid-cols-2 gap-4 p-4">
            {exampleFrags.map((example, i) => (
              <figure key={example.label} className="m-0 flex flex-col gap-1.5">
                <div className="aspect-video overflow-hidden rounded-lg border">
                  <ShaderCanvas frag={example.frag} palette={palette} seed={i * 0.37} />
                </div>
                <figcaption className="text-muted-foreground font-mono text-xs">{example.label}</figcaption>
              </figure>
            ))}
          </div>
        </Panel>
      </Workbench>

      <Code language="glsl" label="palette.glsl" className="mt-4">
        {code}
      </Code>

      <Panel className="mt-4">
        <PanelHeader label="Saved palettes" meta={saved.length ? `${saved.length}` : undefined} />
        {saved.length === 0 ? (
          <p className="text-muted-foreground flex min-h-32 items-center justify-center px-4 text-center text-sm">
            Saved palettes are kept in this browser only. Save one to come back to it later.
          </p>
        ) : (
          <div className="flex flex-col divide-y">
            {saved.map((entry, i) => (
              <div key={`${entry.flat().join(",")}-${i}`} className="flex items-center gap-3 p-3">
                <div className="h-10 flex-1 overflow-hidden rounded-lg border">
                  <ShaderCanvas frag={stripFrag} palette={entry} paused />
                </div>
                <Button
                  material="ghost"
                  scheme="neutral"
                  size="sm"
                  aria-label={`Load saved palette ${i + 1}`}
                  onClick={() => setPalette(entry)}
                >
                  Load
                </Button>
                <Button
                  material="ghost"
                  scheme="neutral"
                  size="sm"
                  shape="icon"
                  aria-label={`Delete saved palette ${i + 1}`}
                  onClick={() => remove(i)}
                >
                  <i aria-hidden="true" className="icon-[lucide--trash-2]" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
