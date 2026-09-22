import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { DiffTool } from "@/tools/diff/tool";

const tool = findTool("/diff")!;

export const metadata = pageMetadata({
  title: tool.title,
  description:
    "Free online text diff checker. Compare two versions of a text line by line. Everything runs in the browser and nothing is uploaded.",
  path: tool.href,
  keywords: "diff checker, text compare, compare two texts, text difference, online diff tool",
});

export default function Page() {
  return (
    <ToolPage tool={tool} wide>
      <DiffTool />
      <Prose>
        <h2>How the comparison works</h2>
        <p>
          The two texts are compared line by line using the longest common subsequence, the same idea behind{" "}
          <code>git diff</code>. Lines present only in the changed version show as additions, lines missing
          from it show as removals, and everything shared stays unmarked.
        </p>
        <p>
          Comparison runs entirely in the browser, so it is safe for config files, contracts and anything else
          that should not be uploaded to a diff site. Very large texts fall back to a simpler comparison to
          stay fast.
        </p>
      </Prose>
    </ToolPage>
  );
}
