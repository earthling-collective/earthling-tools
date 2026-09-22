import Link from "next/link";
import { cn } from "earthling-ui/utils/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Earthling Tools home"
      className={cn("font-display text-base tracking-tight sm:text-lg", className)}
    >
      earthling
      <span className="text-muted-foreground font-body ml-1.5 text-xs font-medium tracking-normal">
        tools
      </span>
    </Link>
  );
}
