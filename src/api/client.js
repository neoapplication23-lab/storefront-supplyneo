const BASE = import.meta.env.VITE_API_URL

async function request(action, data = {}, method = 'GET') {
  const url = new URL(BASE, window.location.origin)
  url.searchParams.set('action', action)

  const opts = { method }

  if (method === 'GET') {
    Object.entries(data).forEach(([k, v]) => url.searchParams.set(k, v))
  } else {
    opts.headers = { 'Content-Type': 'application/json' }
    opts.body = JSON.stringify(data)
  }

  const res = await fetch(url.toString(), opts)

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const json = await res.json()

  if (!json.ok) {
    throw new Error(json.error || 'API error')
  }

  return json.data
}

export const apiGet  = (action, data) => request(action, data, 'GET')
export const apiPost = (action, data) => request(action, data, 'POST')
