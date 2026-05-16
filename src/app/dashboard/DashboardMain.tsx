"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "../../components/StatusBadge";
import DashboardCard from "../../components/DashboardCard";
import { FaEdit, FaTrash, FaWallet, FaArrowDown, FaArrowUp } from "react-icons/fa";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  purpose: string;
  notes?: string;
  recorder?: string;
  createdAt: string;
};

type Summary = {
  saldo: number;
  totalDeposit: number;
  totalWithdraw: number;
  lastTransactions: Transaction[];
};

export default function DashboardMain() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/auth");
      return;
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Last updated: {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          href="/deposit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          + Transaksi Baru
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          icon={<FaWallet />}
          label="Total Saldo"
          value={`Rp ${summary?.saldo.toLocaleString("id-ID")}`}
          color="blue"
        />
        <DashboardCard
          icon={<FaArrowDown />}
          label="Total Deposit"
          value={`Rp ${summary?.totalDeposit.toLocaleString("id-ID")}`}
          color="green"
        />
        <DashboardCard
          icon={<FaArrowUp />}
          label="Total Withdraw"
          value={`Rp ${summary?.totalWithdraw.toLocaleString("id-ID")}`}
          color="red"
        />
      </div>
      {/* ...tambahkan logic transaksi terakhir jika perlu... */}
    </div>
  );
}
