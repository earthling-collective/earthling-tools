"use client";

import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "earthling-ui/toggle-group";

const options = [
  { value: "system", icon: "icon-[lucide--monitor]", label: "System theme" },
  { value: "light", icon: "icon-[lucide--sun]", label: "Light theme" },
  { value: "dark", icon: "icon-[lucide--moon]", label: "Dark theme" },
];

export function ThemeSwitch() {
  const [theme, setTheme] = useState("system");
  useEffect(() => setTheme(document.documentElement.dataset.theme ?? "system"), []);
  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={theme}
      aria-label="Color theme"
      onValueChange={(value) => {
        if (!value) return;
        setTheme(value);
        document.documentElement.dataset.theme = value;
        try {
          localStorage.setItem("theme", value);
        } catch {}
      }}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
          <i aria-hidden="true" className={o.icon} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
