"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  purpose: string;
  notes?: string;
  recorder?: string;
  createdAt: string;
};

type EditForm = { amount: string; purpose: string; notes: string; recorder: string };

const LIMIT = 20;

export default function TransactionHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [editingTrx, setEditingTrx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ amount: "", purpose: "", notes: "", recorder: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchHistory = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/auth"); return; }
    setLoading(true);
    fetch(`http://localhost:3001/transaction/history?page=${page}&limit=${LIMIT}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Gagal mengambil riwayat"); }
        return res.json();
      })
      .then((data) => {
        setHistory(Array.isArray(data.transactions) ? data.transactions : []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router, page, refreshKey]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = async (id: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`http://localhost:3001/transaction/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Hapus gagal"); }
      setDeletingId(null);
      setDeleteError("");
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      setDeletingId(null);
      setDeleteError(err.message);
    }
  };

  const openEdit = (trx: Transaction) => {
    setEditingTrx(trx);
    setEditForm({ amount: String(trx.amount), purpose: trx.purpose, notes: trx.notes ?? "", recorder: trx.recorder ?? "" });
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editingTrx) return;
    setEditLoading(true); setEditError("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`http://localhost:3001/transaction/${editingTrx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ amount: Number(editForm.amount), purpose: editForm.purpose, notes: editForm.notes, recorder: editForm.recorder }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Edit gagal");
      setEditingTrx(null);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Riwayat Transaksi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Total {total} transaksi</p>
        </div>
      </div>

      {deleteError && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
          {deleteError}
          <button onClick={() => setDeleteError("")} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/20"><FaTimes size={12} /></button>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-violet-50/60 dark:bg-violet-900/20">
                <th className="px-5 py-3 text-left font-medium">Tanggal</th>
                <th className="px-5 py-3 text-left font-medium">Keperluan</th>
                <th className="px-5 py-3 text-left font-medium">Catatan</th>
                <th className="px-5 py-3 text-left font-medium">Tipe</th>
                <th className="px-5 py-3 text-right font-medium">Jumlah</th>
                <th className="px-5 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-violet-900/20">
              {history.map((trx) => (
                <tr key={trx.id} className="hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                    {new Date(trx.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}
                  </td>
                  <td className="px-5 py-3.5 text-slate-800 dark:text-slate-200 font-medium">{trx.purpose}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs max-w-[160px] truncate">
                    {trx.notes || <span className="italic text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge type={trx.type} /></td>
                  <td className={`px-5 py-3.5 text-right font-semibold tabular-nums ${trx.type === "deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {trx.type === "withdraw" ? "−" : "+"}Rp {trx.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      {deletingId === trx.id ? (
                        <>
                          <button onClick={() => handleDelete(trx.id)} className="px-2 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">Hapus</button>
                          <button onClick={() => setDeletingId(null)} className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">Batal</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => openEdit(trx)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors"><FaEdit size={13} /></button>
                          <button onClick={() => setDeletingId(trx.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><FaTrash size={13} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">Belum ada riwayat transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-violet-900/20">
            <span className="text-xs text-slate-500 dark:text-slate-400">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-violet-900/30 disabled:opacity-40 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors text-slate-600 dark:text-slate-300">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-violet-900/30 disabled:opacity-40 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors text-slate-600 dark:text-slate-300">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Edit Transaksi</h3>
              <button onClick={() => setEditingTrx(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"><FaTimes size={14} /></button>
            </div>
            {editError && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">{editError}</div>}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Jumlah (Rp)</label>
                <input type="number" min={1} className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Keperluan</label>
                <input type="text" className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100" value={editForm.purpose} onChange={e => setEditForm(f => ({ ...f, purpose: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Catatan</label>
                <input type="text" className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingTrx(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-violet-900/30 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleEditSave} disabled={editLoading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-60">
                {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

