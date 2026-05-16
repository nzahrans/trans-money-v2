"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt, FaChevronDown } from "react-icons/fa";

function decodeJwtPayload(token: string): { username?: string; id?: number; role?: string } | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function UserBadge() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = decodeJwtPayload(token);
    if (payload?.username) setUsername(payload.username);
    if (payload?.role) setRole(payload.role);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/auth");
  };

  if (!username) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {username[0].toUpperCase()}
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-indigo-200/80 max-w-[100px] truncate">
          {username}
        </span>
        <FaChevronDown
          size={10}
          className={`text-slate-400 dark:text-indigo-300/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 z-50 bg-white dark:bg-[#1a1635] rounded-xl border border-slate-100 dark:border-violet-900/30 shadow-lg shadow-slate-200/60 dark:shadow-violet-900/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-violet-900/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Login sebagai</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{username}</p>
              {role && (
                <span className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  role === 'admin'
                    ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                    : 'bg-slate-100 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400'
                }`}>{role}</span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <FaSignOutAlt size={13} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
