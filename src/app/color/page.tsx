import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { colorSpaces } from "@/tools/color/spaces";
import { ColorTool } from "@/tools/color/tool";

const tool = findTool("/color")!;

export const metadata = pageMetadata({
  title: "Color Converter",
  description:
    "Free online color converter. Convert between HEX, RGB, HSL and OKLCH — alpha and transparency included — instantly and privately in the browser.",
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool}>
      <ColorTool />
      <Prose>
        <h2>About the four formats</h2>
        {colorSpaces.map((s) => (
          <p key={s.slug}>{s.about}</p>
        ))}
        <p>
          Conversion runs entirely in the browser — nothing is uploaded — and alpha carries through every
          format, from eight-digit hex to <code>oklch(… / 0.5)</code>.
        </p>
      </Prose>
    </ToolPage>
  );
}
