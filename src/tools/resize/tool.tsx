"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "earthling-ui/button";
import { Slider } from "earthling-ui/slider";
import { ToggleGroup, ToggleGroupItem } from "earthling-ui/toggle-group";
import {
  Field,
  FileDrop,
  NumberInput,
  Panel,
  PanelHeader,
  ToolHeader,
  ToolSelect,
  Workbench,
} from "@/components/tool";
import { downloadFile, prettySize } from "@/lib/files";
import { ImagePreview } from "@/tools/convert/tool";
import { baseName, encodableMimes, encodeCanvas, loadImageFile } from "@/tools/convert/image";
import { fits, placeImage, resizeFormats, type Fit } from "./resize";

type Result = { blob: Blob; url: string; name: string; width: number; height: number };

export function ResizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [locked, setLocked] = useState(true);
  const [fit, setFit] = useState<Fit>("cover");
  const [formatSlug, setFormatSlug] = useState("webp");
  const [quality, setQuality] = useState(80);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [encodable, setEncodable] = useState<Set<string> | null>(null);

  const format = resizeFormats.find((f) => f.slug === formatSlug) ?? resizeFormats[0];
  const writable = encodable === null || encodable.has(format.mime);
  const aspect = natural ? natural.width / natural.height : 1;

  const sourceUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => void (sourceUrl && URL.revokeObjectURL(sourceUrl)), [sourceUrl]);
  useEffect(() => () => void (result && URL.revokeObjectURL(result.url)), [result]);

  useEffect(() => {
    encodableMimes(resizeFormats.map((f) => f.mime)).then(setEncodable);
  }, []);

  // Seed the dimension fields from the source image
  useEffect(() => {
    if (!file) {
      setNatural(null);
      return;
    }
    let cancelled = false;
    loadImageFile(file)
      .then((img) => {
        if (cancelled) return;
        setNatural({ width: img.naturalWidth, height: img.naturalHeight });
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      })
      .catch(() => !cancelled && setError("That file could not be read as an image."));
    return () => {
      cancelled = true;
    };
  }, [file]);

  const reset = () => {
    setResult(null);
    setError("");
  };

  const target = {
    width: width || (height ? Math.round(height * aspect) : 0),
    height: height || (width ? Math.round(width / aspect) : 0),
  };

  const resize = async () => {
    if (!file || !target.width || !target.height) return;
    setBusy(true);
    setError("");
    try {
      const img = await loadImageFile(file);
      const { canvas: size, draw } = placeImage(
        { width: img.naturalWidth, height: img.naturalHeight },
        target,
        fit,
      );
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, draw.x, draw.y, draw.width, draw.height);
      const blob = await encodeCanvas(canvas, format.mime, format.lossy ? quality / 100 : undefined);
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        name: `${baseName(file.name)}-${size.width}x${size.height}.${format.slug}`,
        width: size.width,
        height: size.height,
      });
    } catch (e) {
      setError(
        (e as Error).message === "unsupported"
          ? `This browser cannot write ${format.label} files. Choose another format.`
          : "That image could not be resized. Try a different file.",
      );
    } finally {
      setBusy(false);
    }
  };

  const saved = result && file ? Math.round((1 - result.blob.size / file.size) * 100) : 0;
  const message =
    error || (writable ? "" : `This browser cannot write ${format.label} files. Choose another format.`);

  return (
    <div>
      <ToolHeader
        title="Image Resizer"
        description="Free online image resizer. Scale, crop or letterbox images to exact pixel dimensions and download them as WebP, PNG or JPG, entirely in the browser."
      />

      <Workbench className="mt-8">
        <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
          <div className="flex min-w-0 flex-col gap-4">
            <FileDrop
              file={file}
              onFile={(next) => {
                setFile(next);
                reset();
              }}
              accept="image/*"
              hint="Drop an image or click to choose"
              icon="icon-[lucide--image-up]"
              preview
              meta={
                file && natural ? `${natural.width}×${natural.height} · ${prettySize(file.size)}` : undefined
              }
            />

            {result && file && (
              <div className="grid grid-cols-2 gap-4">
                <Panel>
                  <PanelHeader
                    label="Source"
                    meta={natural ? `${natural.width}×${natural.height}` : prettySize(file.size)}
                  />
                  <ImagePreview url={sourceUrl} alt="Source image" />
                </Panel>
                <Panel>
                  <PanelHeader label="Result" meta={`${result.width}×${result.height}`} />
                  <ImagePreview url={result.url} alt="Resized image" />
                </Panel>
              </div>
            )}
          </div>

          <Panel className={message ? "border-bad/40" : undefined}>
            <PanelHeader label="Settings" />
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex items-center gap-2">
                <Field label="W" className="min-w-0 flex-1 gap-2">
                  <NumberInput
                    min={1}
                    value={width || ""}
                    aria-label="Width in pixels"
                    className="w-full min-w-0"
                    onChange={(e) => {
                      const next = parseInt(e.target.value) || 0;
                      setWidth(next);
                      if (locked && next) setHeight(Math.round(next / aspect));
                      reset();
                    }}
                  />
                </Field>
                <Button
                  material="ghost"
                  scheme="neutral"
                  size="sm"
                  shape="icon"
                  aria-label={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                  aria-pressed={locked}
                  className={locked ? "flex-none" : "text-muted-foreground flex-none"}
                  onClick={() => setLocked((l) => !l)}
                >
                  <i
                    aria-hidden="true"
                    className={locked ? "icon-[lucide--lock]" : "icon-[lucide--lock-open]"}
                  />
                </Button>
                <Field label="H" className="min-w-0 flex-1 gap-2">
                  <NumberInput
                    min={1}
                    value={height || ""}
                    aria-label="Height in pixels"
                    className="w-full min-w-0"
                    onChange={(e) => {
                      const next = parseInt(e.target.value) || 0;
                      setHeight(next);
                      if (locked && next) setWidth(Math.round(next * aspect));
                      reset();
                    }}
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-2">
                <ToggleGroup
                  type="single"
                  size="sm"
                  value={fit}
                  onValueChange={(value) => {
                    if (value) {
                      setFit(value as Fit);
                      reset();
                    }
                  }}
                  aria-label="Fit mode"
                  className="w-full"
                >
                  {fits.map((f) => (
                    <ToggleGroupItem
                      key={f.value}
                      value={f.value}
                      size="sm"
                      className="min-w-0 flex-1 px-1 text-xs"
                    >
                      {f.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <p className="text-muted-foreground text-xs leading-5">
                  {fits.find((f) => f.value === fit)!.hint}
                </p>
              </div>

              <Field label="Format" className="justify-between gap-3">
                <ToolSelect
                  aria-label="Output format"
                  value={format.slug}
                  onValueChange={(value) => {
                    setFormatSlug(value);
                    reset();
                  }}
                  options={resizeFormats.map((f) => ({ value: f.slug, label: f.label }))}
                  className="min-w-0 flex-1"
                />
              </Field>

              {format.lossy && (
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
                disabled={!file || !writable || !target.width || !target.height}
                loading={busy}
                onClick={resize}
              >
                <i aria-hidden="true" className="icon-[lucide--scaling]" />
                Resize
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
