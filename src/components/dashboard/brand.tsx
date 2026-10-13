import Link from "next/link";

export function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="size-2.5 rounded-full bg-primary" aria-hidden />
      CausalFunnel
    </Link>
  );
}
