"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import DashboardCard from "../../components/DashboardCard";
import { FaEdit, FaTrash, FaWallet, FaArrowDown, FaArrowUp, FaTimes } from "react-icons/fa";

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

type Summary = {
  saldo: number;
  totalDeposit: number;
  totalWithdraw: number;
  lastTransactions: Transaction[];
};

type EditForm = { amount: string; purpose: string; notes: string; recorder: string; transactionDate: string };

const DEPOSIT_PURPOSES = ["Deposit Anggota Baru", "Denda Resign", "Setoran", "KTA Trans", "Other"];
const WITHDRAW_PURPOSES = ["Reimburse", "Sponsorship", "Gaji Pegawai", "Pajak", "Other"];

function getUsername(): string {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.name || payload.username || "";
  } catch { return ""; }
}

export default function DashboardMain() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [editingTrx, setEditingTrx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ amount: "", purpose: "", notes: "", recorder: "", transactionDate: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/auth");
      return;
    }
    setUsername(getUsername());
    setLoading(true);
    fetch("http://localhost:3001/dashboard/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal mengambil data dashboard");
        }
        return res.json();
      })
      .then((data) => {
        setSummary(data);
      })
      .catch((err) => setError(err.message))
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
    setEditForm({ amount: String(trx.amount), purpose: trx.purpose, notes: trx.notes ?? "", recorder: trx.recorder ?? "", transactionDate: (trx.transactionDate || trx.createdAt).slice(0, 10) });
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
        body: JSON.stringify({ amount: Number(editForm.amount), purpose: editForm.purpose, notes: editForm.notes, recorder: editForm.recorder, transactionDate: editForm.transactionDate || null }),
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

  if (loading) {
    return (
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
    <div className="w-full flex flex-col gap-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 dark:from-[#0f2756] dark:via-[#1a3f7a] dark:to-[#1e4d9e] p-4 md:p-6 flex items-center justify-between shadow-lg shadow-indigo-200/50 dark:shadow-blue-900/40">
        <div>
          <p className="text-sky-300/70 text-xs font-medium uppercase tracking-widest mb-1">Selamat datang,</p>
          <h1 className="text-2xl font-bold text-white">{username || "Dashboard"}</h1>
          <p className="text-sky-300/60 text-xs mt-1">
            Last updated: {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
        </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
          <FaWallet size={22} className="text-white/80" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          icon={<FaWallet />}
          label="Total Balance"
          value={`Rp ${(summary?.saldo ?? 0).toLocaleString("id-ID")}`}
          color="blue"
        />
        <DashboardCard
          icon={<FaArrowDown />}
          label="Total Deposits"
          value={`Rp ${(summary?.totalDeposit ?? 0).toLocaleString("id-ID")}`}
          color="green"
        />
        <DashboardCard
          icon={<FaArrowUp />}
          label="Total Withdrawals"
          value={`Rp ${(summary?.totalWithdraw ?? 0).toLocaleString("id-ID")}`}
          color="red"
        />
      </div>

      {/* Recent Activity */}
      {deleteError && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{deleteError}</div>
          <button onClick={() => setDeleteError("")} className="text-red-400 hover:text-red-600 transition-colors text-xs">✕</button>
        </div>
      )}
      <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-sky-900/30">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Recent Activity</h2>
          <Link
            href="/summary/table"
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-sky-50/60 dark:bg-sky-900/20">
                <th className="px-5 py-3 text-left font-medium">Actions</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Type</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-left font-medium hidden lg:table-cell">Recorder</th>
                <th className="px-5 py-3 text-left font-medium hidden md:table-cell">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-sky-900/20">
              {summary?.lastTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-sky-50/30 dark:hover:bg-sky-900/10 transition-colors">
                  <td className="px-5 py-3.5">
                    {deletingId === trx.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400 mr-0.5">Hapus?</span>
                        <button onClick={() => handleDelete(trx.id)} className="px-2 py-0.5 rounded text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">Ya</button>
                        <button onClick={() => setDeletingId(null)} className="px-2 py-0.5 rounded text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Batal</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(trx)} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors" title="Edit">
                          <FaEdit size={13} />
                        </button>
                        <button onClick={() => setDeletingId(trx.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Hapus">
                          <FaTrash size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(trx.transactionDate || trx.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })}
                    {!trx.transactionDate && <span className="ml-1 text-xs text-slate-300 dark:text-slate-600">(input)</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge type={trx.type} />
                  </td>
                  <td className={`px-5 py-3.5 text-right font-semibold tabular-nums ${
                    trx.type === "deposit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    Rp {trx.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 text-sm hidden lg:table-cell">
                    {trx.recorder || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-800 dark:text-slate-200 font-medium hidden md:table-cell">{trx.purpose}</td>
                </tr>
              ))}
              {(!summary?.lastTransactions || summary.lastTransactions.length === 0) && (
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

      {/* Edit Modal */}
      {editingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Edit Transaksi</h3>
              <button onClick={() => setEditingTrx(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <FaTimes size={14} />
              </button>
            </div>
            {editError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">{editError}</div>
            )}
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
                  {(editingTrx!.type === "deposit" ? DEPOSIT_PURPOSES : WITHDRAW_PURPOSES).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Pencatat</label>
                <div className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-100 dark:bg-[#071426] px-3 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400">
                  {editForm.recorder || <span className="italic">—</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Notes</label>
                <textarea rows={3} className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100 resize-none" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditingTrx(null)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Batal</button>
                <button onClick={handleEditSave} disabled={editLoading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-60">
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
