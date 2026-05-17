import type { Metadata } from "next";
import AuditLogTable from "./AuditLogTable";

export const metadata: Metadata = { title: "Audit Log" };

export default function Page() {
  return <AuditLogTable />;
}
