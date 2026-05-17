"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExportPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState<"csv" | "pdf" | "chart" | null>(null);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartYear, setChartYear] = useState(new Date().getFullYear());

  const getToken = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/auth"); return null; }
    return token;
  };

  const downloadFile = async (url: string, filename: string, type: "csv" | "pdf" | "chart") => {
    setLoading(type);
    setError("");
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Export gagal");
      }
      let blob: Blob;
      if (type === "pdf") {
        // PDF dikirim sebagai base64 JSON untuk menghindari intercept download manager
        const json = await res.json();
        const bytes = Uint8Array.from(atob(json.data), c => c.charCodeAt(0));
        blob = new Blob([bytes], { type: "application/pdf" });
        filename = json.filename ?? filename;
      } else {
        blob = await res.blob();
      }
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(a.href);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const dateQuery = () => {
    const p = new URLSearchParams();
    if (startDate) p.set("startDate", startDate);
    if (endDate) p.set("endDate", endDate);
    return p.toString() ? `?${p.toString()}` : "";
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Judul */}
      <div className="w-full text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Export Data</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Download data transaksi dalam berbagai format</p>
      </div>

      {error && (
        <div className="w-full max-w-3xl p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filter Tanggal */}
      <div className="w-full max-w-3xl bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filter Rentang Tanggal <span className="font-normal text-slate-400 dark:text-slate-500">(berlaku untuk CSV & PDF)</span></p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Dari Tanggal</label>
            <input type="date" className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Sampai Tanggal</label>
            <input type="date" className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        {(startDate || endDate) && (
          <button type="button" onClick={() => { setStartDate(""); setEndDate(""); }} className="mt-3 text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
            ✕ Reset filter tanggal
          </button>
        )}
      </div>

      {/* Kartu Export */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CSV */}
        <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Export CSV</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Data transaksi dalam format spreadsheet. Bisa dibuka langsung di Excel.</p>
            </div>
          </div>
          <button
            onClick={() => downloadFile(`http://localhost:3001/transaction/export/csv${dateQuery()}`, "transactions.csv", "csv")}
            className="mt-auto w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-sky-200 dark:shadow-sky-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading !== null}
          >
            {loading === "csv" ? <Spinner /> : "Download CSV"}
          </button>
        </div>

        {/* Chart CSV */}
        <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Data Chart</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Data bulanan deposit & withdraw per tahun dalam format CSV.</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 text-center">Pilih Tahun</label>
            <input
              type="number" min={2020} max={2099}
              className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-3 py-2.5 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              value={chartYear}
              onChange={e => setChartYear(Number(e.target.value))}
            />
          </div>
          <button
            onClick={() => downloadFile(`http://localhost:3001/transaction/export/chart-csv?year=${chartYear}`, `chart-data-${chartYear}.csv`, "chart")}
            className="mt-auto w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading !== null}
          >
            {loading === "chart" ? <Spinner /> : "Download Chart CSV"}
          </button>
        </div>

        {/* PDF */}
        <div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Export PDF</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Laporan lengkap: transaksi + Laba Rugi + Neraca + Arus Kas.</p>
            </div>
          </div>
          <button
            onClick={() => downloadFile(`http://localhost:3001/transaction/export/pdf${dateQuery()}`, "laporan-keuangan.pdf", "pdf")}
            className="mt-auto w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-rose-200 dark:shadow-rose-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading !== null}
          >
            {loading === "pdf" ? <Spinner /> : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Mengunduh...
    </span>
  );
}
