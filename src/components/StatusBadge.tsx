import React from "react";

export default function StatusBadge({ type }: { type: string }) {
  if (type === "deposit") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        Deposit
      </span>
    );
  }
  if (type === "withdraw") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
        Withdraw
      </span>
    );
  }
  return null;
}
