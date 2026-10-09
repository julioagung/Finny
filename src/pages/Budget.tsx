import { useState } from 'react'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatRp, isSameMonth } from '../utils/format'
import type { Budget as BudgetType } from '../types'
import { genId } from '../utils/format'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Modal, ModalHeader } from '../components/ui/Modal'
import { AnimatedRp, PageHeader, ProgressBar } from '../components/ui/Primitives'

interface Props { onToast: (m: string) => void }

export function Budget({ onToast }: Props) {
  const { state, dispatch } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [catId, setCatId] = useState('')
  const [limit, setLimit] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const now = new Date()
  const expCats = state.categories.filter(c => c.type === 'expense')
  const usedCatIds = state.budgets.map(b => b.categoryId)
  const availCats = expCats.filter(c => !usedCatIds.includes(c.id))

  function getSpent(catId: string) {
    return state.transactions
      .filter(t => t.type === 'expense' && t.categoryId === catId && isSameMonth(t.date, now.getMonth(), now.getFullYear()))
      .reduce((s, t) => s + t.amount, 0)
  }

  function handleAdd(close: (after?: () => void) => void) {
    if (!catId || !limit || isNaN(Number(limit))) return
    const b: BudgetType = { id: genId(), categoryId: catId, limit: Number(limit), period: 'monthly' }
    dispatch({ type: 'ADD_BUDGET', payload: b })
    onToast('Budget ditambahkan 💗')
    close(() => { setShowModal(false); setCatId(''); setLimit('') })
  }

  const totalLimit = state.budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = state.budgets.reduce((s, b) => s + getSpent(b.categoryId), 0)
  const totalPct = totalLimit ? Math.round((totalSpent / totalLimit) * 100) : 0

  return (
    <div className="space-y-5 stagger">
      <PageHeader
        title="Budget"
        subtitle="Atur pengeluaranmu agar tetap terkendali."
        action={<button onClick={() => setShowModal(true)} data-tour="budget-add" className="btn-primary"><Plus size={16} /> Atur Budget Baru</button>}
      />

      {state.budgets.length > 0 && (
        <div className="hero-card p-6">
          <span className="sheen" />
          <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
            <div>
              <p className="text-sm text-pink-50/90 font-semibold">Terpakai bulan ini</p>
              <p className="text-3xl font-black mt-1"><AnimatedRp value={totalSpent} /></p>
              <p className="text-xs text-pink-50/80 mt-1">dari total limit {formatRp(totalLimit)}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black">{totalPct}%</p>
              <p className="text-xs text-pink-50/80">{state.budgets.length} budget aktif ✦</p>
            </div>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/25 overflow-hidden">
            <div className="progress-fill bg-white" style={{ width: `${Math.min(100, totalPct)}%` }} />
          </div>
        </div>
      )}

      {state.budgets.length === 0 ? (
        <EmptyState emoji="🎯" title="Belum ada budget" subtitle="Atur budget pengeluaran agar keuanganmu lebih terkontrol." action={{ label: '+ Atur Budget Baru', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.budgets.map((b, i) => {
            const cat = state.categories.find(c => c.id === b.categoryId)
            const spent = getSpent(b.categoryId)
            const pct = Math.min(100, Math.round((spent / b.limit) * 100))
            const exceeded = pct >= 100
            const warning = pct >= 80 && !exceeded
            const remaining = Math.max(0, b.limit - spent)

            return (
              <div
                key={b.id}
                className={`card card-hover group fade-in p-5 ${exceeded ? '!border-red-200' : warning ? '!border-yellow-200' : ''}`}
                style={{ animationDelay: `${0.15 + i * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="icon-tile w-12 h-12 text-xl" style={{ backgroundColor: (cat?.color ?? '#ccc') + '22' }}>
                      {cat?.icon ?? '📦'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{cat?.name}</h3>
                      <p className="text-xs text-gray-400 tabular-nums">{formatRp(spent)} / {formatRp(b.limit)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-black tabular-nums ${exceeded ? 'text-red-500' : warning ? 'text-yellow-500' : 'text-gray-700'}`}>{pct}%</span>
                    <button onClick={() => setDeleteId(b.id)} aria-label="Hapus budget" className="icon-btn hover:bg-red-50 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <ProgressBar pct={pct} color={exceeded ? '#f87171' : warning ? '#fbbf24' : cat?.color ?? '#f9a8d4'} />
                <div className="flex items-center justify-between mt-3 gap-2">
                  {exceeded ? (
                    <span className="px-2 py-1 bg-red-100 text-red-500 text-[11px] font-bold rounded-lg">Exceeded 😬</span>
                  ) : warning ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-600 text-[11px] font-bold rounded-lg">
                      <AlertTriangle size={11} /> Getting close 💗
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-lg">On track ✨</span>
                  )}
                  <span className="text-xs text-gray-400">Sisa <span className="font-bold text-gray-600">{formatRp(remaining)}</span></span>
                </div>
                {exceeded && (
                  <p className="text-xs text-red-400 mt-2">Budget terlampaui. Yuk perhatikan pengeluaranmu! 🌸</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {close => (
            <>
              <ModalHeader emoji="🎯" title="Atur Budget Baru" subtitle="Limit pengeluaran per bulan" onClose={() => close()} />
              <div className="space-y-4">
                <div>
                  <label className="field-label">Kategori</label>
                  {availCats.length === 0 ? (
                    <p className="text-sm text-gray-400 bg-gray-50 rounded-2xl p-3">Semua kategori sudah punya budget 🎉</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availCats.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCatId(c.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 ${catId === c.id ? 'border-transparent text-white shadow-md scale-105' : 'border-gray-100 text-gray-600 bg-white hover:border-pink-200'}`}
                          style={catId === c.id ? { backgroundColor: c.color } : undefined}
                        >
                          <span>{c.icon}</span>{c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="field-label">Limit Bulanan</label>
                  <div className="input-wrap">
                    <span className="text-gray-400 font-bold text-sm mr-2">Rp</span>
                    <input type="number" inputMode="numeric" placeholder="0" value={limit} onChange={e => setLimit(e.target.value)} className="flex-1 min-w-0 text-xl font-black" />
                  </div>
                </div>
                <button onClick={() => handleAdd(close)} className="btn-primary w-full py-3 font-bold">
                  Simpan Budget ✨
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {deleteId && <ConfirmModal title="Hapus Budget" message="Budget ini akan dihapus." onConfirm={() => { dispatch({ type: 'DELETE_BUDGET', payload: deleteId }); onToast('Budget dihapus'); setDeleteId(null) }} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}
