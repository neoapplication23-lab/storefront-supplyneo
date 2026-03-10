/**
 * Resolve the API base URL dynamically from the current hostname.
 *
 * All brokers share the same cPanel API at supplyneo.com regardless
 * of which subdomain they're accessing the storefront from.
 *
 * charteribiza.supplyneo.com  →  https://supplyneo.com/admin/api.php
 * chartermallorca.supplyneo.com → https://supplyneo.com/admin/api.php
 * *.vercel.app (preview)       →  https://supplyneo.com/admin/api.php
 * localhost                    →  fallback to VITE_API_URL (for dev)
 */
function resolveApiBase() {
  // Always use the central cPanel API — never the subdomain
  // (subdomains point to Vercel which has no PHP)
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'https://supplyneo.com/admin/api.php'
  }
  return 'https://supplyneo.com/admin/api.php'
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
