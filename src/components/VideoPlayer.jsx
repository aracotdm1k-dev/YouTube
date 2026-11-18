import PropTypes from 'prop-types'

function VideoPlayer({ youtubeId, title }) {
  return <div className="player-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&rel=0`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
}
VideoPlayer.propTypes = { youtubeId: PropTypes.string.isRequired, title: PropTypes.string.isRequired }
export default VideoPlayer