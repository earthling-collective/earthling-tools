import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { generators, getGenerator } from "@/tools/generate/generators";
import { GenerateTool } from "@/tools/generate/tool";

export const dynamicParams = false;

export function generateStaticParams() {
  return generators.map((g) => ({ generator: g.slug }));
}

export async function generateMetadata(props: { params: Promise<{ generator: string }> }): Promise<Metadata> {
  const { generator: slug } = await props.params;
  const generator = getGenerator(slug);
  if (!generator) return {};
  return pageMetadata({
    title: generator.title,
    description: generator.description,
    path: `/generate/${slug}`,
    keywords: generator.keywords,
  });
}

export default async function Page(props: { params: Promise<{ generator: string }> }) {
  const { generator: slug } = await props.params;
  const generator = getGenerator(slug);
  const tool = findTool(`/generate/${slug}`);
  if (!generator || !tool) notFound();

  return (
    <ToolPage tool={tool} title={generator.title} description={generator.description}>
      <GenerateTool initialSlug={slug} />
    </ToolPage>
  );
}
