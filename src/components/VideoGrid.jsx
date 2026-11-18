import PropTypes from 'prop-types'
import VideoCard from './VideoCard.jsx'

function VideoGrid({ videos }) { return <div className="video-grid">{videos.map((video) => <VideoCard key={video.id} video={video} />)}</div> }
VideoGrid.propTypes = { videos: PropTypes.arrayOf(PropTypes.object).isRequired }
export default VideoGrid