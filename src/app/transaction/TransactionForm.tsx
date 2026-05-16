"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TransactionForm() {
  const router = useRouter();
  const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/auth");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/transaction/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, purpose, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transaksi gagal");
      setSuccess(`Transaksi ${type} berhasil!`);
      setAmount("");
      setPurpose("");
      setNotes("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Transaksi Baru</h1>
      <div className="max-w-lg">
        <div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-sm overflow-hidden">
          {/* Type Tab */}
          <div className="flex border-b border-slate-100 dark:border-violet-900/30">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                type === 'deposit'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-slate-400'
              }`}
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setType('withdraw')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                type === 'withdraw'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-slate-400'
              }`}
            >
              Withdraw
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {success}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Jumlah <span className="text-slate-400 font-normal">(Rp)</span>
              </label>
              <input
                type="number"
                className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                min={1}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Keperluan</label>
              <input
                type="text"
                className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                required
                placeholder="Contoh: Setoran kas rutin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Catatan <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Catatan tambahan"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
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
                `Submit ${type === 'deposit' ? 'Deposit' : 'Withdraw'}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


export default function TransactionForm() {
  const router = useRouter();
  const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/auth");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/transaction/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, purpose, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transaksi gagal");
      setSuccess(`Transaksi ${type} berhasil!`);
      setAmount("");
      setPurpose("");
      setNotes("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Transaksi Baru</h1>
      <div className="max-w-lg">
        <div className="bg-white dark:bg-[#161b27] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Type Tab */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                type === 'deposit'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-slate-400'
              }`}
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setType('withdraw')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                type === 'withdraw'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-slate-400'
              }`}
            >
              Withdraw
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {success}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Jumlah <span className="text-slate-400 font-normal">(Rp)</span>
              </label>
              <input
                type="number"
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                min={1}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Keperluan</label>
              <input
                type="text"
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                required
                placeholder="Contoh: Setoran kas rutin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Catatan <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Catatan tambahan"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm ${
                type === 'deposit' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
              }`}
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
                `Submit ${type === 'deposit' ? 'Deposit' : 'Withdraw'}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
