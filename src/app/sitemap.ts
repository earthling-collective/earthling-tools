import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { toolRoutes, tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const primary = new Set(tools.map((t) => t.href));
  return toolRoutes.map((path) => ({
    url: site.url + path,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : primary.has(path) ? 0.8 : 0.6,
  }));
}
