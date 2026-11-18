import { useCallback } from 'react'
import { getVideosByCategory } from '../api/youtube.js'
import useInfiniteVideos from './useInfiniteVideos.js'

/**
 * Fetch a category's cached, abortable, infinitely paginated videos.
 * @param {string} slug Category slug from data/categories.js.
 * @returns {{videos: object[], loading: boolean, loadingMore: boolean, error: Error|null, hasMore: boolean, loadMore: () => void, retry: () => void, sentinelRef: object}}
 */
export default function useCategoryVideos(slug) {
  const fetchPage = useCallback(({ pageToken, signal }) => getVideosByCategory({ slug, pageToken, maxResults: 24, signal }), [slug])
  const { items, loading, loadingMore, error, hasMore, loadMore, retry, sentinelRef } = useInfiniteVideos(fetchPage, slug)
  return { videos: items, loading, loadingMore, error, hasMore, loadMore, retry, sentinelRef }
}