import { site } from "@/lib/site";

const links = [
  { href: site.repo, label: "GitHub" },
  { href: site.collective.url, label: "earthling.dev" },
  { href: site.ui.url, label: "Earthling UI" },
  { href: "/llms.txt", label: "llms.txt" },
];

export function Footer() {
  return (
    <footer className="text-muted-foreground border-t px-6 py-6 text-xs">
      <div className="mx-auto flex max-w-[1552px] flex-wrap items-center justify-between gap-4">
        <p>
          {site.name} · By{" "}
          <a className="hover:text-foreground underline underline-offset-4" href={site.collective.url}>
            {site.collective.name}
          </a>
        </p>
        <div className="flex gap-5">
          {links.map((l) => (
            <a key={l.href} className="hover:text-foreground" href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
