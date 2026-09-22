import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { audioPairs, getAudioPair, type AudioPair } from "@/tools/audio/formats";
import { AudioTool } from "@/tools/audio/tool";

export const dynamicParams = false;

const tool = findTool("/audio")!;

const titleFor = (pair: AudioPair) =>
  pair.from.inputOnly
    ? `Extract ${pair.to.label} Audio from ${pair.from.label}`
    : `Convert ${pair.from.label} to ${pair.to.label}`;

const descriptionFor = (pair: AudioPair) =>
  `Free online ${pair.from.label} to ${pair.to.label} converter. Runs entirely in the browser — fast, private, no signup, files never uploaded.`;

export function generateStaticParams() {
  return audioPairs.map((p) => ({ pair: p.slug }));
}

export async function generateMetadata(props: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair: slug } = await props.params;
  const pair = getAudioPair(slug);
  if (!pair) return {};
  const extract = pair.from.inputOnly;
  return pageMetadata({
    title: titleFor(pair),
    description: descriptionFor(pair),
    path: `/audio/${slug}`,
    keywords: `${pair.from.slug} to ${pair.to.slug}, convert ${pair.from.slug} to ${pair.to.slug}, ${pair.from.label.toLowerCase()} to ${pair.to.label.toLowerCase()} converter, audio converter${extract ? ", extract audio from video" : ""}`,
  });
}

export default async function Page(props: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await props.params;
  const pair = getAudioPair(slug);
  if (!pair) notFound();

  return (
    <ToolPage tool={tool} path={`/audio/${slug}`} title={titleFor(pair)} description={descriptionFor(pair)}>
      <AudioTool initialFrom={pair.from.slug} initialTo={pair.to.slug} />
    </ToolPage>
  );
}
