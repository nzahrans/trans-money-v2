"use client";
import { useEffect, useState } from "react";

export function useUserRole(): { role: string; isAdmin: boolean; loading: boolean } {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload?.role ?? "");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  return { role, isAdmin: role === "admin", loading };
}
