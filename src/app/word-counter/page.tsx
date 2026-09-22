import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { WordCounterTool } from "@/tools/word-counter/tool";

const tool = findTool("/word-counter")!;

export const metadata = pageMetadata({
  title: tool.title,
  description:
    "Free online word counter. Live word, character, sentence and paragraph counts with reading and speaking time estimates.",
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool}>
      <WordCounterTool />
      <Prose>
        <h2>How the counts work</h2>
        <p>
          Words are runs of characters separated by whitespace. Sentences end at periods, exclamation points
          or question marks; paragraphs are separated by blank lines. Unique words are counted
          case-insensitively with surrounding punctuation stripped, so “The” and “the.” count as one word.
        </p>
        <p>
          Reading time assumes 200 words per minute, the common average for silent reading; speaking time
          assumes 130, a comfortable presentation pace. Both round up, so a 30-word paragraph still shows a
          minute. Everything updates as you type and nothing you paste leaves the page.
        </p>
      </Prose>
    </ToolPage>
  );
}
