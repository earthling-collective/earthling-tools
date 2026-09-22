import Link from "next/link";
import { Button } from "earthling-ui/button";

export default function NotFound() {
  return (
    <main id="main" className="min-w-0 px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-5 py-16">
        <p className="text-muted-foreground text-xs font-medium">404</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">No tool lives here.</h1>
        <p className="text-muted-foreground max-w-md text-base leading-7">
          The page may have moved. Every tool is listed in the sidebar, or press ⌘K to search.
        </p>
        <Button asChild>
          <Link href="/">Back to the tools</Link>
        </Button>
      </div>
    </main>
  );
}
