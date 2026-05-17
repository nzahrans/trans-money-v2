"use client";
import { usePathname } from "next/navigation";
import Sidebar from "../Sidebar";
import ThemeToggle from "../ThemeToggle";
import UserBadge from "../UserBadge";
import PageTransition from "../PageTransition";

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
				<header className="h-14 flex items-center justify-between pl-14 pr-4 md:pr-6 lg:px-6 border-b-2 border-slate-200 dark:border-white/[0.10] bg-white dark:bg-[#091830] sticky top-0 z-20 shadow-sm gap-4">
					<div className="min-w-0 flex-1">
						<span className="text-base font-semibold text-slate-600 dark:text-sky-200/80 truncate hidden sm:block">
							Trans Kota Kita Money Management V2
						</span>
						<span className="text-sm font-semibold text-slate-600 dark:text-sky-200/80 truncate sm:hidden">
							Trans Money V2
						</span>
					</div>
					<div className="flex items-center gap-1 flex-shrink-0">
						<UserBadge />
						<ThemeToggle />
					</div>
				</header>
				<main className="flex-1 p-4 md:p-6 bg-gradient-to-br from-slate-50 via-white to-sky-50/30 dark:from-[#071426] dark:via-[#071426] dark:to-[#0D2D4E]">
					<PageTransition>{children}</PageTransition>
				</main>
				<footer className="py-4 px-6 border-t border-slate-100 dark:border-white/[0.05] bg-white/40 dark:bg-[#091830]/40 backdrop-blur-sm text-center text-xs text-slate-400 dark:text-sky-200/30 font-medium">
					<span>© {new Date().getFullYear()} Trans Kota Kita Money Management v2. Developed by <a href="https://www.instagram.com/szhrnn" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline decoration-2 transition-all">Naufal Zahran S</a></span>
				</footer>
			</div>
		</div>
	);
}
