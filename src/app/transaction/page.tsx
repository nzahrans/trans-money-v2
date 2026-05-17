import type { Metadata } from "next";
import TransactionForm from "./TransactionForm";

export const metadata: Metadata = { title: "Transaksi Baru" };

export default function Page() {
  return <TransactionForm />;
}
