import { notFound } from "next/navigation";
import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { conversionPairs, getPair } from "@/tools/convert/formats";
import { ConvertTool } from "@/tools/convert/tool";

const tool = findTool("/convert")!;

export const dynamicParams = false;

export function generateStaticParams() {
  return conversionPairs.map((p) => ({ pair: p.slug }));
}

const describe = (from: string, to: string) =>
  `Free online ${from} to ${to} converter. Fast and private — files are converted in the browser and never uploaded.`;

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await params;
  const pair = getPair(slug);
  if (!pair) return {};
  return pageMetadata({
    title: `Convert ${pair.from.label} to ${pair.to.label}`,
    description: describe(pair.from.label, pair.to.label),
    path: `/convert/${slug}`,
    keywords: `${pair.from.slug} to ${pair.to.slug}, convert ${pair.from.slug} to ${pair.to.slug}, ${pair.from.label.toLowerCase()} to ${pair.to.label.toLowerCase()} converter, image converter`,
  });
}

export default async function Page({ params }: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await params;
  const pair = getPair(slug);
  if (!pair) notFound();
  const { from, to } = pair;

  return (
    <ToolPage
      tool={tool}
      wide
      path={`/convert/${slug}`}
      title={`Convert ${from.label} to ${to.label}`}
      description={describe(from.label, to.label)}
    >
      <ConvertTool initialFrom={from.slug} initialTo={to.slug} />
      <Prose>
        <h2>
          About {from.label} and {to.label}
        </h2>
        <p>{from.about}</p>
        <p>{to.about}</p>
        <p>
          {to.lossy
            ? `Converting ${from.label} to ${to.label} is lossy — the quality slider trades file size against fidelity.`
            : `Converting ${from.label} to ${to.label} is lossless — pixels come through exactly as they were decoded.`}{" "}
          The image is decoded, drawn to a <code>canvas</code> and re-encoded by the browser, so nothing is
          uploaded and nothing is stored.
        </p>
      </Prose>
    </ToolPage>
  );
}
