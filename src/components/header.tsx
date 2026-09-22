import { Button } from "earthling-ui/button";
import { site } from "@/lib/site";
import { Wordmark } from "./logo";
import { MobileNav } from "./mobile-nav";
import { Search } from "./search";
import { ThemeSwitch } from "./theme-switch";

export function Header() {
  return (
    <header className="bg-background/90 sticky top-0 z-40 h-16 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <MobileNav />
          <Wordmark />
        </div>
        <div className="flex items-center gap-1 sm:gap-4">
          <Search className="h-8 w-9 px-2 sm:w-56" />
          <div className="hidden h-5 border-l sm:block" />
          <ThemeSwitch />
          <Button
            asChild
            material="ghost"
            scheme="neutral"
            size="sm"
            shape="icon"
            className="hidden sm:inline-flex"
          >
            <a href={site.repo} aria-label="Earthling Tools on GitHub">
              <i aria-hidden="true" className="icon-[lucide--github]" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
