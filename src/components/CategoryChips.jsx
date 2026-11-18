import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { chipCategories } from '../data/categories.js'

function CategoryChips({ activeCategory, onSelect }) {
  const activeChip = useRef(null)
  useEffect(() => { activeChip.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }) }, [activeCategory])
  return <div className="category-chips-edges"><nav className="category-chips" aria-label="Home video filters" role="tablist">{chipCategories.map(({ slug, label, chipLabel }) => <button className={`category-chip ${activeCategory === slug ? 'category-chip--active' : ''}`} key={slug} ref={activeCategory === slug ? activeChip : null} type="button" role="tab" aria-selected={activeCategory === slug} onClick={() => onSelect(slug)}>{chipLabel ?? label}</button>)}</nav></div>
}

CategoryChips.propTypes = { activeCategory: PropTypes.string.isRequired, onSelect: PropTypes.func.isRequired }
export default CategoryChips