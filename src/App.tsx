import { useCallback, useEffect, useRef, useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Sidebar } from './components/layout/Sidebar'
import { BottomNav } from './components/layout/BottomNav'
import { TransactionModal } from './components/TransactionModal'
import { NotificationCenter } from './components/NotificationCenter'
import { Onboarding } from './components/Onboarding'
import { SupportModal } from './components/SupportModal'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Analytics } from './pages/Analytics'
import { Budget } from './pages/Budget'
import { Goals } from './pages/Goals'
import { Wallets } from './pages/Wallets'
import { Recurring } from './pages/Recurring'
import { Settings } from './pages/Settings'
import { AuthPage } from './pages/Auth'
import { AdminPage } from './pages/Admin'
import { useToast } from './components/ui/Toast'
import { Shield } from 'lucide-react'

const PAGE_EXIT_MS = 180

// "Tutorial seen" flag, per user on this browser. Storage can be unavailable (private mode), so failures fall back to showing the tour.
const tourKey = (user: string) => `finny-tour-done:${user}`
function hasSeenTour(user: string) {
  try { return localStorage.getItem(tourKey(user)) === '1' } catch { return false }
}
function markTourSeen(user: string) {
  try { localStorage.setItem(tourKey(user), '1') } catch { /* ignore */ }
}

function AmbientBackground() {
  return (
    <div className="app-bg" aria-hidden>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  )
}

function AppInner() {
  const { state } = useApp()
  const { isAdmin, signOut } = useAuth()
  // `page` drives the nav highlight immediately; `displayPage` swaps after the exit animation.
  const [page, setPage] = useState('dashboard')
  const [displayPage, setDisplayPage] = useState('dashboard')
  const [leaving, setLeaving] = useState(false)
  const [showAddTx, setShowAddTx] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showTour, setShowTour] = useState(() => !hasSeenTour(state.userName))
  const { showToast, ToastEl } = useToast()
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = useCallback((next: string) => {
    if (next === page && !leaving) return
    setPage(next)
    setLeaving(true)
    if (navTimer.current) clearTimeout(navTimer.current)
    navTimer.current = setTimeout(() => {
      setDisplayPage(next)
      setLeaving(false)
      window.scrollTo({ top: 0 })
    }, PAGE_EXIT_MS)
  }, [page, leaving])

  useEffect(() => () => { if (navTimer.current) clearTimeout(navTimer.current) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleNotif = useCallback(() => setShowNotif(v => !v), [])
  const openAddTx = useCallback(() => setShowAddTx(true), [])
  const openSupport = useCallback(() => setShowSupport(true), [])

  const finishTour = useCallback(() => {
    markTourSeen(state.userName)
    setShowTour(false)
    navigate('wallets')
  }, [state.userName, navigate])

  if (isAdmin && window.location.hash === '#admin') return <AdminPage />

  function renderPage() {
    switch (displayPage) {
      case 'dashboard': return <Dashboard onAddTransaction={openAddTx} onNavigate={navigate} />
      case 'transactions': return <Transactions onAddTransaction={openAddTx} onToast={showToast} />
      case 'analytics': return <Analytics />
      case 'budget': return <Budget onToast={showToast} />
      case 'goals': return <Goals onToast={showToast} />
      case 'wallets': return <Wallets onToast={showToast} />
      case 'recurring': return <Recurring onToast={showToast} />
      case 'settings': return <Settings onToast={showToast} onSignOut={signOut} onStartTour={() => setShowTour(true)} onSupport={openSupport} />
      default: return <Dashboard onAddTransaction={openAddTx} onNavigate={navigate} />
    }
  }

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen relative">
      <AmbientBackground />
      <Sidebar active={page} onNavigate={navigate} onAddTransaction={openAddTx} onSupport={openSupport} />

      {/* Desktop top bar */}
      <div className={`hidden md:flex fixed top-0 right-0 left-[248px] z-40 items-center gap-3 px-8 py-3 transition-all duration-300 ${scrolled ? 'glass border-b border-gray-100' : ''}`}>
        <span className="text-xs font-semibold text-gray-400 capitalize">{today}</span>
        <div className="flex-1" />
        {isAdmin && (
          <button onClick={() => { window.location.hash = '#admin'; window.location.reload() }}
            className="btn-soft py-2">
            <Shield size={13} /> Admin Panel
          </button>
        )}
        <NotificationCenter open={showNotif} onToggle={toggleNotif} onNavigate={navigate} />
      </div>

      {/* Main content */}
      <main className="relative z-10 md:pl-[248px] pt-14 pb-28 md:pb-6">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-5 md:py-6">
          <div key={displayPage} className={leaving ? 'page-exit' : 'page-enter'}>
            {renderPage()}
          </div>
        </div>
      </main>

      {/* Mobile top bar */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2.5 glass transition-shadow ${scrolled ? 'shadow-sm border-b border-gray-100' : ''}`}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Finny" className="w-8 h-8 rounded-xl object-cover shadow-sm"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <span className="font-black text-gray-800 text-lg">Finny</span>
        </div>
        <NotificationCenter open={showNotif} onToggle={toggleNotif} onNavigate={navigate} />
      </div>

      <BottomNav active={page} onNavigate={navigate} onAddTransaction={openAddTx} onSupport={openSupport} />
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      {showAddTx && <TransactionModal onClose={() => setShowAddTx(false)} onSave={showToast} />}
      {ToastEl}
      {showTour && <Onboarding page={page} onNavigate={navigate} onFinish={finishTour} />}
      <DarkModeSync dark={state.darkMode} />
    </div>
  )
}

/** Mirrors the dark-mode flag onto <html> so the global CSS theme applies everywhere, including portals. */
function DarkModeSync({ dark }: { dark: boolean }) {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  )
}

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AmbientBackground />
      <div className="relative text-center fade-in">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-3xl bg-pink-300/50 blur-xl animate-pulse" />
          <img src="/logo.png" alt="Finny" className="relative w-20 h-20 rounded-3xl object-cover shadow-lg float-anim"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
        <p className="font-black text-xl text-gray-800">Finny</p>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AppRoot() {
  const { user, loading } = useAuth()

  if (loading) return <Splash />

  if (!user) return <AuthPage />

  // Ambil nama dari metadata Supabase, fallback ke bagian sebelum @ di email
  const userName = user.user_metadata?.name
    || user.user_metadata?.full_name
    || user.email?.split('@')[0]
    || 'User'

  return (
    <AppProvider userName={userName}>
      <AppInner />
    </AppProvider>
  )
}
