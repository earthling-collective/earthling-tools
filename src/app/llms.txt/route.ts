import { site } from "@/lib/site";
import { categories, toolsIn } from "@/lib/tools";

// Agent-readable summary of the site and every tool URL
export function GET() {
  const sections = categories.map((c) =>
    [
      `## ${c.label}`,
      ...toolsIn(c.id).map((t) =>
        [
          `- [${t.title}](${site.url}${t.href}): ${t.description}`,
          ...(t.variants ?? []).map((v) => `  - [${v.label}](${site.url}${v.href})`),
        ].join("\n"),
      ),
    ].join("\n"),
  );
  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `- Site: ${site.url}`,
    `- Source: ${site.repo} (MIT)`,
    `- Publisher: ${site.collective.name} (${site.collective.url}), contact ${site.contact}`,
    `- Design system: ${site.ui.name} (${site.ui.url})`,
    "",
    "Every tool runs client-side. Nothing is uploaded, no account is needed, and pages are fully server-rendered for crawlers.",
    "",
    ...sections.flatMap((s) => [s, ""]),
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
