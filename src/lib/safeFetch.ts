export async function fetchJson(url: string, opts?: RequestInit) {
  const token = localStorage.getItem("token");
  const headers = new Headers(opts?.headers || {});

  // ✅ Inject token
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // ✅ AUTO set JSON header if body exists & not FormData
  if (
    opts?.body &&
    !(opts.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    credentials: "include",
    ...opts,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Non-JSON response (status ${res.status}): ${text.slice(0, 200)}`
    );
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response (status ${res.status})`);
  }

  if (!res.ok) {
    throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
  }

  return json;
}

export default fetchJson;
