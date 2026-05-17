"use client";
import { usePathname } from "next/navigation";
import Sidebar from "../Sidebar";
import ThemeToggle from "../ThemeToggle";
import UserBadge from "../UserBadge";

export default function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAuthPage = pathname.startsWith("/auth");

	if (isAuthPage) {
		return <div className="min-h-screen">{children}</div>;
	}

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
			<header className="h-14 flex items-center justify-between px-6 lg:px-6 pl-14 lg:pl-6 border-b-2 border-slate-200 dark:border-white/[0.10] bg-white dark:bg-[#091830] sticky top-0 z-20 shadow-sm">
				<span className="text-base font-semibold text-slate-600 dark:text-sky-200/80">
						Trans Kota Kita Money Management V2
					</span>
					<div className="flex items-center gap-1">
						<UserBadge />
						<ThemeToggle />
					</div>
				</header>
				<main className="flex-1 p-6 bg-gradient-to-br from-slate-50 via-white to-sky-50/30 dark:from-[#071426] dark:via-[#071426] dark:to-[#0D2D4E]">
					{children}
				</main>
			</div>
		</div>
	);
}
