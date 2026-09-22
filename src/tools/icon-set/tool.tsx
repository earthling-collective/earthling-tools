"use client";

import { useEffect, useMemo, useState } from "react";
import { zipSync } from "fflate";
import { Button } from "earthling-ui/button";
import { Input } from "earthling-ui/input";
import { ToggleGroup, ToggleGroupItem } from "earthling-ui/toggle-group";
import { Code } from "@/components/code";
import { FileDrop, Panel, PanelHeader, Toolbar, ToolHeader, Workbench } from "@/components/tool";
import { downloadFile } from "@/lib/files";
import { encodeCanvas, loadImage } from "@/tools/convert/image";
import { getIconPreset, iconPresets } from "./presets";

// Contain-fit the source into a transparent square; padding reserves the maskable safe zone
async function renderIcon(img: HTMLImageElement, size: number, padding = 0) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const inner = size * (1 - padding * 2);
  const scale = Math.min(inner / img.naturalWidth, inner / img.naturalHeight);
  const width = img.naturalWidth * scale;
  const height = img.naturalHeight * scale;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, (size - width) / 2, (size - height) / 2, width, height);
  return encodeCanvas(canvas, "image/png");
}

export function IconSetTool() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("My App");
  const [presetSlug, setPresetSlug] = useState(iconPresets[0].slug);
  const [previews, setPreviews] = useState<{ path: string; size: number; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState("");

  const preset = getIconPreset(presetSlug) ?? iconPresets[0];

  const sourceUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => void (sourceUrl && URL.revokeObjectURL(sourceUrl)), [sourceUrl]);

  // Re-render the preview grid whenever the source or the preset changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sourceUrl) {
        setPreviews([]);
        setWarning("");
        return;
      }
      try {
        const img = await loadImage(sourceUrl);
        if (cancelled) return;
        setWarning(
          img.naturalWidth !== img.naturalHeight
            ? "Source isn't square, so the icons will be letterboxed."
            : img.naturalWidth < 1024
              ? "Source is under 1024px, so large icons may look soft."
              : "",
        );
        const rendered = await Promise.all(
          preset.files.map(async (f) => ({
            path: f.path,
            size: f.size,
            url: URL.createObjectURL(await renderIcon(img, Math.min(f.size, 256), f.padding)),
          })),
        );
        if (cancelled) {
          rendered.forEach((r) => URL.revokeObjectURL(r.url));
          return;
        }
        setPreviews((prev) => {
          prev.forEach((r) => URL.revokeObjectURL(r.url));
          return rendered;
        });
      } catch {
        if (!cancelled) setWarning("That file could not be read as an image.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceUrl, preset]);

  const download = async () => {
    if (!sourceUrl) return;
    setBusy(true);
    try {
      const img = await loadImage(sourceUrl);
      const entries: Record<string, Uint8Array> = {};
      for (const f of preset.files) {
        const blob = await renderIcon(img, f.size, f.padding);
        entries[f.path] = new Uint8Array(await blob.arrayBuffer());
      }
      for (const config of preset.configs) {
        // Strip the "(snippet)" suffix from zip paths
        entries[config.path.replace(/\s*\(.*\)$/, "")] = new TextEncoder().encode(config.content(name));
      }
      // PNGs are already compressed, so skip the deflate pass
      downloadFile(
        new Uint8Array(zipSync(entries, { level: 0 })),
        `${preset.slug}-icons.zip`,
        "application/zip",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <ToolHeader
        title="App Icon Set Generator"
        description="Free online icon set generator. Upload one square image and download every size needed for PWAs, Expo / React Native or Android, with the JSON configs included. Everything runs in the browser."
      />

      <Toolbar className="mt-8">
        <ToggleGroup
          type="single"
          size="sm"
          value={preset.slug}
          onValueChange={(value) => value && setPresetSlug(value)}
          aria-label="Icon set preset"
        >
          {iconPresets.map((p) => (
            <ToggleGroupItem key={p.slug} value={p.slug} size="sm">
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-muted-foreground max-w-xl text-sm leading-6">{preset.description}</p>
      </Toolbar>

      <Workbench className="mt-4">
        <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
          <div className="flex min-w-0 flex-col gap-4">
            <FileDrop
              file={file}
              onFile={setFile}
              accept="image/*"
              hint="Drop a square source image (1024px or larger)"
              icon="icon-[lucide--image-up]"
              preview
            />

            {previews.length > 0 && (
              <Panel>
                <PanelHeader label="Icons" meta={`${preset.files.length} files`} />
                <div className="grid grid-cols-4 gap-3 p-4 sm:grid-cols-6">
                  {previews.map((p) => (
                    <div key={p.path} className="flex min-w-0 flex-col items-center gap-1.5">
                      <div className="bg-muted/40 flex aspect-square w-full items-center justify-center rounded-lg border p-2">
                        <img
                          src={p.url}
                          alt={p.path}
                          title={p.path}
                          className="max-h-full max-w-full object-contain"
                          style={{ width: Math.min(p.size, 64) }}
                        />
                      </div>
                      <span className="text-muted-foreground font-mono text-xs tabular-nums">
                        {p.size}×{p.size}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>

          <Panel className={warning ? "border-caution/40" : undefined}>
            <PanelHeader label="Settings" />
            <div className="flex flex-1 flex-col gap-4 p-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-xs font-medium">App name</span>
                <Input value={name} onChange={(e) => setName(e.target.value)} size="sm" className="w-full" />
              </label>

              <Button className="mt-auto w-full" disabled={!file} loading={busy} onClick={download}>
                <i aria-hidden="true" className="icon-[lucide--download]" />
                Download ZIP
              </Button>
            </div>

            {warning && (
              <p className="text-caution flex items-start gap-2 border-t px-4 py-3 text-sm leading-5">
                <i aria-hidden="true" className="icon-[lucide--triangle-alert] mt-0.5 size-4 flex-none" />
                {warning}
              </p>
            )}
          </Panel>
        </div>
      </Workbench>

      {preset.configs.length > 0 && (
        <div className="mt-4 flex flex-col gap-4">
          {preset.configs.map((config) => (
            <Code key={config.path} language={config.language} label={config.path}>
              {config.content(name)}
            </Code>
          ))}
        </div>
      )}
    </div>
  );
}
