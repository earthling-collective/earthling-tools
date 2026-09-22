"use client";

import { useEffect, useState } from "react";
import { Button } from "earthling-ui/button";
import { ToggleGroup, ToggleGroupItem } from "earthling-ui/toggle-group";

const options = [
  { value: "system", icon: "icon-[lucide--monitor]", label: "System theme" },
  { value: "light", icon: "icon-[lucide--sun]", label: "Light theme" },
  { value: "dark", icon: "icon-[lucide--moon]", label: "Dark theme" },
];

export function ThemeSwitch() {
  const [theme, setTheme] = useState("system");
  useEffect(() => setTheme(document.documentElement.dataset.theme ?? "system"), []);

  const apply = (value: string) => {
    setTheme(value);
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem("theme", value);
    } catch {}
  };

  const current = options.find((o) => o.value === theme) ?? options[0];
  const next = options[(options.indexOf(current) + 1) % options.length];

  return (
    <>
      <ToggleGroup
        type="single"
        size="sm"
        value={theme}
        aria-label="Color theme"
        className="max-sm:hidden"
        onValueChange={(value) => value && apply(value)}
      >
        {options.map((o) => (
          <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
            <i aria-hidden="true" className={o.icon} />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {/* One cycling button where the three-way toggle does not fit */}
      <Button
        material="ghost"
        scheme="neutral"
        size="sm"
        shape="icon"
        className="sm:hidden"
        aria-label={`${current.label}. Switch to ${next.label.toLowerCase()}`}
        onClick={() => apply(next.value)}
      >
        <i aria-hidden="true" className={current.icon} />
      </Button>
    </>
  );
}
