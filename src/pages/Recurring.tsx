import { useState } from 'react'
import { Plus, Trash2, BellRing, CalendarClock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatRp } from '../utils/format'
import type { RecurringTransaction } from '../types'
import { genId } from '../utils/format'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Modal, ModalHeader } from '../components/ui/Modal'
import { PageHeader, Segmented } from '../components/ui/Primitives'

interface Props { onToast: (m: string) => void }

function daysUntil(dayOfMonth: number) {
  const today = new Date()
  const d = today.getDate()
  if (dayOfMonth >= d) return dayOfMonth - d
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  return daysInMonth - d + dayOfMonth
}

export function Recurring({ onToast }: Props) {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<'income'|'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [catId, setCatId] = useState('')
  const [walletId, setWalletId] = useState(state.wallets[0]?.id ?? '')
  const [day, setDay] = useState('1')

  const cats = state.categories.filter(c => c.type === type)

  function handleAdd(close: (after?: () => void) => void) {
    if (!name || !amount || !catId) return
    const r: RecurringTransaction = { id: genId(), name, type, amount: Number(amount), categoryId: catId, walletId, dayOfMonth: Number(day), note: '' }
    dispatch({ type: 'ADD_RECURRING', payload: r })
    onToast('Recurring ditambahkan 💗')
    close(() => { setShowForm(false); setName(''); setAmount(''); setCatId('') })
  }

  const monthlyIn = state.recurringTransactions.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const monthlyOut = state.recurringTransactions.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  const sorted = [...state.recurringTransactions].sort((a, b) => daysUntil(a.dayOfMonth) - daysUntil(b.dayOfMonth))

  return (
    <div className="space-y-5 stagger">
      <PageHeader
        title="Recurring"
        subtitle="Transaksi rutin yang terjadwal otomatis."
        action={<button onClick={() => setShowForm(true)} data-tour="recurring-add" className="btn-primary"><Plus size={16} /> Tambah Recurring</button>}
      />

      {state.recurringTransactions.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <p className="text-[11px] font-semibold text-gray-400">Pemasukan rutin / bulan</p>
            <p className="text-lg font-black text-green-500 tabular-nums truncate">+{formatRp(monthlyIn)}</p>
          </div>
          <div className="card p-4">
            <p className="text-[11px] font-semibold text-gray-400">Pengeluaran rutin / bulan</p>
            <p className="text-lg font-black text-red-400 tabular-nums truncate">-{formatRp(monthlyOut)}</p>
          </div>
        </div>
      )}

      {state.recurringTransactions.length === 0 ? (
        <EmptyState emoji="🔄" title="Belum ada recurring" subtitle="Atur transaksi rutin seperti gaji atau tagihan bulanan." action={{ label: '+ Tambah Recurring', onClick: () => setShowForm(true) }} />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {sorted.map((r, i) => {
            const cat = state.categories.find(c => c.id === r.categoryId)
            const wallet = state.wallets.find(w => w.id === r.walletId)
            const due = daysUntil(r.dayOfMonth)
            return (
              <div key={r.id} className="card card-hover group fade-in p-4 flex items-center gap-4" style={{ animationDelay: `${0.15 + i * 0.04}s` }}>
                <div className="icon-tile w-12 h-12 text-xl" style={{ backgroundColor: (cat?.color ?? '#ccc') + '22' }}>
                  {cat?.icon ?? '🔄'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800 truncate">{r.name}</h3>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${r.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {r.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {cat?.name} · {wallet?.name} · Setiap tgl {r.dayOfMonth}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl bg-gray-50 min-w-[64px]">
                  <span className={`text-sm font-black ${due <= 2 ? 'text-pink-500' : 'text-gray-700'}`}>{due === 0 ? 'Hari ini' : `${due}h`}</span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><CalendarClock size={9} /> lagi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-black tabular-nums whitespace-nowrap ${r.type === 'income' ? 'text-green-500' : 'text-red-400'}`}>
                    {r.type === 'income' ? '+' : '-'}{formatRp(r.amount)}
                  </span>
                  <button onClick={() => setDeleteId(r.id)} aria-label="Hapus recurring" className="icon-btn hover:bg-red-50 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info */}
      <div className="rounded-3xl p-4 flex items-start gap-3 bg-pink-50 border border-pink-100">
        <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <BellRing size={16} className="text-pink-500 wiggle" />
        </div>
        <div>
          <p className="text-sm font-bold text-pink-600">Reminder aktif 🔔</p>
          <p className="text-xs text-pink-400 mt-0.5">Finny akan mengingatkanmu saat transaksi rutin tiba waktunya.</p>
        </div>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          {close => (
            <>
              <ModalHeader emoji="🔄" title="Recurring Baru" subtitle="Gaji, langganan, tagihan..." onClose={() => close()} />
              <div className="space-y-3.5">
                <div>
                  <label className="field-label">Nama</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Gaji, Netflix, Gym..." className="input" />
                </div>
                <Segmented<'income' | 'expense'>
                  value={type}
                  onChange={t => { setType(t); setCatId('') }}
                  options={[
                    { value: 'expense', label: '💸 Pengeluaran' },
                    { value: 'income', label: '💰 Pemasukan' },
                  ]}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Nominal</label>
                    <input type="number" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="input" />
                  </div>
                  <div>
                    <label className="field-label">Tanggal tiap bulan</label>
                    <input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Kategori</label>
                    <select value={catId} onChange={e => setCatId(e.target.value)} className="input">
                      <option value="">Pilih...</option>
                      {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Dompet</label>
                    <select value={walletId} onChange={e => setWalletId(e.target.value)} className="input">
                      {state.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => handleAdd(close)} className="btn-primary w-full py-3 font-bold mt-1">
                  Simpan ✨
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {deleteId && <ConfirmModal title="Hapus Recurring" message="Recurring ini akan dihapus." onConfirm={() => { dispatch({ type: 'DELETE_RECURRING', payload: deleteId }); onToast('Recurring dihapus'); setDeleteId(null) }} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}
