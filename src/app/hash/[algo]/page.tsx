import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { getHashAlgo, hashAlgos } from "@/tools/hash/hashes";
import { HashTool } from "@/tools/hash/tool";

const tool = findTool("/hash/sha256")!;

export const dynamicParams = false;

export function generateStaticParams() {
  return hashAlgos.map((a) => ({ algo: a.slug }));
}

const describe = (label: string) =>
  `Free online ${label} hash generator. Type or paste text and get its ${label} digest instantly, computed entirely in the browser.`;

export async function generateMetadata(props: { params: Promise<{ algo: string }> }) {
  const { algo: slug } = await props.params;
  const algo = getHashAlgo(slug);
  if (!algo) return {};
  const lower = algo.label.toLowerCase();
  return pageMetadata({
    title: `${algo.label} Hash Generator`,
    description: describe(algo.label),
    path: `/hash/${slug}`,
    keywords: `${lower} hash generator, ${lower} online, ${lower} checksum, hash text online`,
  });
}

export default async function Page(props: { params: Promise<{ algo: string }> }) {
  const { algo: slug } = await props.params;
  const algo = getHashAlgo(slug);
  if (!algo) notFound();

  return (
    <ToolPage
      tool={tool}
      path={`/hash/${slug}`}
      title={`${algo.label} Hash Generator`}
      description={describe(algo.label)}
    >
      <HashTool initialAlgo={slug} />
    </ToolPage>
  );
}
