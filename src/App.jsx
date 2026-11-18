import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import { useAppContext } from './context/useAppContext.js'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Skeleton from './components/Skeleton.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Watch = lazy(() => import('./pages/Watch.jsx'))
const SearchResults = lazy(() => import('./pages/SearchResults.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function AppLayout() {
	const { sidebarExpanded, mobileMenuOpen, setMobileMenuOpen } = useAppContext()
	return <div className="app-shell">
		<Navbar />
		<Sidebar />
		{mobileMenuOpen && <button className="mobile-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}
		<main className={`page-content ${sidebarExpanded ? '' : 'page-content--compact'}`}>
			<Suspense fallback={<Skeleton count={8} />}>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/video/:id" element={<Watch />} />
					<Route path="/search" element={<SearchResults />} />
					<Route path="/not-found" element={<NotFound />} />
					<Route path="*" element={<Navigate to="/not-found" replace />} />
				</Routes>
			</Suspense>
		</main>
	</div>
}

function App() {
	return <AppProvider><BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AppLayout /></BrowserRouter></AppProvider>
}

export default App
  