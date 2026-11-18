import { useCallback, useEffect, useRef, useState } from 'react'

const emptyState = { items: [], nextPageToken: '', loading: true, loadingMore: false, error: null, cacheKey: '' }

/**
 * Manage abortable, deduplicated page loading and an optional scroll sentinel.
 * @param {(options: {pageToken?: string, signal: AbortSignal}) => Promise<{items: object[], nextPageToken?: string}>} fetcher Page request function.
 * @returns {{items: object[], loading: boolean, loadingMore: boolean, error: Error|null, sentinelRef: object, loadMore: () => void, retry: () => void, hasMore: boolean}}
 */
export default function useInfiniteVideos(fetcher, cacheKey = '') {
  const [storedState, setState] = useState(() => ({ ...emptyState, cacheKey }))
  const currentState = useRef({ ...emptyState, cacheKey })
  const activeController = useRef(null)
  const busy = useRef(false)
  const sentinelRef = useRef(null)
  const state = storedState.cacheKey === cacheKey ? storedState : { ...emptyState, cacheKey, loading: true }

  const commit = useCallback((update) => {
    setState((previous) => {
      const next = typeof update === 'function' ? update(previous) : update
      currentState.current = next
      return next
    })
  }, [])

  const loadPage = useCallback(async (reset = false) => {
    if (!reset && currentState.current.cacheKey !== cacheKey) return
    if (busy.current && !reset) return
    if (reset) activeController.current?.abort()
    const controller = new AbortController()
    activeController.current = controller
    busy.current = true
    commit((current) => reset
      ? { ...emptyState, cacheKey, loading: true }
      : { ...current, loading: false, loadingMore: true, error: null })
    try {
      const pageToken = reset ? undefined : currentState.current.nextPageToken
      const result = await fetcher({ pageToken, signal: controller.signal })
      if (controller.signal.aborted) return
      commit((current) => {
        const items = reset ? result.items : [...current.items, ...result.items.filter((item) => !current.items.some((existing) => existing.id === item.id))]
        return { items, nextPageToken: result.nextPageToken ?? '', loading: false, loadingMore: false, error: null, cacheKey }
      })
    } catch (error) {
      if (!controller.signal.aborted) commit((current) => ({ ...current, loading: false, loadingMore: false, error, cacheKey }))
    } finally {
      if (activeController.current === controller) {
        busy.current = false
        activeController.current = null
      }
    }
  }, [cacheKey, commit, fetcher])

  useEffect(() => {
    const timer = window.setTimeout(() => loadPage(true), 0)
    return () => {
      window.clearTimeout(timer)
      activeController.current?.abort()
    }
  }, [loadPage])

  const loadMore = useCallback(() => {
    if (currentState.current.nextPageToken) loadPage(false)
  }, [loadPage])
  const retry = useCallback(() => loadPage(true), [loadPage])

  useEffect(() => {
    const target = sentinelRef.current
    if (!target || !state.nextPageToken || state.loading || state.loadingMore || state.error || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore()
    }, { rootMargin: '320px' })
    observer.observe(target)
    return () => observer.disconnect()
  }, [loadMore, state.nextPageToken, state.loading, state.loadingMore, state.error])

  return { ...state, sentinelRef, loadMore, retry, hasMore: Boolean(state.nextPageToken) }
}