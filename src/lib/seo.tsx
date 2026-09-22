import type { Metadata } from "next";
import { site } from "./site";
import { type Tool, findCategory } from "./tools";

export const ogImage = (title: string, description?: string) =>
  `/og?${new URLSearchParams({ title, ...(description && { description }) })}`;

// Canonical, Open Graph and Twitter metadata for one indexable page
export function pageMetadata(page: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
}): Metadata {
  const { title, description, path, keywords } = page;
  const image = ogImage(title, description);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

// schema.org SoftwareApplication plus breadcrumb trail
export function toolJsonLd(tool: Tool, page: { title: string; description: string; path: string }) {
  const category = findCategory(tool.category);
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: page.title,
      description: page.description,
      url: site.url + page.path,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
      license: `${site.repo}/blob/main/LICENSE`,
      author: { "@type": "Organization", name: site.collective.name, url: site.collective.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Tools", item: site.url },
        { "@type": "ListItem", position: 2, name: category.label, item: `${site.url}/#${category.id}` },
        { "@type": "ListItem", position: 3, name: tool.title, item: site.url + tool.href },
      ],
    },
  ];
}

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
