import { useCallback, useEffect, useState } from 'react'

/**
 * Fetch a single resource whenever the callback dependencies change.
 * @param {(signal: AbortSignal) => Promise<unknown>} fetcher Request function receiving an abort signal.
 * @param {unknown[]} deps Values that identify the requested resource.
 * @returns {{data: unknown, loading: boolean, error: Error|null, refetch: () => void}}
 */
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [requestNumber, setRequestNumber] = useState(0)
  const dependencyKey = JSON.stringify(deps)
  const refetch = useCallback(() => setRequestNumber((number) => number + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const load = async () => {
      await Promise.resolve()
      if (!active) return
      setState((current) => ({ ...current, loading: true, error: null }))
      try {
        const data = await fetcher(controller.signal)
        if (active) setState({ data, loading: false, error: null })
      } catch (error) {
        if (active && !controller.signal.aborted) setState((current) => ({ ...current, loading: false, error }))
      }
    }
    load()
    return () => {
      active = false
      controller.abort()
    }
  }, [fetcher, dependencyKey, requestNumber])

  return { ...state, refetch }
}