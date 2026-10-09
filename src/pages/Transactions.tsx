import { useState } from 'react'
import { Search, SlidersHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight, Plus, ArrowDownUp, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatRp, formatDate } from '../utils/format'
import type { Transaction } from '../types'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { EmptyState } from '../components/ui/EmptyState'
import { TransactionModal } from '../components/TransactionModal'
import { PageHeader } from '../components/ui/Primitives'

interface Props { onAddTransaction: () => void; onToast: (msg: string) => void }

const PAGE_SIZE = 10

const TYPE_FILTERS = [
  { v: 'all', label: 'Semua' },
  { v: 'income', label: '💰 Pemasukan' },
  { v: 'expense', label: '💸 Pengeluaran' },
  { v: 'transfer', label: '🔄 Transfer' },
]

export function Transactions({ onAddTransaction, onToast }: Props) {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [filterWallet, setFilterWallet] = useState('all')
  const [sortNewest, setSortNewest] = useState(true)
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const filtered = state.transactions
    .filter(t => {
      const cat = state.categories.find(c => c.id === t.categoryId)
      const wallet = state.wallets.find(w => w.id === t.walletId)
      const matchSearch = !search || t.note.toLowerCase().includes(search.toLowerCase()) || cat?.name.toLowerCase().includes(search.toLowerCase()) || wallet?.name.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'all' || t.type === filterType
      const matchCat = filterCat === 'all' || t.categoryId === filterCat
      const matchWallet = filterWallet === 'all' || t.walletId === filterWallet
      return matchSearch && matchType && matchCat && matchWallet
    })
    .sort((a, b) => sortNewest ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalIn = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalOut = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  function handleDelete(id: string) { dispatch({ type: 'DELETE_TRANSACTION', payload: id }); onToast('Transaksi dihapus'); setDeleteId(null) }

  const selectClass = 'pill pill-off outline-none focus:border-pink-300 cursor-pointer'
  const amountClass = (t: Transaction) => t.type === 'income' ? 'text-green-500' : t.type === 'expense' ? 'text-red-400' : 'text-blue-400'
  const sign = (t: Transaction) => t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''

  return (
    <div className="space-y-4 stagger">
      <PageHeader
        title="Transaksi"
        subtitle="Semua transaksi keuanganmu dalam satu tempat."
        action={<button onClick={onAddTransaction} className="btn-primary"><Plus size={16} /> Tambah Transaksi</button>}
      />

      {/* Filters */}
      <div className="card p-4 space-y-3" data-tour="tx-filters">
        <div className="input-wrap py-2.5 gap-2">
          <Search size={16} className="text-gray-400" />
          <input placeholder="Cari catatan, kategori, atau dompet..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="flex-1 min-w-0 text-sm" />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }} className="icon-btn text-gray-400 hover:bg-gray-100 pop-in"><X size={14} /></button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <SlidersHorizontal size={14} className="text-gray-400" />
          {TYPE_FILTERS.map(({ v, label }) => (
            <button key={v} onClick={() => { setFilterType(v); setPage(1) }} className={`pill ${filterType === v ? 'pill-on' : 'pill-off'}`}>
              {label}
            </button>
          ))}
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }} className={selectClass}>
            <option value="all">Semua Kategori</option>
            {state.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select value={filterWallet} onChange={e => { setFilterWallet(e.target.value); setPage(1) }} className={selectClass}>
            <option value="all">Semua Dompet</option>
            {state.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
          </select>
          <button onClick={() => setSortNewest(b => !b)} className="pill pill-off inline-flex items-center gap-1.5">
            <ArrowDownUp size={12} className={`transition-transform duration-300 ${sortNewest ? '' : 'rotate-180'}`} />
            {sortNewest ? 'Terbaru' : 'Terlama'}
          </button>
        </div>
      </div>

      {/* Totals strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card px-4 py-3">
          <p className="text-[11px] text-gray-400 font-semibold">Hasil</p>
          <p className="text-lg font-black text-gray-800 tabular-nums">{filtered.length}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-[11px] text-gray-400 font-semibold">Masuk</p>
          <p className="text-sm md:text-lg font-black text-green-500 truncate tabular-nums">{formatRp(totalIn)}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-[11px] text-gray-400 font-semibold">Keluar</p>
          <p className="text-sm md:text-lg font-black text-red-400 truncate tabular-nums">{formatRp(totalOut)}</p>
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden" data-tour="tx-list">
        {/* Header (desktop) */}
        <div className="hidden md:grid grid-cols-[1fr_140px_120px_100px_150px] gap-4 px-5 py-3 bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <span>Deskripsi</span>
          <span>Kategori</span>
          <span>Dompet</span>
          <span>Tanggal</span>
          <span className="text-right">Nominal</span>
        </div>

        {paged.length === 0 ? (
          <EmptyState emoji="🔍" title="Nothing here yet 👀" subtitle="Belum ada transaksi yang cocok." action={{ label: '+ Tambah Transaksi', onClick: onAddTransaction }} />
        ) : (
          <div key={`${page}-${filterType}-${filterCat}-${filterWallet}-${sortNewest}`} className="divide-y divide-gray-50">
            {paged.map((tx, i) => {
              const cat = state.categories.find(c => c.id === tx.categoryId)
              const wallet = state.wallets.find(w => w.id === tx.walletId)
              const toWallet = tx.toWalletId ? state.wallets.find(w => w.id === tx.toWalletId) : null
              const walletLabel = tx.type === 'transfer' ? `${wallet?.name} → ${toWallet?.name}` : wallet?.name
              return (
                <div
                  key={tx.id}
                  className="group fade-in grid grid-cols-[1fr_auto] md:grid-cols-[1fr_140px_120px_100px_150px] gap-x-4 gap-y-1 items-center px-4 md:px-5 py-3.5 hover:bg-pink-50/40 transition-colors"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="icon-tile w-10 h-10 rounded-xl text-base" style={{ backgroundColor: tx.type === 'transfer' ? '#dbeafe' : cat?.color ? cat.color + '22' : '#f3f4f6' }}>
                      {tx.type === 'transfer' ? '🔄' : cat?.icon ?? '📦'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{tx.note || cat?.name || 'Transfer'}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate">
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${tx.type === 'income' ? 'bg-green-100 text-green-600' : tx.type === 'expense' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                          {tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer'}
                        </span>
                        <span className="md:hidden truncate">{formatDate(tx.date)} · {walletLabel}</span>
                      </p>
                    </div>
                  </div>
                  <span className="hidden md:flex text-xs text-gray-500 items-center gap-1 truncate">{cat ? <>{cat.icon} {cat.name}</> : '—'}</span>
                  <span className="hidden md:block text-xs text-gray-500 truncate">{walletLabel}</span>
                  <span className="hidden md:block text-xs text-gray-400">{formatDate(tx.date)}</span>
                  <div className="flex items-center justify-end gap-1">
                    <span className={`text-sm font-bold tabular-nums whitespace-nowrap transition-transform duration-300 md:group-hover:-translate-x-1 ${amountClass(tx)}`}>
                      {sign(tx)}{formatRp(tx.amount)}
                    </span>
                    <div className="flex items-center md:w-0 md:overflow-hidden md:opacity-0 md:group-hover:w-[60px] md:group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => setEditTx(tx)} aria-label="Edit" className="icon-btn hover:bg-pink-100 text-gray-400 hover:text-pink-500"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(tx.id)} aria-label="Hapus" className="icon-btn hover:bg-red-100 text-gray-400 hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
            <span className="text-xs text-gray-400">Hal {page} dari {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="icon-btn text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-300 ${page === p ? 'bg-gradient-to-br from-pink-500 to-pink-400 text-white shadow-md shadow-pink-200 scale-105' : 'hover:bg-gray-100 text-gray-500'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="icon-btn text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteId && <ConfirmModal title="Hapus Transaksi" message="Transaksi ini akan dihapus dan saldo akan diperbarui." onConfirm={() => handleDelete(deleteId)} onCancel={() => setDeleteId(null)} />}
      {editTx && <TransactionModal editTx={editTx} onClose={() => setEditTx(null)} onSave={onToast} />}
    </div>
  )
}
