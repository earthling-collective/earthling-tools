import { Prose } from "@/components/tool";
import { ToolPage } from "@/components/tool/page";
import { pageMetadata } from "@/lib/seo";
import { findTool } from "@/lib/tools";
import { CronTool } from "@/tools/cron/tool";

const tool = findTool("/cron")!;

export const metadata = pageMetadata({
  title: tool.title,
  description:
    "Free online cron expression explainer. Type a cron schedule and get plain English, a field-by-field breakdown and the next run times.",
  path: tool.href,
  keywords: tool.keywords,
});

export default function Page() {
  return (
    <ToolPage tool={tool}>
      <CronTool />
      <Prose>
        <h2>Cron syntax in thirty seconds</h2>
        <p>
          A cron expression is five fields separated by spaces: minute (0–59), hour (0–23), day of month
          (1–31), month (1–12 or names) and day of week (0–7 or names, where both 0 and 7 are Sunday).
        </p>
        <p>
          Each field takes <code>*</code> for every value, a number, a list like <code>1,15</code>, a range
          like <code>9-17</code>, or a step like <code>*/5</code> — and they combine, so <code>9-17/2</code>{" "}
          means every second hour from 9 through 17. Shortcuts like <code>@daily</code> and{" "}
          <code>@hourly</code> work too.
        </p>
        <p>
          One classic surprise: when both day-of-month and day-of-week are restricted, standard cron runs the
          job when <em>either</em> matches, not both. This tool implements that rule, so the next-run times
          above are what a real cron daemon would do.
        </p>
      </Prose>
    </ToolPage>
  );
}
