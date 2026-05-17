/**
 * Periksa response status. Jika 401 (token expired/invalid),
 * hapus token dari localStorage dan redirect ke halaman login.
 * Kembalikan true jika redirect terjadi.
 */
export function handleAuthError(status: number): boolean {
  if (status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.replace("/auth");
    }
    return true;
  }
  return false;
}
