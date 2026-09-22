import { notFound } from "next/navigation";
import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { colorPairs, getColorPair } from "@/tools/color/spaces";
import { ColorTool } from "@/tools/color/tool";

const tool = findTool("/color")!;

export const dynamicParams = false;

export function generateStaticParams() {
  return colorPairs.map((p) => ({ pair: p.slug }));
}

const describe = (from: string, to: string) =>
  `Free online ${from} to ${to} color converter. Paste a ${from} color and get the ${to} value instantly — alpha included, everything runs in the browser.`;

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await params;
  const pair = getColorPair(slug);
  if (!pair) return {};
  return pageMetadata({
    title: `${pair.from.label} to ${pair.to.label} Converter`,
    description: describe(pair.from.label, pair.to.label),
    path: `/color/${slug}`,
    keywords: `${pair.from.slug} to ${pair.to.slug}, convert ${pair.from.slug} to ${pair.to.slug}, ${pair.from.slug} to ${pair.to.slug} converter, color converter, alpha, transparency`,
  });
}

export default async function Page({ params }: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await params;
  const pair = getColorPair(slug);
  if (!pair) notFound();

  const { from, to } = pair;
  const sample = from.parse(from.sample);
  const example = sample ? to.format(sample) : null;

  return (
    <ToolPage
      tool={tool}
      path={`/color/${slug}`}
      title={`${from.label} to ${to.label} Converter`}
      description={describe(from.label, to.label)}
    >
      <ColorTool initialFrom={from.slug} initialTo={to.slug} />
      <Prose>
        <h2>
          About {from.label} and {to.label}
        </h2>
        <p>{from.about}</p>
        <p>{to.about}</p>
        {example && (
          <p>
            For example, <code>{from.sample}</code> in {from.label} is <code>{example}</code> in {to.label}.
            Paste any value above — conversion is instant, runs entirely in the browser, and carries alpha
            through when the color has one.
          </p>
        )}
      </Prose>
    </ToolPage>
  );
}
