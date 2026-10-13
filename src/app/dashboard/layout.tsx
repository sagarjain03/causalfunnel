import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Static shell only: no data reads here (layouts can't stream uncached data under Cache Components).
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav />
          <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 md:p-8">{children}</main>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
