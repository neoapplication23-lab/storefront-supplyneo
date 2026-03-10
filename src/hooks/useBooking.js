import { useState, useEffect } from 'react'
import { getBooking } from '../api/booking'

export default function useBooking(code) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)   // 'not_found' | 'network' | string

  useEffect(() => {
    if (!code) { setLoading(false); setError('not_found'); return }

    let cancelled = false
    setLoading(true)
    setError(null)

    getBooking(code)
      .then(d  => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch(e => {
        if (cancelled) return
        setError(e.message?.toLowerCase().includes('not found') ? 'not_found' : 'network')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [code])

  return { data, loading, error }
}
