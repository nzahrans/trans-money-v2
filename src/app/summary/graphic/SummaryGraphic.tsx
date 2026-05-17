import { API_BASE_URL } from "@/config/api";
﻿"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MonthlyChart from "../../../components/charts/MonthlyChart";
import PurposeChart from "../../../components/charts/PurposeChart";

type SummaryData = {
  monthlyDeposit: number[];
  monthlyWithdraw: number[];
  depositPurposeLabels: string[];
  depositPurposeValues: number[];
  withdrawPurposeLabels: string[];
  withdrawPurposeValues: number[];
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2022 }, (_, i) => 2023 + i).concat(CURRENT_YEAR + 1);

const inputClass =
  "text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-sky-900/40 bg-white dark:bg-[#0A1628] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50";

export default function SummaryGraphic() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [pieStartDate, setPieStartDate] = useState("");
  const [pieEndDate, setPieEndDate] = useState("");

  const fetchData = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/auth"); return; }

    const params = new URLSearchParams({ year: String(selectedYear) });
    if (pieStartDate) params.set("startDate", pieStartDate);
    if (pieEndDate) params.set("endDate", pieEndDate);

    setLoading(true);
    fetch(`${API_BASE_URL}/dashboard/graphic?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) throw new Error("Gagal mengambil data grafik");
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [router, selectedYear, pieStartDate, pieEndDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Grafik Ringkasan</h1>

      <div className="flex flex-col gap-6">
        {/* Bar chart full width + filter tahun */}
        <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Transaksi Bulanan</h2>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className={inputClass}
            >
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {data && (
            <MonthlyChart
              deposit={data.monthlyDeposit ?? Array(12).fill(0)}
              withdraw={data.monthlyWithdraw ?? Array(12).fill(0)}
            />
          )}
        </div>

        {/* Filter range + dua pie chart dalam satu card */}
        <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm overflow-hidden">
          {/* Header card */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-sky-900/20">
            <div>
              <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Distribusi Keperluan</h2>
              <p className="text-xs text-slate-400 dark:text-sky-300/40 mt-0.5">
                {(pieStartDate || pieEndDate)
                  ? `${pieStartDate || "∞"} – ${pieEndDate || "∞"}`
                  : `Seluruh tahun ${selectedYear}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={pieStartDate}
                onChange={e => setPieStartDate(e.target.value)}
                className={inputClass}
              />
              <span className="text-xs text-slate-400 dark:text-slate-500">–</span>
              <input
                type="date"
                value={pieEndDate}
                onChange={e => setPieEndDate(e.target.value)}
                className={inputClass}
              />
              {(pieStartDate || pieEndDate) && (
                <button
                  onClick={() => { setPieStartDate(""); setPieEndDate(""); }}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Dua pie chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-sky-900/20">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Deposit</p>
              </div>
              {data && data.depositPurposeValues.some(v => v > 0) ? (
                <PurposeChart
                  labels={data.depositPurposeLabels}
                  values={data.depositPurposeValues}
                  canvasId="deposit-purpose-chart"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-sky-900/20 flex items-center justify-center">
                    <span className="text-slate-300 dark:text-sky-700 text-lg">—</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada data deposit</p>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Withdraw</p>
              </div>
              {data && data.withdrawPurposeValues.some(v => v > 0) ? (
                <PurposeChart
                  labels={data.withdrawPurposeLabels}
                  values={data.withdrawPurposeValues}
                  canvasId="withdraw-purpose-chart"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-sky-900/20 flex items-center justify-center">
                    <span className="text-slate-300 dark:text-sky-700 text-lg">—</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada data withdraw</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
