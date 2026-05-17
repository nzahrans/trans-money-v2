import type { Metadata } from "next";
import WithdrawForm from "./WithdrawForm";

export const metadata: Metadata = { title: "Withdraw" };

export default function Page() {
  return <WithdrawForm />;
}
