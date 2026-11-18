import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchVideos } from '../api/youtube.js'
import { videos as sampleVideos } from '../data/videos.js'
import useInfiniteVideos from '../hooks/useInfiniteVideos.js'
import VideoGrid from '../components/VideoGrid.jsx'
import Skeleton from '../components/Skeleton.jsx'

function SearchResults() {
  const [params] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const fetchPage = useCallback(({ pageToken, signal }) => searchVideos({ query, pageToken, maxResults: 24, signal }), [query])
  const { items, loading, loadingMore, error, retry, sentinelRef, hasMore } = useInfiniteVideos(fetchPage, `search:${query}`)
  const normalized = query.toLocaleLowerCase()
  const fallbackItems = normalized
    ? sampleVideos.filter((video) => `${video.title} ${video.channel}`.toLocaleLowerCase().includes(normalized))
    : []
  const isQuotaOrKeyFallback = error?.code === 'QUOTA_EXCEEDED' || error?.code === 'KEY_INVALID'
  const displayedItems = isQuotaOrKeyFallback ? fallbackItems : items

  return <section className="search-results-page" aria-label="Search results">
    {query && <h1 className="page-heading">Results for “{query}”</h1>}
    {!query && <p className="empty-state">Enter a search to find videos</p>}
    {loading && query && <Skeleton count={12} />}
    {!loading && isQuotaOrKeyFallback && <p className="api-notice" role="status">Showing sample results because YouTube API access is unavailable</p>}
    {!loading && error && !isQuotaOrKeyFallback && <div className="api-error" role="alert"><span>{error.message}</span><button type="button" onClick={retry}>Retry</button></div>}
    {!loading && displayedItems.length > 0 && <VideoGrid videos={displayedItems} />}
    {!loading && query && !error && displayedItems.length === 0 && <p className="empty-state">No videos found</p>}
    {!loading && loadingMore && <div className="category-loading-more" role="status"><span className="loading-spinner" />Loading more videos</div>}
    {!loading && hasMore && !isQuotaOrKeyFallback && <div ref={sentinelRef} className="video-sentinel" aria-hidden="true" />}
  </section>
}
export default SearchResults