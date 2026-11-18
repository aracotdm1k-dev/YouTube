import { Link } from 'react-router-dom'
import { IoPlayCircleOutline } from 'react-icons/io5'

function NotFound() {
  return <section className="not-found-page"><IoPlayCircleOutline aria-hidden="true" /><h1>This page isn't available</h1><p>The video or page you’re looking for may have been removed.</p><Link to="/">Back to home</Link></section>
}
export default NotFound