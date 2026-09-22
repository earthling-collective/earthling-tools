import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { ResizeTool } from "@/tools/resize/tool";

const tool = findTool("/resize")!;

export const metadata = pageMetadata({
  title: tool.title,
  description:
    "Resize images to exact pixel dimensions for free. Crop, letterbox or stretch and download as WebP, PNG or JPG — nothing is uploaded.",
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool} wide>
      <ResizeTool />
      <Prose>
        <h2>The four fit modes</h2>
        <p>
          <code>Cover</code> scales the image until it fills the whole box and crops whatever hangs over the
          edges, which is what thumbnails and hero crops usually want. <code>Contain</code> scales it down
          until the entire image fits and leaves the remaining space empty, so nothing is cut off.{" "}
          <code>Fill</code> stretches the image to the exact box and ignores the original aspect ratio.{" "}
          <code>Inside</code> scales the image to fit the box but keeps the resulting size, so the output is
          never padded.
        </p>
        <h2>Dimensions and output</h2>
        <p>
          With the lock on, changing the width updates the height from the source aspect ratio and vice versa.
          Unlock it to enter both independently. The output format decides how the result is encoded: PNG is
          lossless and keeps transparency, WebP and JPG trade fidelity for size through the quality slider.
        </p>
        <p>
          Resizing happens on a <code>canvas</code> in the page, so the image is never uploaded and the tool
          keeps working offline. Letterboxed areas stay transparent, which JPG — having no alpha channel —
          renders as black.
        </p>
      </Prose>
    </ToolPage>
  );
}
