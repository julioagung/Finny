import { LayoutDashboard, ArrowLeftRight, BarChart2, Target, PiggyBank, Wallet, RefreshCw, Settings, Plus, Moon, Sun } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CreatorCredit } from '../ui/CreatorCredit'

interface SidebarProps {
  active: string
  onNavigate: (page: string) => void
  onAddTransaction: () => void
  onSupport: () => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'budget', label: 'Budget', icon: Target },
  { id: 'goals', label: 'Goals', icon: PiggyBank },
  { id: 'wallets', label: 'Wallet', icon: Wallet },
  { id: 'recurring', label: 'Recurring', icon: RefreshCw },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// Item height (44px) + gap (4px); keeps the sliding indicator aligned with the buttons.
const ITEM_STEP = 48

export function Sidebar({ active, onNavigate, onAddTransaction, onSupport }: SidebarProps) {
  const { state, dispatch } = useApp()
  const activeIdx = navItems.findIndex(n => n.id === active)

  return (
    <aside className="hidden md:flex flex-col w-[248px] h-screen fixed left-0 top-0 z-50 glass border-r border-gray-100">
      {/* Logo */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Finny" className="w-10 h-10 rounded-2xl object-cover shadow-md shadow-pink-200/50 hover:rotate-6 transition-transform duration-300" />
          <div>
            <span className="font-black text-xl text-gray-800 block leading-none">Finny</span>
            <span className="text-[11px] text-gray-400">Money check ✨</span>
          </div>
        </div>
      </div>

      {/* Add Transaction Button */}
      <div className="px-4 mb-5">
        <button onClick={onAddTransaction} data-tour="add-tx" className="btn-primary w-full py-3 group">
          <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* Navigation */}
      <p className="px-6 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-300">Menu</p>
      <nav className="relative flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
        {activeIdx >= 0 && (
          <div
            className="absolute left-3 right-3 top-0 h-11 rounded-2xl bg-pink-50 border border-pink-100"
            style={{ transform: `translateY(${activeIdx * ITEM_STEP}px)`, transition: 'transform 0.45s var(--ease-spring)' }}
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-1 h-5 rounded-r-full bg-pink-500" />
          </div>
        )}
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`relative z-10 h-11 flex-shrink-0 w-full flex items-center gap-3 px-3.5 rounded-2xl text-sm font-semibold transition-colors duration-200 group ${
                isActive ? 'text-pink-500' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Support */}
      <div className="px-3 pt-2">
        <button
          onClick={onSupport}
          data-tour="support"
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-pink-50 border border-pink-100 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all"
        >
          <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm transition-transform duration-300 group-hover:rotate-12">☕</span>
          <span className="text-left leading-tight">
            <span className="block text-sm font-bold text-gray-700">Dukung Finny</span>
            <span className="block text-[10px] text-gray-400">Traktir kopi via QRIS</span>
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 mx-3 mt-3 mb-2 rounded-3xl bg-gray-50 border border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
          >
            {state.profilePhoto ? (
              <img src={state.profilePhoto} alt="profil" className="w-9 h-9 rounded-full object-cover ring-2 ring-pink-200" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {state.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 text-left">
              <span className="text-sm font-bold text-gray-700 block truncate">{state.userName}</span>
              <span className="text-[10px] text-gray-400">Little steps, big goals 🌸</span>
            </div>
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            aria-label="Ganti tema"
            className={`relative w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center overflow-hidden transition-colors ${state.darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-500 hover:text-pink-500 shadow-sm'}`}
          >
            <Sun size={15} className={`absolute transition-all duration-500 ${state.darkMode ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} />
            <Moon size={15} className={`absolute transition-all duration-500 ${state.darkMode ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
          </button>
        </div>
      </div>
      <div className="px-6 pb-4 text-center">
        <CreatorCredit className="text-[10px]" />
      </div>
    </aside>
  )
}
