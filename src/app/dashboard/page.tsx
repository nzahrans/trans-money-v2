import type { Metadata } from "next";
import DashboardMain from "./DashboardMain";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardMain />;
}
