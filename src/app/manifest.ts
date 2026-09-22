import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Tools",
    description: site.description,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    theme_color: "#09090b",
    background_color: "#09090b",
    display: "standalone",
    start_url: "/?source=pwa",
    scope: "/",
  };
}
