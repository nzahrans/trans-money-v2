"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuditLog = {
  id: number;
  action: string;
  userId: number;
  createdAt?: string;
};

export default function AuditLogTable() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/auth");
      return;
    }
    fetch("http://localhost:3001/auditlog", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal mengambil audit log");
        }
        return res.json();
      })
      .then((data) => setLogs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-violet-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-sm text-slate-500 dark:text-slate-400">Memuat data...</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Audit Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Rekam aktivitas sistem</p>
        </div>
        <input
          type="text"
          placeholder="Cari aksi..."
          className="border border-slate-200 dark:border-violet-700/30 bg-white dark:bg-[#211c45] px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 w-52 shadow-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-violet-50/60 dark:bg-violet-900/20">
                <th className="px-5 py-3 text-left font-medium w-16">ID</th>
                <th className="px-5 py-3 text-left font-medium">Waktu</th>
                <th className="px-5 py-3 text-left font-medium">Aksi</th>
                <th className="px-5 py-3 text-right font-medium w-24">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-violet-900/20">
              {logs
                .filter(log => !search || log.action.toLowerCase().includes(search.toLowerCase()))
                .map((log) => (
                <tr key={log.id} className="hover:bg-violet-50/40 dark:hover:bg-violet-900/10 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 tabular-nums">{log.id}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : <span className="italic text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-700 dark:text-slate-300">{log.action}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600 dark:text-slate-400 tabular-nums">{log.userId}</td>
                </tr>
              ))}
              {logs.filter(log => !search || log.action.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                    Tidak ada log aktivitas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
