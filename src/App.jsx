import React from 'react'
import BookingPage from './components/booking/BookingPage'
import NotFound from './components/booking/NotFound'

/**
 * Resolves booking code from multiple sources (in priority order):
 *  1. URL path segment  → /booking/XXXX  or  /store/booking/XXXX
 *  2. Query string      → ?booking=XXXX  or  ?code=XXXX
 *  3. Dev fallback      → VITE_DEV_BOOKING_CODE (only in development builds)
 */
function resolveBookingCode() {
  // 1 — path segment: /booking/<code>
  const pathMatch = window.location.pathname.match(/\/booking\/([^/?#]+)/)
  if (pathMatch?.[1]) return pathMatch[1]

  // 2 — query string: ?booking=… or ?code=…
  const params = new URLSearchParams(window.location.search)
  const qCode = params.get('booking') || params.get('code')
  if (qCode) return qCode

  // 3 — dev-only fallback (stripped from production bundle by Vite)
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_BOOKING_CODE) {
    return import.meta.env.VITE_DEV_BOOKING_CODE
  }

  return null
}

export default function App() {
  const code = resolveBookingCode()

  if (!code) {
    return (
      <NotFound
        message={
          import.meta.env.DEV
            ? 'No booking code found. Set VITE_DEV_BOOKING_CODE in .env.development or visit /?booking=XXXX'
            : 'No booking code provided.'
        }
      />
    )
  }

  return <BookingPage code={code} />
}