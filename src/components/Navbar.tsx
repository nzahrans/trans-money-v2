"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/summary", label: "Summary Chart" },
  { href: "/transaction", label: "Transaksi" },
  { href: "/transaction/history", label: "Riwayat" },
  { href: "/export", label: "Export CSV" },
  { href: "/auditlog", label: "Audit Log" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/auth");
  };
  return (
    <nav className="bg-white shadow mb-8">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded font-medium transition-colors ${pathname === item.href ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded font-semibold hover:bg-red-600 transition">Logout</button>
      </div>
    </nav>
  );
}
