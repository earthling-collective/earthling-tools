"use client";

import { useEffect, useState } from "react";
import { Button } from "earthling-ui/button";
import { Switch } from "earthling-ui/switch";
import { cn } from "earthling-ui/utils/cn";
import {
  CopyButton,
  Field,
  NumberInput,
  Panel,
  PanelHeader,
  Prose,
  Toolbar,
  ToolHeader,
  ToolSelect,
  Workbench,
} from "@/components/tool";
import { swapUrl } from "@/lib/swap-url";
import { generators, getGenerator, type GeneratorOption, type GeneratorOptions } from "./generators";

type NumberOption = Extract<GeneratorOption, { type: "number" }>;

const defaultsFor = (slug: string): GeneratorOptions =>
  Object.fromEntries((getGenerator(slug)?.options ?? []).map((o) => [o.key, o.defaultValue]));

// Free typing, but only commit values that are already in range so results stay live
function NumberField({
  opt,
  value,
  onChange,
}: {
  opt: NumberOption;
  value: number;
  onChange: (n: number) => void;
}) {
  const [draft, setDraft] = useState(`${value}`);
  useEffect(() => setDraft(`${value}`), [value]);

  const clamp = (n: number) => Math.min(opt.max, Math.max(opt.min, Math.round(n)));

  return (
    <div className="flex flex-col gap-2">
      <Field label={opt.label} className="justify-between gap-4">
        <NumberInput
          value={draft}
          min={opt.min}
          max={opt.max}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            const n = Number(raw);
            if (raw !== "" && Number.isFinite(n) && n === clamp(n)) onChange(n);
          }}
          onBlur={() => {
            const n = Number(draft);
            const next = draft !== "" && Number.isFinite(n) ? clamp(n) : value;
            setDraft(`${next}`);
            onChange(next);
          }}
        />
      </Field>
      {opt.presets && (
        <div className="flex flex-wrap gap-1.5">
          {opt.presets.map((p) => (
            <Button
              key={p}
              material="outline"
              scheme="neutral"
              size="sm"
              aria-pressed={value === p}
              className="aria-pressed:bg-muted px-2.5 font-mono tabular-nums aria-pressed:border-current/25"
              onClick={() => onChange(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// One component serves every /generate/[slug] page
export function GenerateTool({ initialSlug }: { initialSlug: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [allOptions, setAllOptions] = useState<Record<string, GeneratorOptions>>(() =>
    Object.fromEntries(generators.map((g) => [g.slug, defaultsFor(g.slug)])),
  );
  const [results, setResults] = useState<string[]>([]);
  const [nonce, setNonce] = useState(0);

  const generator = getGenerator(slug) ?? generators[0];
  const options = allOptions[generator.slug];
  const isColor = generator.slug === "hex-color";

  // Random output can't render on the server, so generate after mount
  useEffect(() => setResults(generator.generate(options)), [generator, options, nonce]);

  const setOption = (key: string, value: number | boolean) =>
    setAllOptions((prev) => ({ ...prev, [generator.slug]: { ...prev[generator.slug], [key]: value } }));

  return (
    <div>
      <ToolHeader title={generator.title} description={generator.description} />

      <Toolbar
        className="mt-8"
        actions={
          <Button className="gap-2" onClick={() => setNonce((n) => n + 1)}>
            <i aria-hidden="true" className="icon-[lucide--refresh-cw]" />
            Regenerate
          </Button>
        }
      >
        <Field label="Generator">
          <ToolSelect
            aria-label="Generator"
            value={generator.slug}
            onValueChange={(v) => {
              setSlug(v);
              swapUrl(`/generate/${v}`);
            }}
            options={generators.map((g) => ({ value: g.slug, label: g.label }))}
          />
        </Field>
      </Toolbar>

      <Workbench className="mt-4">
        <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
          <Panel>
            <PanelHeader label="Options" />
            <div className="flex flex-col gap-4 p-4">
              {generator.options.map((opt) =>
                opt.type === "number" ? (
                  <NumberField
                    key={opt.key}
                    opt={opt}
                    value={options[opt.key] as number}
                    onChange={(n) => setOption(opt.key, n)}
                  />
                ) : (
                  <Field key={opt.key} label={opt.label} className="justify-between gap-4">
                    <Switch checked={!!options[opt.key]} onCheckedChange={(v) => setOption(opt.key, v)} />
                  </Field>
                ),
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader label="Output" meta={results.length > 1 ? `${results.length} results` : undefined}>
              {results.length > 1 && (
                <CopyButton content={results.join("\n")} className="-mr-2">
                  Copy all
                </CopyButton>
              )}
            </PanelHeader>
            {results.length === 0 ? (
              <div className="text-muted-foreground flex min-h-32 items-center justify-center p-8 text-center text-sm">
                Enable at least one option to generate.
              </div>
            ) : (
              <div aria-live="polite" className="flex flex-col divide-y">
                {results.map((value, i) => (
                  <div
                    key={i}
                    className="group hover:bg-muted/40 flex items-center gap-3 px-4 py-1.5 transition-colors"
                  >
                    <span className="text-muted-foreground w-[2ch] flex-none text-right font-mono text-[11px] tabular-nums">
                      {i + 1}
                    </span>
                    {isColor && (
                      <span
                        aria-hidden="true"
                        className="size-5 flex-none rounded border"
                        style={{ backgroundColor: value }}
                      />
                    )}
                    <div
                      className={cn(
                        "flex-1 py-1.5 text-sm break-all select-all",
                        generator.mono && "font-mono tabular-nums",
                      )}
                    >
                      {value}
                    </div>
                    <CopyButton
                      content={value}
                      shape="icon"
                      aria-label={`Copy result ${i + 1}`}
                      className="-mr-2 opacity-50 transition-opacity group-hover:opacity-100"
                    >
                      {null}
                    </CopyButton>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </Workbench>

      {/* Follows the generator select */}
      {generator.about && (
        <Prose>
          <h2>How it works</h2>
          <p>{generator.about}</p>
        </Prose>
      )}
    </div>
  );
}
