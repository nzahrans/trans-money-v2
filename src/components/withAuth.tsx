"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const router = useRouter();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
      if (!token) {
        router.replace("/auth");
      }
    }, [token, router]);

    if (!token) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#071426]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      );
    }

    return <Component {...(props as any)} />;
  };
}
