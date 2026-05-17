"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope } from "react-icons/fa";
import toast from "react-hot-toast";
import { handleAuthError } from "../../lib/authRedirect";

const DEPOSIT_PURPOSES = [
	"Deposit Anggota Baru",
	"Denda Resign",
	"Setoran",
	"KTA Trans",
	"Other",
];

function getUsername(): string {
	try {
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (!token) return "";
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload.name || payload.username || "";
	} catch { return ""; }
}

	export default function DepositForm() {
	const router = useRouter();
	const [recorder, setRecorder] = useState("");
	const [purpose, setPurpose] = useState("");
	const [amount, setAmount] = useState("");
	const [notes, setNotes] = useState("");
	const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (!token) { router.replace("/auth"); return; }
		setRecorder(getUsername());
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true); setError("");
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		try {
			const res = await fetch("http://localhost:3001/transaction/deposit", {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({ amount: Number(amount), purpose, notes, recorder, transactionDate }),
			});
			const data = await res.json();
			if (!res.ok) {
				if (handleAuthError(res.status)) return;
				throw new Error(data.error || "Deposit gagal");
			}
			toast.success("Deposit berhasil disimpan!");
		setAmount(""); setPurpose(""); setNotes(""); setRecorder(getUsername()); setTransactionDate(new Date().toISOString().slice(0, 10));
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6 w-full">
			<div className="w-full">
			<h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-4 text-center">Deposit</h1>
			<div className="w-full">
				<div className="bg-white dark:bg-[#0D1F3C] rounded-2xl border border-slate-100 dark:border-sky-900/30 shadow-sm">
					<form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
						{error && (
							<div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{error}
							</div>
						)}

						{/* Nama Pencatat */}
						<div>
							<label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
								<FaUser size={12} /> Nama Pencatat
							</label>
							<input
								type="text"
								className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-100 dark:bg-[#0D1F3C] px-4 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 cursor-not-allowed"
								value={recorder}
								readOnly
							/>
						</div>

						{/* Tanggal Transaksi */}
						<div>
							<label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Tanggal Transaksi</label>
							<input
								type="date"
								className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
								value={transactionDate}
								onChange={e => setTransactionDate(e.target.value)}
								required
							/>
						</div>

						{/* Keperluan */}
						<div>
							<label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
								<FaEnvelope size={12} /> Keperluan
							</label>
							<select
								className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
								value={purpose}
								onChange={e => setPurpose(e.target.value)}
								required
							>
								<option value="">Select purpose</option>
								{DEPOSIT_PURPOSES.map(p => (
									<option key={p} value={p}>{p}</option>
								))}
							</select>
						</div>

						{/* Amount */}
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 dark:text-slate-500 pointer-events-none select-none">
								Rp
							</span>
							<input
								type="number"
								className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
								value={amount}
								onChange={e => setAmount(e.target.value)}
								required
								min={1}
								placeholder="0"
							/>
						</div>

						{/* Notes */}
						<div>
							<label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Notes</label>
							<textarea
							className="w-full border border-slate-200 dark:border-sky-700/30 bg-slate-50 dark:bg-[#0A1628] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-y min-h-[100px]"
								value={notes}
								onChange={e => setNotes(e.target.value)}
								placeholder="Add any additional notes here..."
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-2.5 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 active:opacity-90 transition-all shadow-md shadow-sky-200 dark:shadow-sky-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
									</svg>
									Memproses...
								</span>
							) : "Submit Deposit"}
						</button>
					</form>
				</div>
			</div>
			</div>
		</div>
	);
}
