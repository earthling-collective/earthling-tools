import Link from "next/link";
import { Button } from "earthling-ui/button";
import { Specimen } from "@/components/specimen";
import { JsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { categories, tools, toolsIn } from "@/lib/tools";

const pillars = [
  {
    index: "01",
    title: "Nothing leaves the tab.",
    copy: "Every tool runs in the browser. No uploads, no accounts, and it keeps working offline once loaded.",
  },
  {
    index: "02",
    title: "Open source, MIT.",
    copy: "Read the code, file an issue or send a fix. The catalog, routes and tools are all in one small repo.",
    href: site.repo,
    cta: "View on GitHub",
  },
  {
    index: "03",
    title: "Made by Earthling.",
    copy: `An independent, AI-native creative agency, building with the same components you see here.`,
    href: site.collective.url,
    cta: "Start a project",
  },
];

const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: site.name,
  numberOfItems: tools.length,
  itemListElement: tools.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.title,
    url: site.url + t.href,
  })),
};

export default function HomePage() {
  return (
    <main id="main" className="min-w-0 px-5 py-10 sm:px-8 lg:px-10 xl:px-12">
      <JsonLd data={itemList} />
      <div className="mx-auto max-w-5xl">
        <section className="pt-2 pb-10 sm:pt-7 sm:pb-12">
          <a
            href={site.repo}
            className="text-muted-foreground hover:text-foreground mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
          >
            <span className="bg-foreground size-1.5 rounded-full" />
            {tools.length} tools
            <span aria-hidden="true">·</span>Open source
            <i aria-hidden="true" className="icon-[lucide--arrow-up-right]" />
          </a>
          <div className="grid items-end gap-7 md:grid-cols-[1.15fr_1fr]">
            <h1 className="text-[clamp(2.75rem,5.5vw,4.5rem)] leading-[1.05] font-semibold tracking-[-0.055em]">
              Useful tools.
              <br />
              <span className="text-muted-foreground">Nothing uploaded.</span>
            </h1>
            <div>
              <p className="text-muted-foreground max-w-md text-base leading-7">
                Developer tools that run entirely in your browser: convert, generate, decode, resize and hash.
                Free, open source, and built with {site.ui.name}.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="#tools">
                    Browse tools
                    <i aria-hidden="true" className="icon-[lucide--arrow-right]" />
                  </Link>
                </Button>
                <Button asChild material="outline" scheme="neutral">
                  <a href={site.repo}>View source</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Specimen />

        <section className="my-12 grid gap-8 border-b pb-12 md:grid-cols-3 md:gap-10">
          {pillars.map((p) => (
            <div key={p.index}>
              <p className="text-muted-foreground mb-3 text-xs font-medium">
                {p.index} / {p.title.replace(/\.$/, "")}
              </p>
              <p className="text-muted-foreground text-sm leading-6">{p.copy}</p>
              {p.href && (
                <a href={p.href} className="docs-link mt-4 inline-flex items-center gap-1.5 text-sm">
                  {p.cta}
                  <i aria-hidden="true" className="icon-[lucide--arrow-up-right] size-3.5" />
                </a>
              )}
            </div>
          ))}
        </section>

        <section id="tools" className="pb-8">
          <div className="mb-8 flex items-end justify-between gap-5">
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium">The collection</p>
              <h2 className="text-3xl font-semibold tracking-tight">Small tools. Sharp edges.</h2>
            </div>
            <span className="text-muted-foreground hidden text-sm tabular-nums sm:block">
              {tools.length} tools
            </span>
          </div>
          <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
            {categories.map((category) => {
              const list = toolsIn(category.id);
              return (
                <section key={category.id} id={category.id}>
                  <div className="mb-3 flex items-center gap-2.5">
                    <i aria-hidden="true" className={"text-muted-foreground size-4 " + category.icon} />
                    <h3 className="text-sm font-semibold">{category.label}</h3>
                    <span className="text-muted-foreground ml-auto font-mono text-xs">
                      {String(list.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="divide-y border-y">
                    {list.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="group hover:bg-muted/40 focus-visible:outline-outline flex items-center justify-between gap-3 px-1 py-3 focus-visible:outline-2"
                      >
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium">{tool.title}</h4>
                          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs leading-5">
                            {tool.description}
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
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
