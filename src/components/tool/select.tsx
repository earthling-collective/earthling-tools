"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "earthling-ui/select";
import { cn } from "earthling-ui/utils/cn";

export type SelectOption = { value: string; label: string };

// Thin wrapper over earthling-ui Select for flat or grouped option lists
export function ToolSelect({
  value,
  onValueChange,
  options,
  groups,
  className,
  disabled,
  ...rest
}: {
  value: string;
  onValueChange: (value: string) => void;
  options?: SelectOption[];
  groups?: { label: string; options: SelectOption[] }[];
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const item = (o: SelectOption) => (
    <SelectItem key={o.value} value={o.value}>
      {o.label}
    </SelectItem>
  );
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger aria-label={rest["aria-label"]} className={cn("h-9 min-w-40", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options?.map(item)}
        {groups?.map((g) => (
          <SelectGroup key={g.label}>
            <SelectLabel>{g.label}</SelectLabel>
            {g.options.map(item)}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
