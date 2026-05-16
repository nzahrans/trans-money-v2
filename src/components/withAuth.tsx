"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const router = useRouter();
    useEffect(() => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.replace("/auth");
      }
    }, [router]);
    return <Component {...(props as any)} />;
  };
}
