import { useCallback } from 'react'
import PropTypes from 'prop-types'
import { getRelatedVideos } from '../api/youtube.js'
import useFetch from '../hooks/useFetch.js'
import { videos as sampleVideos } from '../data/videos.js'
import VideoCard from './VideoCard.jsx'

function RecommendedList({ currentVideoId }) {
  const fetchRecommendations = useCallback((signal) => getRelatedVideos(currentVideoId, { signal }), [currentVideoId])
  const { data, loading, error } = useFetch(fetchRecommendations, [currentVideoId])
  const fallback = sampleVideos.filter((video) => video.youtubeId !== currentVideoId && video.id !== currentVideoId).slice(0, 8)
  const unavailable = error?.code === 'KEY_INVALID' || error?.code === 'QUOTA_EXCEEDED' || error?.code === 'COMMENTS_DISABLED'
  const recommendations = data?.length ? data : unavailable ? fallback : (loading ? [] : fallback)
  return <section className="recommended-list" aria-labelledby="recommended-heading"><h2 id="recommended-heading">Up next</h2>{recommendations.map((video) => <VideoCard key={video.id} video={video} />)}</section>
}
RecommendedList.propTypes = { currentVideoId: PropTypes.string.isRequired }
export default RecommendedList