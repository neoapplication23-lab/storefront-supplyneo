import { useState, useEffect, useCallback } from 'react'
import { getBooking } from '../api/booking'

export default function useBooking(code) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)   // 'not_found' | 'network' | string

  const fetchData = useCallback(() => {
    if (!code) { setLoading(false); setError('not_found'); return Promise.resolve(null) }
    setLoading(true)
    setError(null)
    return getBooking(code)
      .then(d  => { setData(d); setLoading(false); return d })
      .catch(e => {
        setError(e.message?.toLowerCase().includes('not found') ? 'not_found' : 'network')
        setLoading(false)
        return null
      })
  }, [code])

  // Initial fetch
  useEffect(() => { fetchData() }, [fetchData])

  // refetch returns a promise that resolves when fresh data is loaded
  const refetch = useCallback(() => fetchData(), [fetchData])

  return { data, loading, error, refetch }
}
