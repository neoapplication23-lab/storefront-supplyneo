/**
 * Resolve the API base URL dynamically from the current hostname.
 *
 * Rules:
 *  - charteribiza.supplyneo.com    → https://charteribiza.supplyneo.com/admin/api.php
 *  - chartermallorca.supplyneo.com → https://chartermallorca.supplyneo.com/admin/api.php
 *  - *.vercel.app (preview)        → fallback to VITE_API_URL env var
 *  - localhost                     → fallback to VITE_API_URL env var
 *
 * This way every broker gets their own API endpoint automatically
 * with zero config changes needed per client.
 */
function resolveApiBase() {
  const host = window.location.hostname  // e.g. "charteribiza.supplyneo.com"
  const parts = host.split('.')

  // Is this a *.supplyneo.com subdomain? (at least 3 parts, last two = supplyneo.com)
  const isSupplyNeoSub =
    parts.length >= 3 && parts.slice(-2).join('.') === 'supplyneo.com'

  if (isSupplyNeoSub) {
    // Build the API URL from the same subdomain
    // charteribiza.supplyneo.com → https://charteribiza.supplyneo.com/admin/api.php
    return `https://${host}/admin/api.php`
  }

  // Fallback: use the env var (Vercel previews, localhost dev)
  return import.meta.env.VITE_API_URL
}

const BASE = resolveApiBase()

async function request(action, data = {}, method = 'GET') {
  const url = new URL(BASE)
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
