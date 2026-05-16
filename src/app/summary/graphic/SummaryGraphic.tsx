"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MonthlyChart from "../../../components/charts/MonthlyChart";
import PurposeChart from "../../../components/charts/PurposeChart";

type SummaryData = {
  monthlyDeposit: number[];
  monthlyWithdraw: number[];
  purposeLabels: string[];
  purposeValues: number[];
};

export default function SummaryGraphic() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/auth"); return; }
    fetch("http://localhost:3001/dashboard/summary", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) throw new Error("Gagal mengambil data grafik");
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
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

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Grafik Ringkasan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#161b27] rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4">Transaksi Bulanan</h2>
          {data && (
            <MonthlyChart
              deposit={data.monthlyDeposit ?? Array(12).fill(0)}
              withdraw={data.monthlyWithdraw ?? Array(12).fill(0)}
            />
          )}
        </div>

        <div className="bg-white dark:bg-[#161b27] rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-4">Distribusi Keperluan</h2>
          {data && (data.purposeLabels?.length ?? 0) > 0 ? (
            <PurposeChart
              labels={data.purposeLabels ?? []}
              values={data.purposeValues ?? []}
            />
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">Belum ada data keperluan</p>
          )}
        </div>
      </div>
    </div>
  );
}
