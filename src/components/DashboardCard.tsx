import { ReactNode } from "react";

const colorConfig = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    icon: "text-blue-600 dark:text-blue-400",
    value: "text-blue-700 dark:text-blue-300",
    border: "border-l-4 border-blue-500",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-300",
    border: "border-l-4 border-emerald-500",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-500/10",
    icon: "text-red-600 dark:text-red-400",
    value: "text-red-700 dark:text-red-300",
    border: "border-l-4 border-red-500",
  },
};

export default function DashboardCard({
  icon,
  label,
  value,
  color = "blue",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color?: "blue" | "green" | "red";
}) {
  const cfg = colorConfig[color];
  return (
    <div
      className={`bg-white dark:bg-[#161b27] rounded-xl ${cfg.border} border-t border-r border-b border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cfg.bg} ${cfg.icon}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className={`text-lg font-bold truncate ${cfg.value}`}>{value}</p>
      </div>
    </div>
  );
}
