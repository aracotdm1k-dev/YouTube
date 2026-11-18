import { IoAppsOutline, IoMenuOutline, IoNotificationsOutline, IoVideocamOutline } from 'react-icons/io5'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/useAppContext.js'
import SearchBar from './SearchBar.jsx'

function Navbar() {
  const { setSidebarExpanded, setMobileMenuOpen } = useAppContext()
  const toggleMenu = () => window.matchMedia('(max-width: 760px)').matches ? setMobileMenuOpen((open) => !open) : setSidebarExpanded((open) => !open)
  return <header className="topbar"><div className="brand-area"><button className="icon-button menu-button" type="button" aria-label="Toggle navigation" onClick={toggleMenu}><IoMenuOutline /></button><Link className="brand" to="/" aria-label="VidTube home"><span className="brand-mark"><span /></span><span>VidTube</span></Link></div><SearchBar /><div className="topbar-actions"><button className="icon-button create-button" type="button" aria-label="Create video"><IoVideocamOutline /></button><button className="icon-button apps-button" type="button" aria-label="Apps"><IoAppsOutline /></button><button className="icon-button notification-button" type="button" aria-label="Notifications"><IoNotificationsOutline /></button><button className="profile-button" type="button" aria-label="Your account"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces" alt="" /></button></div></header>
}
export default Navbar