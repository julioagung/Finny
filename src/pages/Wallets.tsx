import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatRp } from '../utils/format'
import type { Wallet } from '../types'
import { genId } from '../utils/format'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Modal, ModalHeader } from '../components/ui/Modal'
import { AnimatedRp, PageHeader } from '../components/ui/Primitives'

interface Props { onToast: (m: string) => void }

const WALLET_ICONS = ['💙','🏦','💜','💵','💳','💰','🏧','📱']
const WALLET_TYPES = ['e-wallet','bank','cash','tabungan','investasi']

// Card accents per wallet type, so the grid reads like a stack of real cards.
const TYPE_GRADIENT: Record<string, string> = {
  'e-wallet': 'from-sky-400 to-indigo-400',
  bank: 'from-violet-400 to-fuchsia-400',
  cash: 'from-emerald-400 to-teal-400',
  tabungan: 'from-pink-400 to-rose-400',
  investasi: 'from-amber-400 to-orange-400',
}

function WalletForm({ initial, onSave, onClose }: { initial?: Partial<Wallet>; onSave: (w: Wallet) => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState(initial?.type ?? 'bank')
  const [balance, setBalance] = useState(initial?.balance ? String(initial.balance) : '')
  const [icon, setIcon] = useState(initial?.icon ?? '🏦')

  function handle(close: (after?: () => void) => void) {
    if (!name) return
    const wallet = { id: initial?.id ?? genId(), name, type, balance: Number(balance) || 0, icon, color: '#4A90D9' }
    close(() => onSave(wallet))
  }

  return (
    <Modal onClose={onClose}>
      {close => (
        <>
          <ModalHeader emoji="💳" title={initial?.id ? 'Edit Dompet' : 'Dompet Baru'} subtitle="Rekening, e-wallet, atau cash" onClose={() => close()} />

          {/* Live preview */}
          <div className={`relative overflow-hidden rounded-3xl p-4 mb-4 text-white bg-gradient-to-br ${TYPE_GRADIENT[type] ?? 'from-pink-400 to-rose-400'} transition-all duration-500`}>
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/15" />
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{icon}</span>
              <span className="font-bold truncate">{name || 'Nama dompet'}</span>
              <span className="ml-auto text-[10px] font-bold uppercase bg-white/25 px-2 py-0.5 rounded-lg">{type}</span>
            </div>
            <p className="text-xl font-black tabular-nums">{formatRp(Number(balance) || 0)}</p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="field-label">Nama Dompet</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="BCA, DANA, Cash..." className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Tipe</label>
                <select value={type} onChange={e => setType(e.target.value)} className="input capitalize">
                  {WALLET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Saldo Awal</label>
                <input type="number" inputMode="numeric" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0" className="input" />
              </div>
            </div>
            <div>
              <label className="field-label">Icon</label>
              <div className="grid grid-cols-8 gap-2">
                {WALLET_ICONS.map(i => (
                  <button key={i} type="button" onClick={() => setIcon(i)} className={`aspect-square rounded-xl text-lg transition-all duration-200 active:scale-90 ${icon === i ? 'bg-pink-100 ring-2 ring-pink-400 scale-110' : 'bg-gray-50 hover:bg-gray-100 hover:scale-105'}`}>{i}</button>
                ))}
              </div>
            </div>
            <button onClick={() => handle(close)} className="btn-primary w-full py-3 font-bold mt-1">
              Simpan ✨
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

export function Wallets({ onToast }: Props) {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editWallet, setEditWallet] = useState<Wallet | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const total = state.wallets.reduce((s, w) => s + w.balance, 0)

  return (
    <div className="space-y-5 stagger">
      <PageHeader
        title="Wallets"
        subtitle="Kelola semua dompet dan rekeningmu."
        action={<button onClick={() => setShowForm(true)} data-tour="wallet-add" className="btn-primary"><Plus size={16} /> Tambah Wallet</button>}
      />

      {/* Total */}
      <div className="hero-card p-6" data-tour="wallet-total">
        <span className="sheen" />
        <p className="text-pink-50/90 text-sm font-semibold mb-1">Total Saldo</p>
        <p className="text-3xl md:text-4xl font-black"><AnimatedRp value={total} /></p>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {state.wallets.slice(0, 6).map(w => (
            <span key={w.id} className="flex items-center gap-1 text-[11px] font-semibold bg-white/20 px-2 py-1 rounded-lg">
              {w.icon} {total > 0 ? Math.round((w.balance / total) * 100) : 0}%
            </span>
          ))}
          <span className="text-pink-50/80 text-xs ml-auto">{state.wallets.length} dompet aktif ✦</span>
        </div>
      </div>

      {state.wallets.length === 0 ? (
        <EmptyState emoji="👛" title="Belum ada dompet" subtitle="Tambahkan dompet atau rekening pertamamu." action={{ label: '+ Tambah Dompet', onClick: () => setShowForm(true) }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {state.wallets.map((w, i) => {
            const txCount = state.transactions.filter(t => t.walletId === w.id || t.toWalletId === w.id).length
            const share = total > 0 ? Math.round((w.balance / total) * 100) : 0
            return (
              <div key={w.id} className="card card-hover group fade-in overflow-hidden" style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
                <div className={`h-1.5 bg-gradient-to-r ${TYPE_GRADIENT[w.type] ?? 'from-pink-400 to-rose-400'}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="icon-tile w-12 h-12 bg-gray-50 text-2xl">{w.icon}</div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 truncate">{w.name}</h3>
                        <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg capitalize">{w.type}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      <button onClick={() => setEditWallet(w)} aria-label="Edit dompet" className="icon-btn hover:bg-pink-50 hover:text-pink-400"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(w.id)} aria-label="Hapus dompet" className="icon-btn hover:bg-red-50 hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-800 tabular-nums">{formatRp(w.balance)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">{txCount} transaksi total</p>
                    <p className="text-xs font-bold text-pink-500">{share}% dari total</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && <WalletForm onSave={w => { dispatch({ type: 'ADD_WALLET', payload: w }); onToast('Dompet ditambahkan 💗'); setShowForm(false) }} onClose={() => setShowForm(false)} />}
      {editWallet && <WalletForm initial={editWallet} onSave={w => { dispatch({ type: 'EDIT_WALLET', payload: w }); onToast('Dompet diperbarui 💗'); setEditWallet(null) }} onClose={() => setEditWallet(null)} />}
      {deleteId && <ConfirmModal title="Hapus Dompet" message="Semua data transaksi dompet ini tidak ikut terhapus." onConfirm={() => { dispatch({ type: 'DELETE_WALLET', payload: deleteId }); onToast('Dompet dihapus'); setDeleteId(null) }} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}
