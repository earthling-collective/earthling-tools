import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { cronPresets, getCronPreset } from "@/tools/cron/cron";
import { CronTool } from "@/tools/cron/tool";

const tool = findTool("/cron")!;

export const dynamicParams = false;

export function generateStaticParams() {
  return cronPresets.map((p) => ({ preset: p.slug }));
}

const describe = (label: string, expression: string) =>
  `The cron expression for ${label.toLowerCase()} is ${expression}. See it explained field by field with the next run times.`;

export async function generateMetadata(props: { params: Promise<{ preset: string }> }) {
  const { preset: slug } = await props.params;
  const preset = getCronPreset(slug);
  if (!preset) return {};
  const lower = preset.label.toLowerCase();
  return pageMetadata({
    title: `Cron Expression for ${preset.label}`,
    description: describe(preset.label, preset.expression),
    path: `/cron/${slug}`,
    keywords: `cron ${lower}, cron expression ${lower}, crontab ${lower}, ${preset.expression}, cron schedule`,
  });
}

export default async function Page(props: { params: Promise<{ preset: string }> }) {
  const { preset: slug } = await props.params;
  const preset = getCronPreset(slug);
  if (!preset) notFound();

  return (
    <ToolPage
      tool={tool}
      path={`/cron/${slug}`}
      title={`Cron Expression for ${preset.label}`}
      description={describe(preset.label, preset.expression)}
    >
      <CronTool initialExpression={preset.expression} />
    </ToolPage>
  );
}
