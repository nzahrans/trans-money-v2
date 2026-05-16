"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartBar,
  FaTable,
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaChevronDown,
  FaChartLine,
  FaDownload,
  FaHistory,
} from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/summary")) setSummaryOpen(true);
  }, [pathname]);

  const navLink = (href: string, label: string, icon: React.ReactNode, exact = false) => {
    const active = exact
      ? pathname === href
      : pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all border-l-2 ${
          active
            ? "bg-violet-100 text-violet-900 border-violet-500 pl-[10px] shadow-sm dark:bg-white/[0.12] dark:text-white dark:border-violet-400"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-transparent dark:text-indigo-200/60 dark:hover:bg-white/[0.06] dark:hover:text-indigo-100"
        }`}
      >
        <span className={active ? "text-violet-600 dark:text-violet-300" : "text-slate-400 dark:text-indigo-300/50"}>{icon}</span>
        {label}
      </Link>
    );
  };

  const isSummaryActive = pathname.startsWith("/summary");

  return (
    <aside className="h-screen w-60 bg-white dark:bg-[#1e1b4b] border-r-2 border-slate-200 dark:border-white/[0.10] flex flex-col fixed left-0 top-0 z-30 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/40">
          <FaWallet size={15} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">Trans Kota Kita</p>
          <p className="text-[10px] text-slate-400 dark:text-indigo-300/50 leading-tight mt-0.5">Manajemen Keuangan</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 mt-2 px-3 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-slate-400 dark:text-indigo-300/40 uppercase tracking-widest">Menu</p>

        {navLink("/dashboard", "Dashboard", <FaWallet size={15} />, true)}
        {navLink("/deposit", "Deposit", <FaArrowDown size={15} />)}
        {navLink("/withdraw", "Withdraw", <FaArrowUp size={15} />)}

        {/* Summary with sub-menu */}
        <button
          onClick={() => setSummaryOpen(prev => !prev)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all border-l-2 ${
            isSummaryActive
              ? "bg-violet-100 text-violet-900 border-violet-500 pl-[10px] shadow-sm dark:bg-white/[0.12] dark:text-white dark:border-violet-400"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-transparent dark:text-indigo-200/60 dark:hover:bg-white/[0.06] dark:hover:text-indigo-100"
          }`}
        >
          <span className={isSummaryActive ? "text-violet-600 dark:text-violet-300" : "text-slate-400 dark:text-indigo-300/50"}>
            <FaChartBar size={15} />
          </span>
          <span className="flex-1 text-left">Summary</span>
          <FaChevronDown
            size={11}
            className={`transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""} ${
              isSummaryActive ? "text-violet-600 dark:text-indigo-300" : "text-slate-400 dark:text-indigo-400/40"
            }`}
          />
        </button>

        {summaryOpen && (
          <div className="ml-4 pl-3 border-l border-slate-200 dark:border-indigo-400/20 flex flex-col gap-0.5 mb-1">
            {([
              { href: "/summary/table", label: "Table", icon: <FaTable size={12} /> },
              { href: "/summary/graphic", label: "Graphic", icon: <FaChartLine size={12} /> },
            ] as const).map(sub => {
              const active = pathname === sub.href;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-violet-100 text-violet-900 dark:bg-white/[0.12] dark:text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-indigo-200/50 dark:hover:bg-white/[0.05] dark:hover:text-indigo-100"
                  }`}
                >
                  <span className={active ? "text-violet-600 dark:text-violet-300" : "text-slate-400 dark:text-indigo-300/40"}>{sub.icon}</span>
                  {sub.label}
                </Link>
              );
            })}
          </div>
        )}

        <p className="px-3 py-2 mt-2 text-[10px] font-semibold text-slate-400 dark:text-indigo-300/40 uppercase tracking-widest">Tools</p>
        {navLink("/export", "Export Data", <FaDownload size={14} />)}
        {navLink("/auditlog", "Audit Log", <FaHistory size={14} />)}
      </nav>
    </aside>
  );
}
