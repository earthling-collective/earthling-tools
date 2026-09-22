"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "earthling-ui/button";
import { Input } from "earthling-ui/input";
import { Label } from "earthling-ui/label";

const sha256 = async (text: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
};

// Cosine palette from the shader palette tool, sampled into a CSS gradient
const palette = [
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1, 1, 1],
  [0, 0.33, 0.67],
];
const channel = (c: number, t: number) =>
  Math.round(
    255 *
      Math.min(
        1,
        Math.max(0, palette[0][c] + palette[1][c] * Math.cos(6.28318 * (palette[2][c] * t + palette[3][c]))),
      ),
  );
const gradient = `linear-gradient(90deg, ${Array.from({ length: 12 }, (_, i) => {
  const t = i / 11;
  return `rgb(${channel(0, t)} ${channel(1, t)} ${channel(2, t)})`;
}).join(", ")})`;

function Card({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="bg-background rounded-xl border p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="truncate text-sm font-medium">{title}</h2>
        <Link
          href={href}
          aria-label={`Open ${title} tool`}
          className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-xs"
        >
          <span className="hidden lg:inline">Open tool</span>
          <i aria-hidden="true" className="icon-[lucide--arrow-up-right] size-3.5" />
        </Link>
      </div>
      {children}
    </div>
  );
}

// Live sampler for the home page: a few tools doing real work in the page
export function Specimen() {
  const [text, setText] = useState("earthling");
  const [hash, setHash] = useState("");
  const [uuid, setUuid] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    sha256(text).then(setHash);
  }, [text]);
  useEffect(() => {
    setUuid(crypto.randomUUID());
    const tick = () => setNow(Math.floor(Date.now() / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="preview-canvas rounded-2xl border p-5 sm:p-7">
      <div className="text-muted-foreground mb-6 flex items-center justify-between gap-3 text-xs">
        <span>Built with Earthling UI</span>
        <span className="flex items-center gap-2">
          <span className="bg-good size-1.5 rounded-full" />
          Running in this tab
        </span>
      </div>
      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
        <Card title="SHA-256" href="/hash/sha256">
          <Label htmlFor="specimen-text" className="mb-2 block text-xs">
            Text to hash
          </Label>
          <Input
            id="specimen-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="font-mono"
          />
          <code className="text-muted-foreground mt-4 block font-mono text-xs leading-5 break-all">
            {hash || " "}
          </code>
        </Card>
        <div className="grid gap-5">
          <Card title="UUID v4" href="/generate/uuid">
            <div className="flex items-center gap-2">
              <code className="bg-muted/50 flex h-9 min-w-0 flex-1 items-center truncate rounded-lg border px-3 font-mono text-xs">
                {uuid}
              </code>
              <Button
                material="outline"
                scheme="neutral"
                size="sm"
                shape="icon"
                aria-label="New UUID"
                onClick={() => setUuid(crypto.randomUUID())}
              >
                <i aria-hidden="true" className="icon-[lucide--refresh-cw]" />
              </Button>
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-5">
            <Card title="Unix time" href="/timestamp">
              <span className="font-mono text-lg tabular-nums">{now || "…"}</span>
            </Card>
            <Card title="Palette" href="/palette">
              <div className="h-7 rounded-md border" style={{ background: gradient }} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
