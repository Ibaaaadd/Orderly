import { useState, useEffect, useCallback } from 'react'

/**
 * useFetch – generic data fetching hook.
 *
 * @param {Function} fetcher  – async function that returns data
 * @param {any[]}    deps     – dependency array (re-fetch when changed)
 *
 * Returns { data, loading, error, refetch }
 */
export default function useFetch(fetcher, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { data, loading, error, refetch: run }
}
