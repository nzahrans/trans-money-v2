"use client";
import { API_BASE_URL } from "@/config/api";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";
import ConfirmModal from "../../../components/ConfirmModal";
import TableSkeleton from "../../../components/TableSkeleton";
import { FaEdit, FaTrash, FaTimes, FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";
import { handleAuthError } from "../../../lib/authRedirect";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  purpose: string;
  notes?: string;
  recorder?: string;
  transactionDate?: string;
  createdAt: string;
};

type EditForm = { amount: string; purpose: string; notes: string; recorder: string; transactionDate: string };

const DEPOSIT_PURPOSES = ["Deposit Anggota Baru", "Denda Resign", "Setoran", "KTA Trans", "Other"];
const WITHDRAW_PURPOSES = ["Reimburse", "Sponsorship", "Gaji Pegawai", "Pajak", "Other"];

const LIMIT = 20;

export default function HistoryClient() {
  const router = useRouter();
  const [history, setHistory] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingTrx, setEditingTrx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ amount: "", purpose: "", notes: "", recorder: "", transactionDate: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchHistory = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/auth"); return; }
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    fetch(`${API_BASE_URL}/transaction/history?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (handleAuthError(res.status)) return;
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Gagal mengambil riwayat"); }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setHistory(Array.isArray(data.transactions) ? data.transactions : []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router, page, refreshKey, dateFrom, dateTo]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = async (id: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/transaction/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (handleAuthError(res.status)) return;
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Hapus gagal"); }
      setDeleteTarget(null);
      toast.success("Transaksi berhasil dihapus");
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      setDeleteTarget(null);
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (trx: Transaction) => {
    setEditingTrx(trx);
    setEditForm({ amount: String(trx.amount), purpose: trx.purpose, notes: trx.notes ?? "", recorder: trx.recorder ?? "", transactionDate: (trx.transactionDate || trx.createdAt).slice(0, 10) });
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editingTrx) return;
    setEditLoading(true); setEditError("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${API_BASE_URL}/transaction/${editingTrx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ amount: Number(editForm.amount), purpose: editForm.purpose, notes: editForm.notes, recorder: editForm.recorder, transactionDate: editForm.transactionDate || null }),
      });
      const data = await res.json();
      if (handleAuthError(res.status)) return;
      if (!res.ok) throw new Error(data.error || "Edit gagal");
      setEditingTrx(null);
      toast.success("Transaksi berhasil diperbarui");
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
        <svg className="animate-spin h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24">
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
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Riwayat Transaksi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Total {total} transaksi</p>
        </div>
        {/* Filter tanggal */}
        <div className="flex items-center gap-2 flex-wrap">
          <FaFilter size={12} className="text-slate-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="border border-slate-200 dark:border-sky-700/30 bg-white dark:bg-[#0A1628] px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 dark:text-slate-300"
          />
          <span className="text-xs text-slate-400">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="border border-slate-200 dark:border-sky-700/30 bg-white dark:bg-[#0A1628] px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 dark:text-slate-300"
          />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors px-1">× Reset</button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-sky-50/60 dark:bg-sky-900/20">
                <th className="px-5 py-3 text-left font-medium">Tanggal</th>
                <th className="px-5 py-3 text-left font-medium">Tipe</th>
                <th className="px-5 py-3 text-left font-medium">Jumlah</th>
                <th className="px-5 py-3 text-left font-medium hidden lg:table-cell">Petugas</th>
                <th className="px-5 py-3 text-left font-medium">Keperluan</th>
                <th className="px-5 py-3 text-left font-medium hidden lg:table-cell">Notes</th>
                <th className="px-5 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-sky-900/20">
              {history.map((trx) => (
                <tr key={trx.id} className="hover:bg-sky-50/30 dark:hover:bg-sky-900/10 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(trx.transactionDate || trx.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}
                    {!trx.transactionDate && <span className="ml-1 text-xs text-slate-300 dark:text-slate-600">(input)</span>}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge type={trx.type} /></td>
                  <td className={`px-5 py-3.5 text-left font-semibold tabular-nums ${trx.type === "deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {trx.type === "withdraw" ? "−" : "+"}Rp {trx.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 text-sm hidden lg:table-cell">
                    {trx.recorder || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-800 dark:text-slate-200 font-medium">{trx.purpose}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-sm max-w-[200px] truncate hidden lg:table-cell">
                    {trx.notes || <span className="italic text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(trx)} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"><FaEdit size={13} /></button>
                      <button onClick={() => setDeleteTarget(trx.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><FaTrash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">Belum ada riwayat transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {history.map((trx) => (
          <div key={trx.id} className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {new Date(trx.transactionDate || trx.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}
                {!trx.transactionDate && <span className="ml-1 text-[10px] text-slate-300 dark:text-slate-600">(input)</span>}
              </span>
              <StatusBadge type={trx.type} />
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{trx.purpose}</h4>
              {trx.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                  "{trx.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-sky-900/20">
              <span className={`text-base font-semibold tabular-nums ${trx.type === "deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {trx.type === "withdraw" ? "−" : "+"}Rp {trx.amount.toLocaleString("id-ID")}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(trx)} className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors border border-slate-100 dark:border-sky-900/30 flex items-center gap-1.5 text-xs font-medium px-3 py-1">
                  <FaEdit size={12} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(trx.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border border-slate-100 dark:border-sky-900/30 flex items-center gap-1.5 text-xs font-medium px-3 py-1">
                  <FaTrash size={12} /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            Belum ada riwayat transaksi
          </div>
        )}
      </div>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3.5 bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">Halaman {page} dari {totalPages}</span>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-sky-900/30 disabled:opacity-40 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors text-slate-600 dark:text-slate-300 font-medium">← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-sky-900/30 disabled:opacity-40 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors text-slate-600 dark:text-slate-300 font-medium">Next →</button>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteTarget !== null && (
        <ConfirmModal
          message="Transaksi yang dihapus tidak bisa dikembalikan."
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
      {editingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Edit Transaksi</h3>
              <button onClick={() => setEditingTrx(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"><FaTimes size={14} /></button>
            </div>
            {editError && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">{editError}</div>}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tanggal Transaksi</label>
                <input type="date" className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100" value={editForm.transactionDate} onChange={e => setEditForm(f => ({ ...f, transactionDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Jumlah (Rp)</label>
                <input type="number" min={1} className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Keperluan</label>
                <select className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100" value={editForm.purpose} onChange={e => setEditForm(f => ({ ...f, purpose: e.target.value }))}>
                  {(editingTrx.type === "deposit" ? DEPOSIT_PURPOSES : WITHDRAW_PURPOSES).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Catatan</label>
                <input type="text" className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingTrx(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-sky-900/30 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleEditSave} disabled={editLoading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-60">
                {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

