"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaCalculator, FaCopy } from "react-icons/fa";

const WITHDRAW_PURPOSES = [
	"Reimburse",
	"Sponsorship",
	"Gaji Pegawai",
	"Pajak",
	"Other",
];

type Member = { id: number; name: string; role?: string };

function formatLabel(m: Member) {
	return m.role ? `${m.name} (${m.role})` : m.name;
}

export default function WithdrawForm() {
	const router = useRouter();
	const [members, setMembers] = useState<Member[]>([]);
	const [currentBalance, setCurrentBalance] = useState<number>(0);
	const [recorder, setRecorder] = useState("");
	const [purpose, setPurpose] = useState("");
	const [amount, setAmount] = useState("");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (!token) { router.replace("/auth"); return; }

		fetch("http://localhost:3001/users", { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.ok ? res.json() : [])
			.then(data => setMembers(Array.isArray(data) ? data : []))
			.catch(() => {});

		fetch("http://localhost:3001/dashboard/summary", { headers: { Authorization: `Bearer ${token}` } })
			.then(res => res.ok ? res.json() : null)
			.then(data => { if (data?.saldo != null) setCurrentBalance(data.saldo); })
			.catch(() => {});
	}, [router]);

	const taxAmount = Math.round(currentBalance * 0.005);

	const handleCopy = () => {
		navigator.clipboard.writeText(taxAmount.toLocaleString("id-ID"));
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true); setError(""); setSuccess("");
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		try {
			const res = await fetch("http://localhost:3001/transaction/withdraw", {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({ amount: Number(amount), purpose, notes, recorder }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Withdraw gagal");
			setSuccess("Withdraw berhasil disimpan!");
			setAmount(""); setPurpose(""); setNotes(""); setRecorder("");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center gap-6 w-full">
			<div className="w-full max-w-6xl">
			<h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4 text-center">Withdraw</h1>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
				{/* Form */}
				<div className="lg:col-span-2">
					<div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-sm">
						<form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
							{error && (
								<div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{error}
								</div>
							)}
							{success && (
								<div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />{success}
								</div>
							)}

							{/* Nama Pencatat */}
							<div>
								<label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
									<FaUser size={12} /> Nama Pencatat
								</label>
								<select
									className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100"
									value={recorder}
									onChange={e => setRecorder(e.target.value)}
									required
								>
									<option value="">Select recorder</option>
									{members.map(m => (
										<option key={m.id} value={formatLabel(m)}>{formatLabel(m)}</option>
									))}
								</select>
							</div>

							{/* Keperluan */}
							<div>
								<label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
									<FaEnvelope size={12} /> Keperluan
								</label>
								<select
									className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100"
									value={purpose}
									onChange={e => setPurpose(e.target.value)}
									required
								>
									<option value="">Select purpose</option>
									{WITHDRAW_PURPOSES.map(p => (
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
									className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
									className="w-full border border-slate-200 dark:border-violet-700/30 bg-slate-50 dark:bg-[#211c45] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-y min-h-[100px]"
									value={notes}
									onChange={e => setNotes(e.target.value)}
									placeholder="Add any additional notes here..."
								/>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full py-2.5 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 active:opacity-90 transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
							>
								{loading ? (
									<span className="flex items-center justify-center gap-2">
										<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
										</svg>
										Memproses...
									</span>
								) : "Submit Withdrawal"}
							</button>
						</form>
					</div>
				</div>

				{/* Tax Calculator */}
				<div className="bg-white dark:bg-[#1a1635] rounded-2xl border border-slate-100 dark:border-violet-900/30 shadow-sm p-5 flex flex-col items-center text-center">
					<div className="flex items-center gap-2 mb-4">
						<FaCalculator className="text-blue-500" size={16} />
						<h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Tax Calculator</h3>
					</div>
					<div className="flex flex-col gap-3 w-full items-center">
						<div>
							<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Current Balance</p>
							<p className="font-bold text-slate-800 dark:text-slate-100">
								Rp {currentBalance.toLocaleString("id-ID")}
							</p>
						</div>
						<div className="border-t border-slate-100 dark:border-slate-800 pt-3 w-full">
							<p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Tax Amount (0.5%)</p>
							<div className="flex items-center justify-center gap-2">
								<p className="font-bold text-sky-500 dark:text-sky-400">Rp {taxAmount.toLocaleString("id-ID")}</p>
								<button
									type="button"
									onClick={handleCopy}
									className="ml-auto px-2.5 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-500/10 hover:text-sky-600 transition-colors flex items-center gap-1"
								>
									<FaCopy size={10} />
									{copied ? "Copied!" : "Copy"}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			</div>
		</div>
	);
}
