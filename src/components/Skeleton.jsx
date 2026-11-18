import PropTypes from 'prop-types'

function Skeleton({ count = 8 }) {
  return <div className="video-grid skeleton-grid" aria-label="Loading videos" role="status">{Array.from({ length: count }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton-thumbnail" /><div className="skeleton-copy"><div className="skeleton-line skeleton-line--long" /><div className="skeleton-line skeleton-line--short" /><div className="skeleton-line skeleton-line--medium" /></div></div>)}<span className="visually-hidden">Loading videos</span></div>
}
Skeleton.propTypes = { count: PropTypes.number }
export default Skeleton