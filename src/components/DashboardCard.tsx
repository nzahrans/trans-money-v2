import { ReactNode } from "react";

const colorConfig = {
  blue: {
    gradient: "bg-gradient-to-br from-sky-500 to-blue-600",
    shadow: "shadow-lg shadow-sky-300/40 dark:shadow-sky-900/30",
    iconBg: "bg-white/20",
  },
  green: {
    gradient: "bg-gradient-to-br from-emerald-400 to-green-500",
    shadow: "shadow-lg shadow-emerald-300/40 dark:shadow-emerald-900/30",
    iconBg: "bg-white/20",
  },
  red: {
    gradient: "bg-gradient-to-br from-rose-500 to-pink-600",
    shadow: "shadow-lg shadow-rose-300/40 dark:shadow-rose-900/30",
    iconBg: "bg-white/20",
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
    <div className={`${cfg.gradient} ${cfg.shadow} rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${cfg.iconBg}`}>
        <span className="text-white">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-lg font-bold text-white truncate">{value}</p>
      </div>
    </div>
  );
}
