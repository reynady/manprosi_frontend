export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

if (!import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL tidak ditemukan di environment variables. Menggunakan default: http://127.0.0.1:8000");
}