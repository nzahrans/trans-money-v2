import type { Metadata } from "next";
import ExportPanel from "./ExportPanel";

export const metadata: Metadata = { title: "Export Data" };

export default function Page() {
  return <ExportPanel />;
}
