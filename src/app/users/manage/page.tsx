import type { Metadata } from "next";
import ManageUsersClient from "./ManageUsersClient";

export const metadata: Metadata = { title: "Kelola Pengguna" };

export default function Page() {
  return <ManageUsersClient />;
}
