// Ensure no trailing slash
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const API_URL = rawUrl.replace(/\/$/, "");

console.log("🚀 [Frontend] API_URL Configured:", API_URL);

if (!import.meta.env.VITE_API_URL) {
  console.warn("⚠️ VITE_API_URL not found. Using localhost fallback.");
}