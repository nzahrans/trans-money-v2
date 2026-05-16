"use client";
import { useEffect, useState } from "react";
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

export default function SummaryTable() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "deposit" | "withdraw">("all");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [editingTrx, setEditingTrx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ amount: "", purpose: "", notes: "", recorder: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/auth"); return; }
    setLoading(true);
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
  }, [router, refreshKey]);

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
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Summary</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Menampilkan {filtered.length} dari {transactions.length} transaksi</p>
        </div>
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

      {deleteError && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{deleteError}
        </div>
      )}

      <div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-violet-50/60 dark:bg-violet-900/20">
              <th className="px-5 py-3 text-left font-medium">Aksi</th>
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
                <td className="px-5 py-3.5">
                  {deletingId === trx.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 mr-0.5">Hapus?</span>
                      <button onClick={() => handleDelete(trx.id)} className="px-2 py-0.5 rounded text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">Ya</button>
                      <button onClick={() => setDeletingId(null)} className="px-2 py-0.5 rounded text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Batal</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(trx)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors" title="Edit"><FaEdit size={13} /></button>
                      <button onClick={() => setDeletingId(trx.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Hapus"><FaTrash size={13} /></button>
                    </div>
                  )}
                </td>
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
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                  Belum ada transaksi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Edit Transaksi</h3>
              <button onClick={() => setEditingTrx(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"><FaTimes size={14} /></button>
            </div>
            {editError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">{editError}</div>
            )}
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
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Recorder</label>
                <input type="text" className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100" value={editForm.recorder} onChange={e => setEditForm(f => ({ ...f, recorder: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Notes</label>
                <textarea rows={3} className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100 resize-none" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditingTrx(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Batal</button>
                <button onClick={handleEditSave} disabled={editLoading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-60">
                  {editLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
