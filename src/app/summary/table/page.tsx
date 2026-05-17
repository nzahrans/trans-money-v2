import type { Metadata } from "next";
import SummaryTable from "./SummaryTable";

export const metadata: Metadata = { title: "Summary" };

export default function Page() {
  return <SummaryTable />;
}
