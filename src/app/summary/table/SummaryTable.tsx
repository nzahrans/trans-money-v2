"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  purpose: string;
  notes?: string;
  recorder?: string;
  createdAt: string;
};

export default function SummaryTable() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "deposit" | "withdraw">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/auth"); return; }
    fetch("http://localhost:3001/transaction/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) throw new Error("Gagal mengambil data transaksi");
        return res.json();
      })
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = transactions.filter(trx => {
    if (filter !== "all" && trx.type !== filter) return false;
    if (search && !trx.purpose.toLowerCase().includes(search.toLowerCase()) &&
        !(trx.recorder || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return (
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

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Riwayat Transaksi</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Cari keperluan / recorder..."
            className="border border-slate-200 dark:border-violet-700/30 bg-white dark:bg-[#211c45] px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 w-52 shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-slate-200 dark:border-violet-700/30 bg-white dark:bg-[#211c45] px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100 shadow-sm"
            value={filter}
            onChange={e => setFilter(e.target.value as "all" | "deposit" | "withdraw")}
          >
            <option value="all">Semua</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-violet-50/60 dark:bg-violet-900/20">
              <th className="px-5 py-3 text-left font-medium">Tanggal</th>
              <th className="px-5 py-3 text-left font-medium">Keperluan</th>
              <th className="px-5 py-3 text-left font-medium">Recorder</th>
              <th className="px-5 py-3 text-left font-medium">Tipe</th>
              <th className="px-5 py-3 text-right font-medium">Jumlah</th>
              <th className="px-5 py-3 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-violet-900/20">
            {filtered.map(trx => (
              <tr key={trx.id} className="hover:bg-violet-50/40 dark:hover:bg-violet-900/10 transition-colors">
                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                  {new Date(trx.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5 text-slate-800 dark:text-slate-100 font-medium">{trx.purpose}</td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 text-xs">
                  {trx.recorder || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
                </td>
                <td className="px-5 py-3.5"><StatusBadge type={trx.type} /></td>
                <td className={`px-5 py-3.5 text-right font-semibold tabular-nums ${trx.type === "deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {trx.type === "withdraw" ? "−" : "+"}Rp {trx.amount.toLocaleString("id-ID")}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-400 dark:text-slate-500 max-w-[200px] truncate">
                  {trx.notes || <span className="italic">—</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Belum ada transaksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
