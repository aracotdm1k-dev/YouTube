import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { IoCheckmarkCircle } from 'react-icons/io5'
import formatViews from '../utils/formatViews.js'
import timeAgo from '../utils/timeAgo.js'

const fallbackImage = 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=720&h=405&fit=crop'
function VideoCard({ video }) {
  const fallback = (event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage }
  return <article className="video-card"><Link className="thumbnail-link" to={`/video/${video.id}`} aria-label={`Watch ${video.title}`}><div className="thumbnail-frame"><img src={video.thumbnail} alt="" loading="lazy" onError={fallback} /></div></Link><div className="video-card-info"><div className="video-copy"><Link className="video-title" to={`/video/${video.id}`}>{video.title}</Link><p className="video-channel">{video.channel} <IoCheckmarkCircle aria-label="Verified" /></p><p className="video-metadata">{formatViews(video.views)} Views <span aria-hidden="true">•</span> {timeAgo(video.publishedAt)}</p></div></div></article>
}
VideoCard.propTypes = { video: PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string.isRequired, channel: PropTypes.string.isRequired, channelAvatar: PropTypes.string.isRequired, thumbnail: PropTypes.string.isRequired, views: PropTypes.number.isRequired, publishedAt: PropTypes.string.isRequired, duration: PropTypes.string.isRequired }).isRequired }
export default VideoCard