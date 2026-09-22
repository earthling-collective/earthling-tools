import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "earthling-ui/utils/cn";
import { JsonLd, toolJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { findCategory, toolsIn, type Tool } from "@/lib/tools";

// Shared frame for every tool route: category label, the tool, its variants, related tools and the funnel
export function ToolPage({
  tool,
  path = tool.href,
  title = tool.title,
  description = tool.description,
  wide,
  children,
}: {
  tool: Tool;
  path?: string;
  title?: string;
  description?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const category = findCategory(tool.category);
  const related = toolsIn(tool.category)
    .filter((t) => t !== tool)
    .slice(0, 4);
  const variants = tool.variants?.filter((v) => v.href !== path) ?? [];

  return (
    <main id="main" className="min-w-0 px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <JsonLd data={toolJsonLd(tool, { title, description, path })} />
      <article className={cn("mx-auto", wide ? "max-w-6xl" : "max-w-4xl")}>
        <Link
          href={`/#${category.id}`}
          className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-2 text-xs font-medium"
        >
          <i aria-hidden="true" className={category.icon} />
          {category.label}
        </Link>

        {children}

        {variants.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-3 text-xs font-medium">More {tool.title.toLowerCase()} pages</h2>
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v) => (
                <Link
                  key={v.href}
                  href={v.href}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full border px-3 py-1 text-xs"
                >
                  {v.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-3 text-xs font-medium">Related tools</h2>
            <div className="divide-y border-y">
              {related.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group hover:bg-muted/40 flex items-center justify-between gap-3 px-1 py-3"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium">{t.title}</h3>
                    <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs leading-5">
                      {t.description}
                    </p>
                  </div>
                  <i
                    aria-hidden="true"
                    className="text-muted-foreground group-hover:text-foreground icon-[lucide--arrow-up-right] size-4 shrink-0"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="text-muted-foreground mt-12 border-t pt-6 text-xs leading-6">
          Free and open source from{" "}
          <a href={site.collective.url} className="docs-link">
            {site.collective.name}
          </a>
          , an independent creative agency. Built with{" "}
          <a href={site.ui.url} className="docs-link">
            {site.ui.name}
          </a>
          .
        </p>
      </article>
    </main>
  );
}
