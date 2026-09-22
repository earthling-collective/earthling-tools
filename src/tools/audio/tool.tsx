"use client";

import { useEffect, useState } from "react";
import { Button } from "earthling-ui/button";
import { Progress } from "earthling-ui/progress";
import { cn } from "earthling-ui/utils/cn";
import {
  Field,
  FileDrop,
  Panel,
  PanelHeader,
  Prose,
  ToolHeader,
  ToolSelect,
  Workbench,
} from "@/components/tool";
import { downloadFile, prettySize } from "@/lib/files";
import { swapUrl } from "@/lib/swap-url";
import { convertAudio, isFFmpegLoaded, loadFFmpeg } from "./ffmpeg";
import { audioOutputs, bitrates, detectAudioFormat, getAudioFormat } from "./formats";

type Phase = "idle" | "loading" | "converting";
type Result = { blob: Blob; url: string; name: string };

// One component serves /audio and every /audio/[pair] page
export function AudioTool({ initialFrom, initialTo }: { initialFrom?: string; initialTo?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [fromSlug, setFromSlug] = useState(initialFrom ?? "");
  const [toSlug, setToSlug] = useState(initialTo ?? "mp3");
  const [kbps, setKbps] = useState(192);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const from = getAudioFormat(fromSlug);
  const to = getAudioFormat(toSlug) ?? audioOutputs[0];
  const fromVideo = from?.inputOnly ?? false;
  const busy = phase !== "idle";
  const percent = Math.round(progress * 100);

  // The preview URL outlives a render, so release it when the result changes or the page unmounts
  useEffect(() => () => void (result && URL.revokeObjectURL(result.url)), [result]);

  // Mirror the chosen pair into the address bar so the URL stays shareable
  const syncUrl = (nextFrom: string, nextTo: string) => {
    if (nextFrom && nextTo && nextFrom !== nextTo) swapUrl(`/audio/${nextFrom}-to-${nextTo}`);
  };

  const reset = () => {
    setResult(null);
    setError("");
  };

  const convert = async () => {
    if (!file) return;
    reset();
    setProgress(0);
    try {
      if (!isFFmpegLoaded()) {
        // First run pulls the ~31 MB wasm core
        setPhase("loading");
        await loadFFmpeg();
      }
      setPhase("converting");
      const blob = await convertAudio(file, to, kbps, setProgress);
      const base = file.name.split(".").slice(0, -1).join(".") || file.name;
      setResult({ blob, url: URL.createObjectURL(blob), name: `${base}.${to.slug}` });
    } catch {
      setError("Conversion failed. Try a different file.");
    } finally {
      setPhase("idle");
    }
  };

  return (
    <div>
      <ToolHeader
        title={
          from
            ? fromVideo
              ? `Extract ${to.label} Audio from ${from.label}`
              : `Convert ${from.label} to ${to.label}`
            : "Audio Converter"
        }
        description={`Free online audio converter. ${
          from
            ? fromVideo
              ? `Pull the audio out of ${from.label} video as ${to.label} `
              : `Turn ${from.label} audio into ${to.label} `
            : "Convert between MP3, WAV, AIFF, FLAC, OGG, M4A and Opus — or extract audio from video — "
        }right in the browser. Files are never uploaded anywhere.`}
      />

      <Workbench className="mt-8">
        <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
          <div className="flex flex-col gap-4">
            <FileDrop
              file={file}
              onFile={(f) => {
                setFile(f);
                reset();
                if (!f) return;
                const detected = detectAudioFormat(f);
                if (!detected) return;
                setFromSlug(detected.slug);
                // Keep from/to distinct so the pair URL stays valid
                const nextTo =
                  detected.slug === to.slug
                    ? (audioOutputs.find((x) => x.slug !== detected.slug)?.slug ?? to.slug)
                    : to.slug;
                setToSlug(nextTo);
                syncUrl(detected.slug, nextTo);
              }}
              // Explicit extensions because Windows often reports no MIME for aiff/flac
              accept="audio/*,video/*,.aiff,.aif,.aifc,.flac,.opus,.mkv"
              icon="icon-[lucide--file-audio]"
              hint="Choose an audio or video file, or drop it here"
            />

            {phase === "converting" && (
              <Panel>
                <PanelHeader label="Converting" />
                <div className="flex items-center gap-3 p-4">
                  <Progress value={percent} className="flex-1" />
                  <span
                    aria-live="polite"
                    className="text-muted-foreground w-[4ch] text-right font-mono text-xs tabular-nums"
                  >
                    {percent}%
                  </span>
                </div>
              </Panel>
            )}

            {result && !busy && (
              <Panel>
                <PanelHeader label="Result" meta={prettySize(result.blob.size)} />
                <div aria-live="polite" className="flex flex-col gap-3 p-4">
                  <div className="truncate text-sm font-medium">{result.name}</div>
                  <audio controls src={result.url} className="w-full" />
                  <Button
                    material="outline"
                    scheme="neutral"
                    className="gap-2 self-start"
                    onClick={() => downloadFile(result.blob, result.name, to.mime)}
                  >
                    <i aria-hidden="true" className="icon-[lucide--download]" />
                    Download
                  </Button>
                </div>
              </Panel>
            )}
          </div>

          <Panel className={cn(error && "border-bad/40")}>
            <PanelHeader label="Settings" />
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Field label="Format" className="justify-between gap-4">
                <ToolSelect
                  aria-label="Output format"
                  className="min-w-0 flex-1"
                  value={to.slug}
                  onValueChange={(v) => {
                    setToSlug(v);
                    reset();
                    syncUrl(fromSlug, v);
                  }}
                  options={audioOutputs
                    .filter((f) => f.slug !== fromSlug)
                    .map((f) => ({ value: f.slug, label: f.label }))}
                />
              </Field>
              {to.lossy && (
                <Field label="Bitrate" className="justify-between gap-4">
                  <ToolSelect
                    aria-label="Bitrate"
                    className="min-w-0 flex-1"
                    value={`${kbps}`}
                    onValueChange={(v) => {
                      setKbps(Number(v));
                      reset();
                    }}
                    options={bitrates.map((b) => ({ value: `${b}`, label: `${b} kbps` }))}
                  />
                </Field>
              )}
              <Button
                className="mt-auto w-full gap-2"
                disabled={!file || busy}
                loading={busy}
                onClick={convert}
              >
                <i aria-hidden="true" className="icon-[lucide--arrow-right-left]" />
                {phase === "loading" ? "Loading converter…" : "Convert"}
              </Button>
            </div>
            {error && <div className="text-bad border-t px-4 py-3 text-sm">{error}</div>}
          </Panel>
        </div>
      </Workbench>

      {/* Follows the selects and whatever file gets dropped in */}
      <Prose>
        {from && (
          <>
            <h2>
              About {from.label} and {to.label}
            </h2>
            <p>{from.about}</p>
            <p>{to.about}</p>
            <p>
              {fromVideo
                ? `Extracting audio from ${from.label} re-encodes only the audio track — the video is discarded, so even long files finish quickly.`
                : to.lossy
                  ? `Converting ${from.label} to ${to.label} is lossy. 192 kbps is transparent for most listeners on most material; pick 320 kbps for the ceiling, or drop lower when small files matter more than fidelity.`
                  : from.lossy
                    ? `Converting ${from.label} to ${to.label} produces a lossless file, though detail already discarded by ${from.label}'s compression cannot be recovered — the new file is a faithful copy of the ${from.label}, not of the original recording.`
                    : `Converting ${from.label} to ${to.label} is lossless in both directions — the audio comes through bit-perfect, so files can move back and forth without generational loss.`}
            </p>
          </>
        )}
        <h2>How the conversion works</h2>
        <p>
          This tool runs FFmpeg — the same engine behind most media software — compiled to WebAssembly,
          entirely in the browser. The file is read locally, converted locally and saved straight from memory;
          nothing is ever uploaded, which also means no queues and no server-side file size limits.
        </p>
        <p>
          The converter itself is a one-time ~31 MB download on the first conversion, cached by the browser
          afterwards. Once it is loaded, everything works offline.
        </p>
      </Prose>
    </div>
  );
}
