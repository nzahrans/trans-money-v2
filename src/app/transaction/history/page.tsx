import type { Metadata } from "next";
import HistoryClient from "./HistoryClient";

export const metadata: Metadata = { title: "Riwayat Transaksi" };

export default function Page() {
  return <HistoryClient />;
}
