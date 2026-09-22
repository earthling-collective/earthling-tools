import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { basePairs, getBasePair } from "@/tools/base/bases";
import { BaseTool } from "@/tools/base/tool";

const tool = findTool("/base")!;

export const dynamicParams = false;

export function generateStaticParams() {
  return basePairs.map((p) => ({ pair: p.slug }));
}

const describe = (from: string, to: string) =>
  `Free online ${from.toLowerCase()} to ${to.toLowerCase()} converter. Paste a number and get the conversion instantly, at any size, right in the browser.`;

export async function generateMetadata(props: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await props.params;
  const pair = getBasePair(slug);
  if (!pair) return {};
  return pageMetadata({
    title: `${pair.from.label} to ${pair.to.label} Converter`,
    description: describe(pair.from.label, pair.to.label),
    path: `/base/${slug}`,
    keywords: `${pair.from.slug} to ${pair.to.slug}, convert ${pair.from.slug} to ${pair.to.slug}, ${pair.from.slug} to ${pair.to.slug} converter, number base converter`,
  });
}

export default async function Page(props: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await props.params;
  const pair = getBasePair(slug);
  if (!pair) notFound();

  return (
    <ToolPage
      tool={tool}
      path={`/base/${slug}`}
      title={`${pair.from.label} to ${pair.to.label} Converter`}
      description={describe(pair.from.label, pair.to.label)}
    >
      <BaseTool initialFrom={pair.from.slug} initialTo={pair.to.slug} />
    </ToolPage>
  );
}
