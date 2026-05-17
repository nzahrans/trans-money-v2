import { API_BASE_URL } from "@/config/api";
﻿"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "../../../lib/useUserRole";
import { FaTrash, FaTimes, FaUserPlus, FaUser, FaShieldAlt, FaEdit } from "react-icons/fa";
import ConfirmModal from "../../../components/ConfirmModal";
import toast from "react-hot-toast";
import { handleAuthError } from "../../../lib/authRedirect";

type User = {
  id: number;
  username: string;
  name?: string;
  role: string;
  createdAt: string;
};

type CreateForm = { username: string; password: string; role: "admin" | "pengurus"; name: string };
type EditUserForm = { name: string; username: string; password: string; role: "admin" | "pengurus" };

export default function ManageUsersPage() {
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateForm>({ username: "", password: "", role: "pengurus", name: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState<EditUserForm>({ name: "", username: "", password: "", role: "pengurus" });
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState("");

  const fetchUsers = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/auth"); return; }
    setLoading(true);
    fetch(`${API_BASE_URL}/users/manage`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (handleAuthError(res.status)) return;
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Akses ditolak"); }
        return res.json();
      })
      .then((data) => { if (data) setUsers(Array.isArray(data) ? data : []); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router, refreshKey]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) { router.replace("/dashboard"); }
  }, [roleLoading, isAdmin, router]);

  useEffect(() => { if (!roleLoading && isAdmin) fetchUsers(); }, [fetchUsers, roleLoading, isAdmin]);

  const handleDelete = async (id: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (handleAuthError(res.status)) return;
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Hapus gagal"); }
      setDeletingId(null);
      toast.success("Pengguna berhasil dihapus");
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      setDeletingId(null);
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setFormError("Username dan password wajib diisi"); return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setFormLoading(true); setFormError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ username: form.username.trim(), password: form.password, role: form.role, name: form.name.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat user");
      toast.success(`User "${form.username}" berhasil dibuat`);
      setForm({ username: "", password: "", role: "pengurus", name: "" });
      setShowForm(false);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserForm({ name: user.name || "", username: user.username, password: "", role: user.role as "admin" | "pengurus" });
    setEditUserError("");
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editUserForm.username.trim()) { setEditUserError("Username tidak boleh kosong"); return; }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setEditUserLoading(true); setEditUserError("");
    try {
      const body: Record<string, string | null> = {
        username: editUserForm.username.trim(),
        name: editUserForm.name.trim() || null,
        role: editUserForm.role,
      };
      if (editUserForm.password) body.password = editUserForm.password;
      const res = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (handleAuthError(res.status)) return;
      if (!res.ok) throw new Error(data.error || "Gagal update user");
      setEditingUser(null);
      toast.success("Pengguna berhasil diperbarui");
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      setEditUserError(err.message);
    } finally {
      setEditUserLoading(false);
    }
  };

  if (roleLoading || loading) return (
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
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-sky-900/30">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Edit Pengguna</h2>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"><FaTimes size={13} /></button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 flex flex-col gap-4">
              {editUserError && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">{editUserError}</div>}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Nama Tampilan</label>
                <input
                  type="text"
                  placeholder="Nama (opsional)"
                  className="border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                  value={editUserForm.name}
                  onChange={e => setEditUserForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Username <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="Username (tanpa spasi)"
                  className="border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                  value={editUserForm.username}
                  onChange={e => setEditUserForm(f => ({ ...f, username: e.target.value.replace(/\s/g, "") }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Password Baru <span className="text-slate-400 font-normal">(kosongkan jika tidak diganti)</span></label>
                <input
                  type="password"
                  placeholder="Password baru"
                  className="border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                  value={editUserForm.password}
                  onChange={e => setEditUserForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Role</label>
                <select
                  className="border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                  value={editUserForm.role}
                  onChange={e => setEditUserForm(f => ({ ...f, role: e.target.value as "admin" | "pengurus" }))}
                >
                  <option value="pengurus">Pengurus</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">Batal</button>
                <button type="submit" disabled={editUserLoading} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-60">{editUserLoading ? "Menyimpan..." : "Simpan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Kelola Pengguna</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setFormError(""); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all shadow-sm"
        >
          <FaUserPlus size={14} /> Tambah Pengguna
        </button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Buat Pengguna Baru</h2>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"><FaTimes size={13} /></button>
          </div>
          {formError && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">{formError}</div>}
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Username (untuk login, tanpa spasi)"
                className="flex-1 border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.replace(/\s/g, "") }))}
                autoComplete="off"
              />
              <input
                type="text"
                placeholder="Nama tampilan (opsional)"
                className="flex-1 border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                placeholder="Password"
                className="flex-1 border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
              />
              <select
                className="border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as "admin" | "pengurus" }))}
              >
                <option value="pengurus">Pengurus</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-60 whitespace-nowrap"
              >
                {formLoading ? "Menyimpan..." : "Buat"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-sky-50/60 dark:bg-sky-900/20">
                <th className="px-5 py-3 text-left font-medium">Pengguna</th>
                <th className="px-5 py-3 text-left font-medium">Role</th>
                <th className="px-5 py-3 text-left font-medium">Bergabung</th>
                <th className="px-5 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-sky-900/20">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-sky-50/30 dark:hover:bg-sky-900/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0">
                        <FaUser size={12} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{user.name || user.username}</div>
                        {user.name && <div className="text-xs text-slate-400 dark:text-slate-500">@{user.username}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300"
                        : "bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400"
                    }`}>
                      {user.role === "admin" && <FaShieldAlt size={10} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditUser(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                        title="Edit pengguna"
                      >
                        <FaEdit size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingId(user.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Hapus pengguna"
                      >
                        <FaTrash size={13} />
                      </button>
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

      {/* Confirm Delete Modal */}
      {deletingId !== null && (
        <ConfirmModal
          message="Pengguna yang dihapus tidak bisa dikembalikan."
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => setDeletingId(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
