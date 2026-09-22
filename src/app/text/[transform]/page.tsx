import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { TextTool } from "@/tools/text/tool";
import { getTextTransform, textTransforms } from "@/tools/text/transforms";

// Prerender every transform: one tool plus a switcher, one indexable page each
export const dynamicParams = false;

export async function generateStaticParams() {
  return textTransforms.map((t) => ({ transform: t.slug }));
}

export async function generateMetadata(props: { params: Promise<{ transform: string }> }): Promise<Metadata> {
  const { transform: slug } = await props.params;
  const transform = getTextTransform(slug);
  if (!transform) return {};
  return pageMetadata({
    title: transform.title,
    description: transform.description,
    path: `/text/${slug}`,
    keywords: transform.keywords,
  });
}

export default async function Page(props: { params: Promise<{ transform: string }> }) {
  const { transform: slug } = await props.params;
  const transform = getTextTransform(slug);
  if (!transform) notFound();

  const tool = findTool(`/text/${slug}`)!;

  return (
    <ToolPage tool={tool} path={`/text/${slug}`} title={transform.title} description={transform.description}>
      <TextTool initialSlug={slug} />
      <Prose>
        <h2>How it works</h2>
        <p>
          The text is transformed as it is typed or pasted, with the result ready to copy from the output
          panel. Every transform in the switcher runs on the same input, so it is easy to try another one
          without re-pasting.
        </p>
        <p>
          Everything happens in the browser. Nothing is uploaded and no request is made, which makes it safe
          for configuration, tokens and anything else that should not be sent to a server. Transforms that
          expect structured input, such as the JSON and Base64 ones, report the parse error instead of a
          result when the input is invalid.
        </p>
      </Prose>
    </ToolPage>
  );
}
