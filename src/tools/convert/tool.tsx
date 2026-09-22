"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "earthling-ui/button";
import { Slider } from "earthling-ui/slider";
import { cn } from "earthling-ui/utils/cn";
import { Field, FileDrop, Panel, PanelHeader, ToolHeader, ToolSelect, Workbench } from "@/components/tool";
import { downloadFile, prettySize } from "@/lib/files";
import { swapUrl } from "@/lib/swap-url";
import { getFormat, getFormatByMime, outputFormats } from "./formats";
import { baseName, encodableMimes, encodeCanvas, loadImageFile } from "./image";

type Result = { blob: Blob; url: string; name: string; width: number; height: number };

// Serves /convert and every /convert/[pair] page
export function ConvertTool({ initialFrom, initialTo }: { initialFrom?: string; initialTo?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [fromSlug, setFromSlug] = useState(initialFrom ?? "");
  const [toSlug, setToSlug] = useState(initialTo ?? "webp");
  const [quality, setQuality] = useState(80);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [encodable, setEncodable] = useState<Set<string> | null>(null);

  const from = getFormat(fromSlug);
  const to = getFormat(toSlug) ?? outputFormats[2];
  const writable = encodable === null || encodable.has(to.mime);

  const sourceUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => void (sourceUrl && URL.revokeObjectURL(sourceUrl)), [sourceUrl]);
  useEffect(() => () => void (result && URL.revokeObjectURL(result.url)), [result]);

  useEffect(() => {
    encodableMimes(outputFormats.map((f) => f.mime)).then(setEncodable);
  }, []);

  const reset = () => {
    setResult(null);
    setError("");
  };

  const syncUrl = (nextFrom: string, nextTo: string) => {
    if (nextFrom && nextTo && nextFrom !== nextTo) swapUrl(`/convert/${nextFrom}-to-${nextTo}`);
  };

  const pickFile = (next: File | null) => {
    setFile(next);
    reset();
    if (!next) return;
    const detected = getFormatByMime(next.type);
    if (!detected) return;
    setFromSlug(detected.slug);
    // Keep from and to distinct so the pair URL stays valid
    const nextTo =
      detected.slug === to.slug
        ? (outputFormats.find((f) => f.slug !== detected.slug)?.slug ?? to.slug)
        : to.slug;
    setToSlug(nextTo);
    syncUrl(detected.slug, nextTo);
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const img = await loadImageFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0);
      const blob = await encodeCanvas(canvas, to.mime, to.lossy ? quality / 100 : undefined);
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        name: `${baseName(file.name)}.${to.slug}`,
        width: canvas.width,
        height: canvas.height,
      });
    } catch (e) {
      setError(
        (e as Error).message === "unsupported"
          ? `This browser cannot write ${to.label} files. Choose another format.`
          : "That file could not be converted. Try a different image.",
      );
    } finally {
      setBusy(false);
    }
  };

  const saved = result && file ? Math.round((1 - result.blob.size / file.size) * 100) : 0;
  const message =
    error || (writable ? "" : `This browser cannot write ${to.label} files. Choose another format.`);

  return (
    <div>
      <ToolHeader
        title={from ? `Convert ${from.label} to ${to.label}` : "Image Converter"}
        description={`Free online image converter. ${
          from
            ? `Turn ${from.label} images into ${to.label} `
            : "Convert between PNG, JPG and WebP, or from AVIF, "
        }in seconds. Every file is converted in the browser and never uploaded.`}
      />

      <Workbench className="mt-8">
        <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
          <div className="flex min-w-0 flex-col gap-4">
            <FileDrop
              file={file}
              onFile={pickFile}
              accept="image/*"
              hint="Drop an image or click to choose"
              icon="icon-[lucide--image-up]"
              preview
            />

            {result && file && (
              <div className="grid grid-cols-2 gap-4">
                <Panel>
                  <PanelHeader label="Source" meta={prettySize(file.size)} />
                  <ImagePreview url={sourceUrl} alt="Source image" />
                </Panel>
                <Panel>
                  <PanelHeader label="Result" meta={prettySize(result.blob.size)} />
                  <ImagePreview url={result.url} alt={`Converted ${to.label} image`} />
                </Panel>
              </div>
            )}
          </div>

          <Panel className={message ? "border-bad/40" : undefined}>
            <PanelHeader label="Settings" />
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Field label="Format" className="justify-between gap-3">
                <ToolSelect
                  aria-label="Output format"
                  value={to.slug}
                  onValueChange={(value) => {
                    setToSlug(value);
                    reset();
                    syncUrl(fromSlug, value);
                  }}
                  options={outputFormats
                    .filter((f) => f.slug !== fromSlug)
                    .map((f) => ({ value: f.slug, label: f.label }))}
                  className="min-w-0 flex-1"
                />
              </Field>

              {to.lossy && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">Quality</span>
                    <span className="font-mono text-xs tabular-nums">{quality}</span>
                  </div>
                  <Slider
                    min={1}
                    max={100}
                    step={1}
                    value={[quality]}
                    onValueChange={([value]) => {
                      setQuality(value);
                      reset();
                    }}
                    thumbLabels={["Quality"]}
                  />
                </div>
              )}

              <Button
                className="mt-auto w-full"
                disabled={!file || !writable}
                loading={busy}
                onClick={convert}
              >
                <i aria-hidden="true" className="icon-[lucide--arrow-right-left]" />
                Convert
              </Button>
            </div>

            {result && file && (
              <div className="flex flex-col gap-3 border-t p-4">
                <p aria-live="polite" className="text-muted-foreground font-mono text-xs tabular-nums">
                  {prettySize(file.size)} → {prettySize(result.blob.size)}
                  {saved > 0 && ` · ${saved}% smaller`}
                </p>
                <Button
                  material="outline"
                  scheme="neutral"
                  className="w-full"
                  onClick={() => downloadFile(result.blob, result.name)}
                >
                  <i aria-hidden="true" className="icon-[lucide--download]" />
                  Download
                </Button>
              </div>
            )}

            {message && <p className="text-bad border-t px-4 py-3 text-sm">{message}</p>}
          </Panel>
        </div>
      </Workbench>
    </div>
  );
}

// Transparency-revealing checkerboard behind an image result
export function ImagePreview({ url, alt, className }: { url: string; alt: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center p-4",
        "bg-[image:repeating-conic-gradient(color-mix(in_oklch,var(--color-foreground)_7%,transparent)_0%_25%,transparent_0%_50%)] [background-size:16px_16px]",
        className,
      )}
    >
      <img src={url} alt={alt} className="max-h-72 max-w-full object-contain" />
    </div>
  );
}
