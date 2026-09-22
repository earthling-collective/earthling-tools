import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { TimestampTool } from "@/tools/timestamp/tool";

const tool = findTool("/timestamp")!;

export const metadata = pageMetadata({
  title: tool.title,
  description:
    "Free online unix timestamp converter. Convert epoch seconds, milliseconds or microseconds to human dates and back, with a live current timestamp.",
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool}>
      <TimestampTool />
      <Prose>
        <h2>About unix time</h2>
        <p>
          Unix time counts seconds since 00:00:00 UTC on January 1, 1970, ignoring leap seconds. It is the
          standard way computers store moments in time because it is a single number — easy to compare, sort
          and do math on — with the timezone applied only when a human needs to read it.
        </p>
        <p>
          Different systems use different precision: ten digits is seconds, thirteen is milliseconds (what
          JavaScript&apos;s <code>Date.now()</code> returns), sixteen is microseconds. This tool detects the
          unit from the number of digits and says which one it assumed, and the unit can be forced when a
          number is ambiguous.
        </p>
        <p>
          The famous “year 2038 problem” only affects systems that store unix time as a signed 32-bit integer,
          which overflows on January 19, 2038. Anything using 64-bit time — including JavaScript — is fine for
          the next few hundred billion years.
        </p>
      </Prose>
    </ToolPage>
  );
}
