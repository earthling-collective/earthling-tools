import { getFormat } from "@/tools/convert/formats";

export type Fit = "cover" | "contain" | "fill" | "inside";

export const fits: { value: Fit; label: string; hint: string }[] = [
  { value: "cover", label: "Cover", hint: "Fills the box and crops the overflow." },
  { value: "contain", label: "Contain", hint: "Fits inside the box and letterboxes the rest." },
  { value: "fill", label: "Fill", hint: "Stretches to the box, ignoring the aspect ratio." },
  { value: "inside", label: "Inside", hint: "Scales to fit the box and keeps the resulting size." },
];

// Output formats, in the order the resizer offers them
export const resizeFormats = ["webp", "png", "jpg"].map((slug) => getFormat(slug)!);

export type Box = { width: number; height: number };
export type Placement = { canvas: Box; draw: { x: number; y: number; width: number; height: number } };

// Where the source lands on the output canvas for a given fit mode
export function placeImage(source: Box, target: Box, fit: Fit): Placement {
  const ratio = { x: target.width / source.width, y: target.height / source.height };

  if (fit === "fill") {
    return { canvas: target, draw: { x: 0, y: 0, ...target } };
  }

  const scale = fit === "cover" ? Math.max(ratio.x, ratio.y) : Math.min(ratio.x, ratio.y);
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  if (fit === "inside") {
    return { canvas: { width, height }, draw: { x: 0, y: 0, width, height } };
  }

  return {
    canvas: target,
    draw: {
      x: Math.round((target.width - width) / 2),
      y: Math.round((target.height - height) / 2),
      width,
      height,
    },
  };
}
