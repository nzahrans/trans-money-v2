"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaChartBar,
  FaSignOutAlt,
  FaTable,
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaChevronDown,
  FaChartLine,
} from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/summary")) setSummaryOpen(true);
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      router.replace("/auth");
    }
  };

  const navLink = (href: string, label: string, icon: React.ReactNode, exact = false) => {
    const active = exact
      ? pathname === href
      : pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/8 hover:text-slate-200"
        }`}
      >
        <span className={active ? "text-white" : "text-slate-500"}>{icon}</span>
        {label}
      </Link>
    );
  };

  const isSummaryActive = pathname.startsWith("/summary");

  return (
    <aside className="h-screen w-60 bg-slate-900 flex flex-col fixed left-0 top-0 z-30 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <FaWallet size={14} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-white leading-tight truncate">Trans Kota Kita</p>
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Manajemen Keuangan</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 mt-2 px-3 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Menu</p>

        {navLink("/dashboard", "Dashboard", <FaWallet size={15} />, true)}
        {navLink("/deposit", "Deposit", <FaArrowDown size={15} />)}
        {navLink("/withdraw", "Withdraw", <FaArrowUp size={15} />)}

        {/* Summary with sub-menu */}
        <button
          onClick={() => setSummaryOpen(prev => !prev)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            isSummaryActive && !summaryOpen
              ? "bg-blue-600 text-white"
              : isSummaryActive
              ? "text-slate-200 bg-white/8"
              : "text-slate-400 hover:bg-white/8 hover:text-slate-200"
          }`}
        >
          <span className={isSummaryActive ? "text-blue-400" : "text-slate-500"}>
            <FaChartBar size={15} />
          </span>
          <span className="flex-1 text-left">Summary</span>
          <FaChevronDown
            size={11}
            className={`transition-transform duration-200 ${
              summaryOpen ? "rotate-180" : ""
            } ${isSummaryActive ? "text-slate-300" : "text-slate-600"}`}
          />
        </button>

        {summaryOpen && (
          <div className="ml-4 pl-3 border-l border-white/10 flex flex-col gap-0.5 mb-1">
            {([
              { href: "/summary/table", label: "Table", icon: <FaTable size={12} /> },
              { href: "/summary/graphic", label: "Graphic", icon: <FaChartLine size={12} /> },
            ] as const).map(sub => {
              const active = pathname === sub.href;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-white/8 hover:text-slate-200"
                  }`}
                >
                  <span className={active ? "text-white" : "text-slate-500"}>{sub.icon}</span>
                  {sub.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-2 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-colors"
        >
          <FaSignOutAlt size={15} className="text-slate-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}
