import { useState, useEffect, useRef } from 'react'

/**
 * useStripePayment
 * Creates a Stripe PaymentIntent on the server and returns the clientSecret.
 */
export default function useStripePayment({ amount, currency = 'eur', enabled = false }) {
  const [clientSecret, setClientSecret] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const prevAmount                      = useRef(null)

  useEffect(() => {
    if (!enabled || !amount || amount <= 0) return
    if (prevAmount.current === amount && clientSecret) return

    let cancelled = false
    setLoading(true)
    setError(null)

    // Always use the central cPanel API
    const base = 'https://supplyneo.com/admin/api.php'

    fetch(`${base}?action=create_payment_intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(amount * 100), currency }),
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          prevAmount.current = amount
        } else {
          setError(data.error || 'Failed to initialize payment')
        }
      })
      .catch(e => {
        if (!cancelled) setError(e.message || 'Network error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [enabled, amount, currency])

  return { clientSecret, loading, error }
}
