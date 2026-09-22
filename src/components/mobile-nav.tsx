"use client";

import { useState } from "react";
import { Button } from "earthling-ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "earthling-ui/drawer";
import { Nav } from "./nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          className="lg:hidden"
          material="ghost"
          scheme="neutral"
          shape="icon"
          size="sm"
          aria-label="Open navigation"
        >
          <i aria-hidden="true" className="icon-[lucide--menu]" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-80 max-w-[90vw] gap-0 p-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <DrawerTitle>All tools</DrawerTitle>
            <DrawerClose asChild>
              <Button material="ghost" scheme="neutral" shape="icon" size="sm" aria-label="Close navigation">
                <i aria-hidden="true" className="icon-[lucide--x]" />
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription className="sr-only">
            Every tool on the site, grouped by category.
          </DrawerDescription>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Nav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
