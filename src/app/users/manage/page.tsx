"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "../../../lib/useUserRole";
import { FaTrash, FaTimes, FaUserPlus, FaUser, FaShieldAlt } from "react-icons/fa";

type User = {
  id: number;
  username: string;
  role: string;
  createdAt: string;
};

type CreateForm = { username: string; password: string; role: "admin" | "pengurus" };

export default function ManageUsersPage() {
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateForm>({ username: "", password: "", role: "pengurus" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchUsers = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/auth"); return; }
    setLoading(true);
    fetch("http://localhost:3001/users/manage", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Akses ditolak"); }
        return res.json();
      })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router, refreshKey]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) { router.replace("/dashboard"); }
  }, [roleLoading, isAdmin, router]);

  useEffect(() => { if (!roleLoading && isAdmin) fetchUsers(); }, [fetchUsers, roleLoading, isAdmin]);

  const handleDelete = async (id: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setDeleteError("");
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Hapus gagal"); }
      setDeletingId(null);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      setDeletingId(null);
      setDeleteError(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setFormError("Username dan password wajib diisi"); return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setFormLoading(true); setFormError(""); setFormSuccess("");
    try {
      const res = await fetch("http://localhost:3001/auth/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ username: form.username.trim(), password: form.password, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat user");
      setFormSuccess(`User "${form.username}" berhasil dibuat`);
      setForm({ username: "", password: "", role: "pengurus" });
      setShowForm(false);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (roleLoading || loading) return (
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
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Kelola Pengguna</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setFormError(""); setFormSuccess(""); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 transition-all shadow-sm"
        >
          <FaUserPlus size={14} /> Tambah Pengguna
        </button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Buat Pengguna Baru</h2>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"><FaTimes size={13} /></button>
          </div>
          {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">{formError}</div>}
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Username"
              className="flex-1 border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              autoComplete="off"
            />
            <input
              type="password"
              placeholder="Password"
              className="flex-1 border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
            />
            <select
              className="border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as "admin" | "pengurus" }))}
            >
              <option value="pengurus">Pengurus</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-60 whitespace-nowrap"
            >
              {formLoading ? "Menyimpan..." : "Buat"}
            </button>
          </form>
        </div>
      )}

      {/* Success toast */}
      {formSuccess && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-400">
          {formSuccess}
          <button onClick={() => setFormSuccess("")} className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-500/20"><FaTimes size={12} /></button>
        </div>
      )}

      {/* Delete error */}
      {deleteError && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
          {deleteError}
          <button onClick={() => setDeleteError("")} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/20"><FaTimes size={12} /></button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-violet-50/60 dark:bg-violet-900/20">
                <th className="px-5 py-3 text-left font-medium">Pengguna</th>
                <th className="px-5 py-3 text-left font-medium">Role</th>
                <th className="px-5 py-3 text-left font-medium">Bergabung</th>
                <th className="px-5 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-violet-900/20">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400 flex-shrink-0">
                        <FaUser size={12} />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                        : "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400"
                    }`}>
                      {user.role === "admin" && <FaShieldAlt size={10} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center">
                      {deletingId === user.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(user.id)} className="px-2.5 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium">Hapus</button>
                          <button onClick={() => setDeletingId(null)} className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">Batal</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(user.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Hapus pengguna"
                        >
                          <FaTrash size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">Belum ada pengguna</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
