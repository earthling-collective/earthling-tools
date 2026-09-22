import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { ConvertTool } from "@/tools/convert/tool";

const tool = findTool("/convert")!;

export const metadata = pageMetadata({
  title: tool.title,
  description:
    "Convert images between PNG, JPG, WebP and AVIF for free. Fast and private — files are converted in the browser and never uploaded.",
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool} wide>
      <ConvertTool />
      <Prose>
        <h2>Which format to pick</h2>
        <p>
          PNG is lossless and keeps transparency, which makes it right for screenshots, logos and anything
          with text or hard edges. JPG is the classic photo format: small files for photographic detail, no
          transparency, visible artifacts once the quality drops. WebP usually lands 25–35% below JPG at the
          same perceived quality and still supports an alpha channel. AVIF goes smaller again, but browsers
          can only decode it so far, so it is accepted as input and not offered as output.
        </p>
        <h2>How the conversion works</h2>
        <p>
          The image is decoded, drawn to a <code>canvas</code> and re-encoded by the browser itself. Nothing
          is uploaded, nothing is stored, and the tool keeps working offline once the page has loaded. The
          quality slider applies to lossy targets only — converting to PNG always reproduces the decoded
          pixels exactly.
        </p>
      </Prose>
    </ToolPage>
  );
}
