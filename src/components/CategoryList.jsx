import { useRef } from 'react'
import PropTypes from 'prop-types'
import { sidebarCategories } from '../data/categories.js'

function CategoryList({ activeCategory, onSelect, onPrefetch, apiCategories = [] }) {
  const hoverTimers = useRef(new Map())
  const schedulePrefetch = (slug) => {
    window.clearTimeout(hoverTimers.current.get(slug))
    hoverTimers.current.set(slug, window.setTimeout(() => onPrefetch(slug), 300))
  }
  const cancelPrefetch = (slug) => {
    window.clearTimeout(hoverTimers.current.get(slug))
    hoverTimers.current.delete(slug)
  }

  return <nav className="category-list" aria-label="Video categories">{sidebarCategories.map(({ slug, label, videoCategoryId, searchKeyword, icon: Icon }) => {
    const apiCategory = apiCategories.find((category) => category.videoCategoryId === videoCategoryId)
    return <button className={`sidebar-link ${activeCategory === slug ? 'sidebar-link--active' : ''}`} key={slug} type="button" aria-current={activeCategory === slug ? 'page' : undefined} onClick={() => { cancelPrefetch(slug); onSelect(slug) }} onMouseEnter={() => schedulePrefetch(slug)} onMouseLeave={() => cancelPrefetch(slug)} onFocus={() => schedulePrefetch(slug)} onBlur={() => cancelPrefetch(slug)} title={slug === 'home' ? label : `${label}: ${apiCategory?.apiTitle ?? searchKeyword}`}><Icon aria-hidden="true" /><span>{label}</span></button>
  })}</nav>
}
CategoryList.propTypes = { activeCategory: PropTypes.string.isRequired, onSelect: PropTypes.func.isRequired, onPrefetch: PropTypes.func.isRequired, apiCategories: PropTypes.arrayOf(PropTypes.object) }
export default CategoryList