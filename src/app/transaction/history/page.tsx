"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";
import { FaEdit, FaTrash } from "react-icons/fa";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  purpose: string;
  notes?: string;
  createdAt: string;
};

export default function TransactionHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/auth");
      return;
    }
    fetch("http://localhost:3001/transaction/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal mengambil riwayat transaksi");
        }
        return res.json();
      })
      .then((data) => setHistory(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Riwayat Transaksi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{history.length} transaksi ditemukan</p>
        </div>
      </div>
      <div className="bg-white dark:bg-[#161b27] rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-5 py-3 text-left font-medium">Tanggal</th>
                <th className="px-5 py-3 text-left font-medium">Keperluan</th>
                <th className="px-5 py-3 text-left font-medium">Catatan</th>
                <th className="px-5 py-3 text-left font-medium">Tipe</th>
                <th className="px-5 py-3 text-right font-medium">Jumlah</th>
                <th className="px-5 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                    {new Date(trx.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 text-slate-800 dark:text-slate-200 font-medium">{trx.purpose}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs max-w-[160px] truncate">
                    {trx.notes || <span className="italic text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge type={trx.type} />
                  </td>
                  <td className={`px-5 py-3.5 text-right font-semibold tabular-nums ${
                    trx.type === "deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {trx.type === "withdraw" ? "−" : "+"}Rp {trx.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors" title="Edit">
                        <FaEdit size={13} />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Hapus">
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                    Belum ada riwayat transaksi
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
