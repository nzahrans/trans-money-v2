"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
    {/* Moved to layout/AppShell.tsx */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <header className="h-14 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b27] sticky top-0 z-20 shadow-sm">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Trans Kota Kita Money Management
          </span>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6 bg-slate-100 dark:bg-[#0d1117]">
          {children}
        </main>
      </div>
    </div>
  );
}
