"use client";

import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", isActive: (p: string) => p === "/dashboard" },
  { href: "/dashboard/journeys", label: "Journeys", isActive: (p: string) => p.startsWith("/dashboard/journeys") },
];

const itemClass =
  "relative flex flex-1 items-center justify-center rounded-full px-4 py-1.5 text-sm md:flex-none";

type PillNavProps = {
  /** Current path; null renders no active pill (static-shell fallback). */
  pathname: string | null;
};

/** Floating pill navbar. The active pill slides between items (the only motion besides DESIGN.md §9's list). */
export function PillNav({ pathname }: PillNavProps) {
  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Dashboard" className="glass flex w-full rounded-full p-1 md:w-auto">
        {items.map(({ href, label, isActive }) => {
          const active = pathname !== null && isActive(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(itemClass, active ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  transition={{ type: "spring", duration: 0.25, bounce: 0.15 }}
                  className="glass-shine absolute inset-0 rounded-full bg-panel-raised"
                  aria-hidden
                />
              )}
              <span className="relative">{label}</span>
            </Link>
          );
        })}
        {/* Heatmap arrives in Phase 4. Focusable so keyboard users get the tooltip too. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              role="link"
              aria-disabled="true"
              tabIndex={0}
              className={cn(itemClass, "cursor-not-allowed text-muted-foreground/60")}
            >
              Heatmap
            </span>
          </TooltipTrigger>
          <TooltipContent>Soon</TooltipContent>
        </Tooltip>
      </nav>
    </MotionConfig>
  );
}
