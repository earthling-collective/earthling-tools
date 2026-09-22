import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { numberBases } from "@/tools/base/bases";
import { BaseTool } from "@/tools/base/tool";

const tool = findTool("/base")!;

export const metadata = pageMetadata({
  title: tool.title,
  description:
    "Convert numbers between binary, octal, decimal and hex online for free. Any size, instant and private: everything runs in the browser.",
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool}>
      <BaseTool />
      <Prose>
        <h2>About the four bases</h2>
        {numberBases.map((b) => (
          <p key={b.slug}>{b.about}</p>
        ))}
        <p>
          Conversion uses BigInt, so numbers of any size — a 256-bit hash, a database id — convert without
          losing precision, entirely in the browser.
        </p>
      </Prose>
    </ToolPage>
  );
}
