import { useCallback } from 'react'
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5'
import { useAppContext } from '../context/useAppContext.js'
import { getVideoCategories, prefetchVideosByCategory } from '../api/youtube.js'
import useFetch from '../hooks/useFetch.js'
import useCategorySelection from '../hooks/useCategorySelection.js'
import CategoryList from './CategoryList.jsx'
import SubscribedList from './SubscribedList.jsx'

function Sidebar() {
  const { sidebarExpanded, mobileMenuOpen, setMobileMenuOpen, subscribedChannelIds, theme, setTheme } = useAppContext()
  const { activeCategorySlug, selectCategory } = useCategorySelection()
  const fetchCategories = useCallback((signal) => getVideoCategories(undefined, { signal }), [])
  const { data: apiCategories } = useFetch(fetchCategories, [])
  const handleSelectCategory = (slug) => { selectCategory(slug); setMobileMenuOpen(false) }
  const prefetchCategory = useCallback((slug) => { void prefetchVideosByCategory({ slug }).catch(() => undefined) }, [])
  return <aside className={`sidebar ${sidebarExpanded ? '' : 'sidebar--compact'} ${mobileMenuOpen ? 'sidebar--mobile-open' : ''}`}><CategoryList activeCategory={activeCategorySlug} onSelect={handleSelectCategory} onPrefetch={prefetchCategory} apiCategories={apiCategories ?? []} />{sidebarExpanded && <SubscribedList subscribedIds={subscribedChannelIds} />}<button className="sidebar-link theme-toggle" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title={theme === 'light' ? 'Dark theme' : 'Light theme'}>{theme === 'light' ? <IoMoonOutline /> : <IoSunnyOutline />}<span>{theme === 'light' ? 'Dark theme' : 'Light theme'}</span></button></aside>
}
export default Sidebar