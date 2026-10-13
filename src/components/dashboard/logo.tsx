import Link from "next/link";

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-lg font-medium tracking-tight">
      {/* Logo mark: one of the places orange is allowed (DESIGN.md §2). */}
      <span className="flex size-7 items-center justify-center rounded-lg bg-orange" aria-hidden>
        <span className="size-2.5 rounded-full bg-app" />
      </span>
      CausalFunnel
    </Link>
  );
}
