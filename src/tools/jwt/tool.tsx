"use client";

import { useEffect, useState } from "react";
import { Badge } from "earthling-ui/badge";
import { Button } from "earthling-ui/button";
import { TextArea } from "earthling-ui/textarea";
import { CopyButton, Panel, PanelHeader, ToolHeader, Workbench } from "@/components/tool";
import { CLAIM_LABELS, SAMPLE_JWT, TIME_CLAIMS, decodeJwt, jwtStatus } from "./jwt";

const timeFmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const relativeFmt = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
  ["second", 1],
];

const formatTime = (seconds: number) => timeFmt.format(new Date(seconds * 1000));

const formatRelative = (seconds: number, now: Date) => {
  const delta = seconds - now.getTime() / 1000;
  const [unit, size] = UNITS.find(([, s]) => Math.abs(delta) >= s) ?? UNITS[UNITS.length - 1];
  return relativeFmt.format(Math.round(delta / size), unit);
};

const asNumber = (value: unknown) => (typeof value === "number" ? value : null);

function ClaimRows({ data, now }: { data: Record<string, unknown>; now: Date | null }) {
  return (
    <div className="flex flex-col divide-y">
      {Object.entries(data).map(([key, value]) => {
        const time = TIME_CLAIMS.includes(key) ? asNumber(value) : null;
        return (
          <div key={key} className="flex flex-row gap-4 px-4 py-2.5">
            <div className="w-[6.5rem] flex-none">
              <div className="font-mono text-sm">{key}</div>
              {CLAIM_LABELS[key] && (
                <div className="text-muted-foreground text-xs leading-5">{CLAIM_LABELS[key]}</div>
              )}
            </div>
            <div className="min-w-0 flex-1 font-mono text-sm break-all select-all">
              {typeof value === "string" ? value : JSON.stringify(value)}
              {time !== null && now && (
                <span className="text-muted-foreground mt-0.5 block text-xs tabular-nums">
                  {formatTime(time)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// No URL sync anywhere in here: tokens are credentials, they stay put
export function JwtTool() {
  const [input, setInput] = useState("");
  const decoded = input.trim() ? decodeJwt(input) : null;

  // The client clock only matters for time claims, so those render post-mount
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const invalid = decoded !== null && !decoded.ok;
  const payload = decoded?.ok ? decoded.payload : null;
  const status = payload && now ? jwtStatus(payload, now) : null;

  const alg = decoded?.ok && typeof decoded.header.alg === "string" ? decoded.header.alg : null;
  const exp = payload ? asNumber(payload.exp) : null;
  const nbf = payload ? asNumber(payload.nbf) : null;
  const iat = payload ? asNumber(payload.iat) : null;

  const expiry: { scheme: "good" | "bad" | "muted"; label: string } = !status
    ? { scheme: "muted", label: "No expiry" }
    : status.label === "expired"
      ? { scheme: "bad", label: `Expired ${exp !== null ? formatTime(exp) : ""}`.trim() }
      : status.label === "not valid yet"
        ? { scheme: "bad", label: `Not valid until ${nbf !== null ? formatTime(nbf) : ""}`.trim() }
        : { scheme: "good", label: `Valid until ${exp !== null ? formatTime(exp) : ""}`.trim() };

  return (
    <>
      <ToolHeader
        title="JWT Decoder"
        description="Paste a JSON Web Token to inspect its header and claims. Decoding happens entirely in the browser: the token is never sent anywhere, and signatures are not verified."
      />

      <Workbench className="mt-8">
        <Panel className={invalid ? "border-bad/40" : undefined}>
          <PanelHeader label="Token">
            <Button
              material="ghost"
              scheme="neutral"
              size="sm"
              className="gap-1.5"
              onClick={() => setInput(SAMPLE_JWT)}
            >
              <i aria-hidden="true" className="icon-[lucide--flask-conical]" />
              Sample
            </Button>
            <Button
              material="ghost"
              scheme="neutral"
              size="sm"
              disabled={!input}
              className="-mr-2 gap-1.5"
              onClick={() => setInput("")}
            >
              <i aria-hidden="true" className="icon-[lucide--x]" />
              Clear
            </Button>
          </PanelHeader>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            aria-label="JWT to decode"
            placeholder="eyJhbGciOi..."
            className="min-h-[140px] flex-1 resize-none rounded-none border-0 bg-transparent p-4 font-mono text-sm break-all focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {invalid && (
            <p className="text-bad border-t px-4 py-3 text-sm">Can&apos;t decode that — {decoded.error}</p>
          )}
        </Panel>

        {decoded?.ok && (
          <>
            <div aria-live="polite" className="flex flex-wrap items-center gap-2 px-1">
              <Badge scheme="muted">{alg ?? "unknown algorithm"}</Badge>
              <Badge scheme={expiry.scheme}>{expiry.label}</Badge>
              {iat !== null && now && (
                <span className="text-muted-foreground text-xs">issued {formatRelative(iat, now)}</span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Panel>
                <PanelHeader label="Header">
                  <CopyButton content={JSON.stringify(decoded.header, null, 2)} className="-mr-2">
                    Copy JSON
                  </CopyButton>
                </PanelHeader>
                <ClaimRows data={decoded.header} now={now} />
              </Panel>

              <Panel>
                <PanelHeader label="Payload">
                  <CopyButton content={JSON.stringify(decoded.payload, null, 2)} className="-mr-2">
                    Copy JSON
                  </CopyButton>
                </PanelHeader>
                <ClaimRows data={decoded.payload} now={now} />
              </Panel>
            </div>

            <Panel>
              <PanelHeader label="Signature" meta="not verified" />
              <div className="text-muted-foreground p-4 font-mono text-sm break-all">
                {decoded.signature || "(empty)"}
              </div>
              <p className="text-muted-foreground border-t px-4 py-3 text-sm">
                This tool only decodes. Verifying needs the signing key, which should never be pasted into a
                website.
              </p>
            </Panel>
          </>
        )}
      </Workbench>
    </>
  );
}
