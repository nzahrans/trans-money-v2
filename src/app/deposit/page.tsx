import type { Metadata } from "next";
import DepositForm from "./DepositForm";

export const metadata: Metadata = { title: "Deposit" };

export default function Page() {
  return <DepositForm />;
}
