import { useState } from 'react'
import { LayoutDashboard, ArrowLeftRight, Plus, BarChart2, LayoutGrid, Target, PiggyBank, Wallet, RefreshCw, Settings, Moon, Sun, Coffee } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { useApp } from '../../context/AppContext'
import { CreatorCredit } from '../ui/CreatorCredit'

interface BottomNavProps {
  active: string
  onNavigate: (page: string) => void
  onAddTransaction: () => void
  onSupport: () => void
}

const PRIMARY = ['dashboard', 'transactions', 'analytics']

const MORE_ITEMS = [
  { id: 'budget', label: 'Budget', icon: Target, tint: 'bg-amber-50 text-amber-500' },
  { id: 'goals', label: 'Goals', icon: PiggyBank, tint: 'bg-pink-50 text-pink-500' },
  { id: 'wallets', label: 'Wallet', icon: Wallet, tint: 'bg-sky-50 text-sky-500' },
  { id: 'recurring', label: 'Recurring', icon: RefreshCw, tint: 'bg-violet-50 text-violet-500' },
  { id: 'settings', label: 'Settings', icon: Settings, tint: 'bg-gray-100 text-gray-500' },
]

function NavBtn({ icon: Icon, label, isActive, onClick, tour }: { icon: typeof LayoutDashboard; label: string; isActive: boolean; onClick: () => void; tour?: string }) {
  return (
    <button onClick={onClick} data-tour={tour} className="relative flex-1 flex flex-col items-center gap-0.5 py-1.5 active:scale-90 transition-transform">
      <span className={`relative flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-300 ${isActive ? 'bg-pink-100 text-pink-500' : 'text-gray-400'}`}>
        <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
      </span>
      <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>{label}</span>
    </button>
  )
}

export function BottomNav({ active, onNavigate, onAddTransaction, onSupport }: BottomNavProps) {
  const { state, dispatch } = useApp()
  const [showMore, setShowMore] = useState(false)
  const moreActive = !PRIMARY.includes(active)

  return (
    <>
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 glass rounded-[1.75rem] border border-gray-100" style={{ boxShadow: 'var(--shadow-pop)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center px-1 py-1">
          <NavBtn icon={LayoutDashboard} label="Home" isActive={active === 'dashboard'} onClick={() => onNavigate('dashboard')} />
          <NavBtn icon={ArrowLeftRight} label="Transaksi" isActive={active === 'transactions'} onClick={() => onNavigate('transactions')} />

          {/* Center FAB */}
          <div className="flex-1 flex justify-center">
            <button onClick={onAddTransaction} data-tour="add-tx" aria-label="Tambah transaksi" className="-mt-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-400 flex items-center justify-center shadow-xl shadow-pink-300/60 rotate-45 active:scale-90 transition-transform pulse-ring">
              <Plus size={26} className="text-white -rotate-45" />
            </button>
          </div>

          <NavBtn icon={BarChart2} label="Analytics" isActive={active === 'analytics'} onClick={() => onNavigate('analytics')} />
          <NavBtn icon={LayoutGrid} tour="support" label="Lainnya" isActive={moreActive || showMore} onClick={() => setShowMore(true)} />
        </div>
      </nav>

      {showMore && (
        <Modal onClose={() => setShowMore(false)}>
          {close => (
            <>
              <h2 className="font-black text-gray-800 text-lg mb-4">Menu lainnya</h2>
              <div className="grid grid-cols-3 gap-3 stagger">
                {MORE_ITEMS.map(({ id, label, icon: Icon, tint }) => (
                  <button
                    key={id}
                    onClick={() => close(() => { setShowMore(false); onNavigate(id) })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-3xl border transition-all active:scale-95 ${active === id ? 'border-pink-200 bg-pink-50' : 'border-gray-100 bg-white'}`}
                  >
                    <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tint}`}><Icon size={20} /></span>
                    <span className="text-xs font-semibold text-gray-600">{label}</span>
                  </button>
                ))}
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
                  className="flex flex-col items-center gap-2 p-3 rounded-3xl border border-gray-100 bg-white transition-all active:scale-95"
                >
                  <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${state.darkMode ? 'bg-yellow-50 text-yellow-500' : 'bg-indigo-50 text-indigo-500'}`}>
                    {state.darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </span>
                  <span className="text-xs font-semibold text-gray-600">{state.darkMode ? 'Light' : 'Dark'}</span>
                </button>
              </div>
              <button
                onClick={() => close(() => { setShowMore(false); onSupport() })}
                className="mt-3 w-full flex items-center gap-3 p-3 rounded-3xl bg-pink-50 border border-pink-100 active:scale-[0.98] transition-transform"
              >
                <span className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-pink-500 shadow-sm"><Coffee size={20} /></span>
                <span className="text-left">
                  <span className="block text-sm font-bold text-gray-700">Dukung Finny ☕</span>
                  <span className="block text-[11px] text-gray-400">Traktir kopi pembuatnya via QRIS</span>
                </span>
              </button>
              <div className="text-center mt-4">
                <CreatorCredit />
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  )
}
