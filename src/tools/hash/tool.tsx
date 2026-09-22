"use client";

import { useEffect, useState } from "react";
import { Button } from "earthling-ui/button";
import { TextArea } from "earthling-ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "earthling-ui/toggle-group";
import {
  CopyButton,
  Field,
  Panel,
  PanelHeader,
  Prose,
  Toolbar,
  ToolHeader,
  ToolSelect,
  Workbench,
} from "@/components/tool";
import { swapUrl } from "@/lib/swap-url";
import { getHashAlgo, hashAlgos } from "./hashes";

const algoOptions = hashAlgos.map((a) => ({ value: a.slug, label: a.label }));

// One component serves every /hash/[algo] page. The input is never mirrored to
// the URL on purpose: hashed text is often a secret.
export function HashTool({ initialAlgo }: { initialAlgo?: string }) {
  const [algoSlug, setAlgoSlug] = useState(initialAlgo ?? "sha256");
  const algo = getHashAlgo(algoSlug) ?? hashAlgos[2];

  const [input, setInput] = useState("Hello, World!");
  const [casing, setCasing] = useState<"lower" | "upper">("lower");
  const [digests, setDigests] = useState<Record<string, string>>({});

  // WebCrypto is async, so all digests land together in one effect
  useEffect(() => {
    let stale = false;
    Promise.all(hashAlgos.map(async (a) => [a.slug, await a.digest(input)] as const)).then((entries) => {
      if (!stale) setDigests(Object.fromEntries(entries));
    });
    return () => {
      stale = true;
    };
  }, [input]);

  const cased = (s: string | undefined) =>
    s === undefined ? undefined : casing === "upper" ? s.toUpperCase() : s;
  const result = cased(digests[algo.slug]);

  return (
    <div>
      <ToolHeader
        title={`${algo.label} Hash Generator`}
        description={`Type or paste text and get its ${algo.label} digest instantly. Hashing runs entirely in the browser, so nothing is sent anywhere.`}
      />

      <Toolbar className="mt-8">
        <Field label="Algorithm">
          <ToolSelect
            value={algo.slug}
            onValueChange={(slug) => {
              setAlgoSlug(slug);
              swapUrl(`/hash/${slug}`);
            }}
            options={algoOptions}
            aria-label="Hash algorithm"
          />
        </Field>
        <Field label="Case">
          <ToggleGroup
            type="single"
            size="sm"
            value={casing}
            onValueChange={(v) => v && setCasing(v as "lower" | "upper")}
            aria-label="Digest case"
          >
            <ToggleGroupItem value="lower" size="sm" className="font-mono">
              abc
            </ToggleGroupItem>
            <ToggleGroupItem value="upper" size="sm" className="font-mono">
              ABC
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>
      </Toolbar>

      <Workbench className="mt-4">
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <Panel>
            <PanelHeader label="Input" meta={`${input.length} chars`}>
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
              spellCheck={false}
              aria-label="Text to hash"
              placeholder="Type or paste text to hash"
              className="min-h-[280px] flex-1 resize-none rounded-none border-0 bg-transparent p-4 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </Panel>

          <div className="flex min-w-0 flex-col gap-4">
            <Panel>
              <PanelHeader label={algo.label} meta={`${algo.bits} bits`}>
                {result && <CopyButton content={result} className="-mr-2" />}
              </PanelHeader>
              <div aria-live="polite" className="p-4 font-mono text-sm break-all select-all">
                {result ?? <span className="text-muted-foreground">…</span>}
              </div>
              {algo.note && <p className="text-muted-foreground border-t px-4 py-3 text-xs">{algo.note}</p>}
            </Panel>

            <Panel className="flex-1">
              <PanelHeader label="All algorithms" />
              <div className="flex flex-col divide-y">
                {hashAlgos.map((a) => (
                  <div
                    key={a.slug}
                    className="hover:bg-muted/40 flex items-center gap-3 px-4 py-1.5 transition-colors"
                  >
                    <span className="text-muted-foreground w-[8ch] flex-none text-xs font-medium">
                      {a.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-xs select-all">
                      {cased(digests[a.slug]) ?? "…"}
                    </span>
                    {digests[a.slug] && (
                      <CopyButton
                        content={cased(digests[a.slug])!}
                        shape="icon"
                        aria-label={`Copy ${a.label}`}
                        className="-mr-2 flex-none [&>span]:sr-only"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </Workbench>

      <Prose>
        <h2>About {algo.label}</h2>
        <p>{algo.about}</p>
        <p>
          Digests here are computed with the browser&apos;s WebCrypto API; MD5 runs locally in JavaScript,
          since WebCrypto dropped it. A hash is one-way: the same input always produces the same {algo.bits}
          -bit digest, but the digest cannot be reversed back into the input. Text entered here never leaves
          the page.
        </p>
      </Prose>
    </div>
  );
}
