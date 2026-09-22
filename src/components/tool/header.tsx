import type { ReactNode } from "react";

// Page title block; lives in the client tool so it follows the active preset
export function ToolHeader({ title, description }: { title: ReactNode; description: ReactNode }) {
  return (
    <header>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7">{description}</p>
    </header>
  );
}
