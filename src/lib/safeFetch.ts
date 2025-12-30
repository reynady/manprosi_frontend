export async function fetchJson(url: string, opts?: RequestInit) {
  // Auto-inject token
  const token = localStorage.getItem('token');
  const headers = new Headers(opts?.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If content-type not set, assume JSON if body is present? 
  // Fetch usually doesn't set type automatically if stringified. login.tsx sets it manually. 
  // Let's just pass headers through.

  const res = await fetch(url, {
    credentials: 'include',
    ...opts,
    headers // Override with our headers object
  })
  const contentType = res.headers.get('content-type') || ''

  const text = await res.text()

  if (!contentType.includes('application/json')) {
    // Backend returned HTML or plain text — include preview for debugging
    const preview = text.slice(0, 300)
    throw new Error(`Non-JSON response (status ${res.status}): ${preview}`)
  }

  let json: any
  try {
    json = JSON.parse(text)
  } catch (err) {
    throw new Error(`Invalid JSON response (status ${res.status})`)
  }

  if (!res.ok) {
    // If API uses { error } shape, surface it, otherwise generic
    const msg = json?.error ?? `HTTP ${res.status}`
    throw new Error(msg)
  }

  return json
}

export default fetchJson
