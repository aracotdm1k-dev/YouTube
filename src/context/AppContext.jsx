import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { AppContext } from './appContext.js'

export function AppProvider({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Home')
  const [theme, setTheme] = useLocalStorage('vidtube-theme', 'light')
  const [subscribedChannelIds, setSubscribedChannelIds] = useLocalStorage('vidtube-subscriptions', [])

  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  const value = useMemo(() => ({ sidebarExpanded, setSidebarExpanded, mobileMenuOpen, setMobileMenuOpen, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, theme, setTheme, subscribedChannelIds, setSubscribedChannelIds }), [sidebarExpanded, mobileMenuOpen, searchQuery, selectedCategory, theme, setTheme, subscribedChannelIds, setSubscribedChannelIds])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

AppProvider.propTypes = { children: PropTypes.node.isRequired }
