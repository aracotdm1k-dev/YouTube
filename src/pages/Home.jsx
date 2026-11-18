import { useEffect, useMemo } from 'react'
import useCategorySelection from '../hooks/useCategorySelection.js'
import useCategoryVideos from '../hooks/useCategoryVideos.js'
import { videos as sampleVideos } from '../data/videos.js'
import CategoryChips from '../components/CategoryChips.jsx'
import VideoGrid from '../components/VideoGrid.jsx'
import Skeleton from '../components/Skeleton.jsx'

function Home() {
  const { activeCategory, activeCategorySlug, selectCategory } = useCategorySelection()
  const { videos, loading, loadingMore, error, hasMore, retry, sentinelRef } = useCategoryVideos(activeCategorySlug)
  const isQuotaFallback = error?.code === 'QUOTA_EXCEEDED'
  const displayedVideos = useMemo(() => {
    if (!isQuotaFallback) return videos
    return sampleVideos.filter((video) => activeCategorySlug === 'home' || video.category === activeCategory.label)
  }, [activeCategory.label, activeCategorySlug, isQuotaFallback, videos])

  useEffect(() => {
    document.title = `${activeCategory.label} - VidTube`
    window.scrollTo(0, 0)
  }, [activeCategory.label, activeCategorySlug])

  return <>
    <CategoryChips activeCategory={activeCategorySlug} onSelect={selectCategory} />
    <section className="home-page" aria-label={`${activeCategory.label} videos`}>
      {loading && <Skeleton count={12} />}
      {!loading && isQuotaFallback && <p className="api-notice" role="status">Daily API limit reached, showing sample videos</p>}
      {!loading && error && !isQuotaFallback && <div className="api-error" role="alert"><span>{error.message}</span><button type="button" onClick={retry}>Retry</button></div>}
      {!loading && displayedVideos.length > 0 && <VideoGrid videos={displayedVideos} />}
      {!loading && !error && displayedVideos.length === 0 && <div className="empty-state"><p>No videos found in {activeCategory.label}</p><button type="button" onClick={() => selectCategory('home')}>Back to Home</button></div>}
      {!loading && loadingMore && <div className="category-loading-more" role="status"><span className="loading-spinner" />Loading more videos</div>}
      {!loading && hasMore && !isQuotaFallback && <div ref={sentinelRef} className="video-sentinel" aria-hidden="true" />}
    </section>
  </>
}
export default Home