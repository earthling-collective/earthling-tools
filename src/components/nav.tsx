"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories, findTool, toolsIn } from "@/lib/tools";

export function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const current = findTool(usePathname());
  return (
    <nav aria-label="Tools" className="flex flex-col gap-6 px-4 py-7">
      {categories.map((category) => (
        <div key={category.id}>
          <p className="nav-label">{category.label}</p>
          <div className="flex flex-col gap-0.5">
            {toolsIn(category.id).map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={onNavigate}
                aria-current={current?.href === tool.href ? "page" : undefined}
                className="nav-link"
              >
                {tool.title}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
