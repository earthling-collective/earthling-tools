import type { ComponentProps, ReactNode } from "react";
import { cn } from "earthling-ui/utils/cn";

// Dotted canvas that groups the working panels of a tool
export function Workbench({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      {...rest}
      className={cn("preview-canvas flex flex-col gap-4 rounded-2xl border p-4 sm:p-5", className)}
    />
  );
}

// Controls that steer a tool: options on the left, the primary action on the right
export function Toolbar({
  actions,
  className,
  children,
  ...rest
}: ComponentProps<"div"> & { actions?: ReactNode }) {
  return (
    <div {...rest} className={cn("flex flex-wrap items-center gap-x-5 gap-y-3", className)}>
      {children}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      {...rest}
      className={cn(
        "bg-background flex min-w-0 flex-col overflow-hidden rounded-xl border shadow-xs transition-colors focus-within:border-current/25",
        className,
      )}
    />
  );
}

// Fixed 44px header so side-by-side panels always line up
export function PanelHeader({
  label,
  meta,
  children,
  className,
}: {
  label: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-11 flex-none items-center gap-3 border-b px-4", className)}>
      <span className="text-xs font-semibold">{label}</span>
      {meta !== undefined && (
        <span className="text-muted-foreground font-mono text-xs tabular-nums">{meta}</span>
      )}
      <span className="flex-1" />
      {children}
    </div>
  );
}

// Big readout for a computed value
export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="truncate font-mono text-2xl font-medium tracking-tight tabular-nums">{value}</span>
      {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
    </div>
  );
}
