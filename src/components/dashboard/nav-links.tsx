"use client";

import Link from "next/link";
import { Flame, LayoutDashboard, Users, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (path: string) => boolean;
};

const items: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, isActive: (p) => p === "/dashboard" },
  { href: "/dashboard/sessions", label: "Sessions", icon: Users, isActive: (p) => p.startsWith("/dashboard/sessions") },
];

const itemClass = "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors";

type NavLinksProps = {
  /** Current path; null renders no active item (used as the Suspense fallback). */
  pathname: string | null;
  onNavigate?: () => void;
};

/** Pure list of links. Rendered without a pathname in the static shell. */
export function NavLinks({ pathname, onNavigate }: NavLinksProps) {
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon, isActive }) => {
        const active = pathname !== null && isActive(pathname);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              itemClass,
              active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4", active && "text-primary")} aria-hidden />
            {label}
          </Link>
        );
      })}
      {/* Heatmap view arrives in Phase 4; shown disabled so the nav doesn't change shape later. */}
      <span aria-disabled="true" className={cn(itemClass, "cursor-not-allowed text-muted-foreground/60")}>
        <Flame className="size-4" aria-hidden />
        Heatmap
        <Badge variant="outline" className="ml-auto text-[10px] text-muted-foreground">
          Soon
        </Badge>
      </span>
    </nav>
  );
}

