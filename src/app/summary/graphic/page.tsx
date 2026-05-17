import type { Metadata } from "next";
import SummaryGraphic from "./SummaryGraphic";

export const metadata: Metadata = { title: "Grafik Ringkasan" };

export default function Page() {
  return <SummaryGraphic />;
}
