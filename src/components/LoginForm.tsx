"use client";
import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal");
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo & Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/40 mb-5">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Trans Kota Kita</h1>
        <p className="text-sm text-indigo-300/70 mt-1">Masuk ke panel administrasi</p>
      </div>

      {/* Card */}
      <div className="bg-white/[0.06] backdrop-blur-sm rounded-2xl border border-white/10 p-7 shadow-2xl">
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-indigo-200/80 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300/50 pointer-events-none">
                <FaUser size={13} />
              </span>
              <input
                type="text"
                className="w-full border border-white/10 bg-white/[0.07] pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all text-white placeholder:text-indigo-300/40"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Masukkan username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-200/80 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300/50 pointer-events-none">
                <FaLock size={13} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-white/10 bg-white/[0.07] pl-9 pr-10 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all text-white placeholder:text-indigo-300/40"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Masukkan password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300/50 hover:text-indigo-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Memproses...
              </span>
            ) : (
              "Masuk"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
