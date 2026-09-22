import { ogSize, renderOg } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    title: "Useful tools. Nothing uploaded.",
    description: site.tagline,
    eyebrow: "Open source · Runs in your browser",
  });
}
