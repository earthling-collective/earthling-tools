import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { AudioTool } from "@/tools/audio/tool";

const tool = findTool("/audio")!;

export const metadata = pageMetadata({
  title: tool.title,
  description:
    "Convert audio between MP3, WAV, AIFF, FLAC, OGG, M4A and Opus, or extract audio from MP4, MOV, WebM and MKV video. Runs in the browser, files are never uploaded.",
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool}>
      <AudioTool />
    </ToolPage>
  );
}
