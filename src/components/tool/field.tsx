import type { ComponentProps, ReactNode } from "react";
import { Input } from "earthling-ui/input";
import { cn } from "earthling-ui/utils/cn";

// Labelled inline control
export function Field({
  label,
  children,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex items-center gap-2.5", className)}>
      <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">{label}</span>
      {children}
    </label>
  );
}

export function NumberInput({ className, ...rest }: Omit<ComponentProps<typeof Input>, "type">) {
  return <Input {...rest} type="number" size="sm" className={cn("w-24 font-mono tabular-nums", className)} />;
}

export function MonoInput({ className, ...rest }: ComponentProps<typeof Input>) {
  return <Input {...rest} className={cn("font-mono", className)} />;
}
