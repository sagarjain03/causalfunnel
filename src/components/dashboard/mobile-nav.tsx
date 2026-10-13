"use client";

import { Suspense, useState } from "react";
import { Menu } from "lucide-react";
import { Brand } from "@/components/dashboard/brand";
import { ActiveNavLinks } from "@/components/dashboard/active-nav-links";
import { NavLinks } from "@/components/dashboard/nav-links";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/** Header bar with a sheet drawer, below md. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 gap-6 px-4 py-6">
          <SheetTitle className="px-3">
            <Brand />
          </SheetTitle>
          <SheetDescription className="sr-only">Dashboard navigation</SheetDescription>
          <Suspense fallback={<NavLinks pathname={null} onNavigate={close} />}>
            <ActiveNavLinks onNavigate={close} />
          </Suspense>
        </SheetContent>
      </Sheet>
      <Brand />
    </header>
  );
}
