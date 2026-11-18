import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { categories } from '../data/categories.js'

/**
 * Read and update the active category through the URL query string.
 * @returns {{activeCategory: object, activeCategorySlug: string, selectCategory: (slug: string) => void}}
 */
export default function useCategorySelection() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const requestedSlug = searchParams.get('category')
  const activeCategory = categories.find((category) => category.slug === requestedSlug) ?? categories[0]
  const selectCategory = useCallback((slug) => {
    const next = new URLSearchParams()
    if (slug !== 'home') next.set('category', slug)
    const query = next.toString()
    navigate({ pathname: '/', search: query ? `?${query}` : '' }, { preventScrollReset: true })
  }, [navigate])
  return { activeCategory, activeCategorySlug: activeCategory.slug, selectCategory }
}