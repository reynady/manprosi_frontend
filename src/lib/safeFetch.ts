export async function fetchJson(url: string, opts?: RequestInit) {
  const res = await fetch(url, { credentials: 'include', ...opts })
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
