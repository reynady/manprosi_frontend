// Ensure no trailing slash
let rawUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Robustness: Handle missing protocol (user might just paste domain)
if (!rawUrl.startsWith('http')) {
  rawUrl = `https://${rawUrl}`;
}

export const API_URL = rawUrl.replace(/\/$/, "");

console.log("🚀 [Frontend] API_URL Configured:", API_URL);

if (!import.meta.env.VITE_API_URL) {
  console.warn("⚠️ VITE_API_URL not found in env. Using localhost fallback.");
}