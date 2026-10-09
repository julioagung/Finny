import { useState } from 'react'
import { Plus, Trash2, Pencil, CalendarDays } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatRp } from '../utils/format'
import type { SavingsGoal } from '../types'
import { genId } from '../utils/format'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Modal, ModalHeader } from '../components/ui/Modal'
import { AnimatedRp, PageHeader, ProgressBar } from '../components/ui/Primitives'

interface Props { onToast: (m: string) => void }

const ICONS = ['💻','✈️','🛡️','🏍️','🏠','📱','👟','🎮','📚','💍','🎸','🌴']

function GoalForm({ initial, onSave, onClose }: { initial?: Partial<SavingsGoal>; onSave: (g: SavingsGoal) => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [target, setTarget] = useState(initial?.targetAmount ? String(initial.targetAmount) : '')
  const [current, setCurrent] = useState(initial?.currentAmount ? String(initial.currentAmount) : '')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '💻')

  function handle(close: (after?: () => void) => void) {
    if (!name || !target) return
    const goal = { id: initial?.id ?? genId(), name, targetAmount: Number(target), currentAmount: Number(current) || 0, deadline, icon, color: '#E91E8C' }
    close(() => onSave(goal))
  }

  return (
    <Modal onClose={onClose}>
      {close => (
        <>
          <ModalHeader emoji={icon} title={initial?.id ? 'Edit Goal' : 'Goal Baru'} subtitle="Little steps, big goals 🌱" onClose={() => close()} />
          <div className="space-y-3.5">
            <div>
              <label className="field-label">Nama Goal</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Laptop Baru..." className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Target (Rp)</label>
                <input type="number" inputMode="numeric" value={target} onChange={e => setTarget(e.target.value)} placeholder="0" className="input" />
              </div>
              <div>
                <label className="field-label">Terkumpul (Rp)</label>
                <input type="number" inputMode="numeric" value={current} onChange={e => setCurrent(e.target.value)} placeholder="0" className="input" />
              </div>
            </div>
            <div>
              <label className="field-label">Deadline</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="input" />
            </div>
            <div>
              <label className="field-label">Icon</label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map(i => (
                  <button key={i} type="button" onClick={() => setIcon(i)} className={`aspect-square rounded-2xl text-xl transition-all duration-200 active:scale-90 ${icon === i ? 'bg-pink-100 ring-2 ring-pink-400 scale-110' : 'bg-gray-50 hover:bg-gray-100 hover:scale-105'}`}>{i}</button>
                ))}
              </div>
            </div>
            <button onClick={() => handle(close)} className="btn-primary w-full py-3 font-bold mt-1">
              Simpan Goal ✨
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000]

function AddMoneyModal({ goal, onSave, onClose }: { goal: SavingsGoal; onSave: (amount: number) => void; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
  return (
    <Modal onClose={onClose} className="sm:max-w-[360px]">
      {close => (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-3xl bg-pink-50 flex items-center justify-center text-4xl float-anim">{goal.icon}</div>
          <h3 className="font-black text-gray-800 text-lg">{goal.name}</h3>
          <p className="text-xs text-gray-400 mb-3">Terkumpul: {formatRp(goal.currentAmount)} / {formatRp(goal.targetAmount)}</p>
          <div className="mb-4"><ProgressBar pct={pct} color="#ec4899" height={6} /></div>
          <div className="input-wrap mb-3">
            <span className="text-gray-400 font-bold text-sm mr-2">Rp</span>
            <input type="number" inputMode="numeric" placeholder="0" autoFocus value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 min-w-0 text-xl font-black text-left" />
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-5">
            {QUICK_AMOUNTS.map(q => (
              <button key={q} type="button" onClick={() => setAmount(String(q))} className="btn-soft px-1 py-2 text-[11px]">
                {q >= 1000000 ? `${q / 1000000}jt` : `${q / 1000}rb`}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => close()} className="btn-outline flex-1">Batal</button>
            <button onClick={() => { if (amount) close(() => { onSave(Number(amount)); onClose() }) }} className="btn-primary flex-1 font-bold">Simpan 💗</button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export function Goals({ onToast }: Props) {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null)
  const [addMoneyGoal, setAddMoneyGoal] = useState<SavingsGoal | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const total = state.savingsGoals.reduce((s, g) => s + g.currentAmount, 0)
  const totalTarget = state.savingsGoals.reduce((s, g) => s + g.targetAmount, 0)
  const overallPct = totalTarget ? Math.round((total / totalTarget) * 100) : 0
  const completed = state.savingsGoals.filter(g => g.currentAmount >= g.targetAmount).length

  return (
    <div className="space-y-5 stagger">
      <PageHeader
        title="Savings Goals"
        subtitle="Wujudkan impianmu satu langkah kecil."
        action={<button onClick={() => setShowForm(true)} data-tour="goals-add" className="btn-primary"><Plus size={16} /> Goal Baru</button>}
      />

      {state.savingsGoals.length > 0 && (
        <div className="hero-card p-6">
          <span className="sheen" />
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-pink-50/90 text-sm font-semibold">Total Tabungan</p>
              <p className="text-3xl md:text-4xl font-black mt-1"><AnimatedRp value={total} /></p>
              <p className="text-pink-50/80 text-xs mt-1">dari {state.savingsGoals.length} goals aktif · {completed} tercapai ✦</p>
            </div>
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={`${(Math.min(100, overallPct) / 100) * 97.4} 97.4`}
                  style={{ transition: 'stroke-dasharray 1s var(--ease-out)' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{overallPct}%</span>
            </div>
          </div>
        </div>
      )}

      {state.savingsGoals.length === 0 ? (
        <EmptyState emoji="🌱" title="Belum ada goals" subtitle="Buat target tabungan pertamamu dan mulai menabung! Little steps, big goals." action={{ label: '+ Buat Goal', onClick: () => setShowForm(true) }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {state.savingsGoals.map((g, i) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
            const remaining = g.targetAmount - g.currentAmount
            return (
              <div key={g.id} className="card card-hover group fade-in p-5 flex flex-col" style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="icon-tile w-12 h-12 bg-pink-50 text-2xl">{g.icon}</div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{g.name}</h3>
                      {g.deadline && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <CalendarDays size={11} />{new Date(g.deadline).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => setEditGoal(g)} aria-label="Edit goal" className="icon-btn hover:bg-pink-50 hover:text-pink-400"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteId(g.id)} aria-label="Hapus goal" className="icon-btn hover:bg-red-50 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-lg font-black text-gray-800 tabular-nums">{formatRp(g.currentAmount)}</span>
                    <span className="text-sm font-black text-pink-500">{pct}%</span>
                  </div>
                  <ProgressBar pct={pct} color={pct === 100 ? '#34d399' : '#ec4899'} />
                  <p className="text-[11px] text-gray-400 mt-1.5">Target {formatRp(g.targetAmount)}</p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <p className="text-xs text-gray-400">Sisa: <span className="font-bold text-gray-600">{formatRp(Math.max(0, remaining))}</span></p>
                  {pct < 100 && (
                    <button onClick={() => setAddMoneyGoal(g)} className="btn-soft">
                      <Plus size={12} /> Tambah Dana
                    </button>
                  )}
                </div>

                {pct === 100 && (
                  <div className="mt-3 text-center py-2 bg-green-50 rounded-xl pop-in">
                    <span className="text-xs font-bold text-green-600">🎉 Goal tercapai! You're amazing!</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <GoalForm
          onSave={g => { dispatch({ type: 'ADD_GOAL', payload: g }); onToast('Goal ditambahkan 💗'); setShowForm(false) }}
          onClose={() => setShowForm(false)}
        />
      )}
      {editGoal && (
        <GoalForm
          initial={editGoal}
          onSave={g => { dispatch({ type: 'EDIT_GOAL', payload: g }); onToast('Goal diperbarui 💗'); setEditGoal(null) }}
          onClose={() => setEditGoal(null)}
        />
      )}
      {addMoneyGoal && (
        <AddMoneyModal
          goal={addMoneyGoal}
          onSave={amount => {
            const updated = { ...addMoneyGoal, currentAmount: Math.min(addMoneyGoal.targetAmount, addMoneyGoal.currentAmount + amount) }
            dispatch({ type: 'EDIT_GOAL', payload: updated })
            onToast(`+${formatRp(amount)} ditambahkan ke ${addMoneyGoal.name} 💗`)
          }}
          onClose={() => setAddMoneyGoal(null)}
        />
      )}
      {deleteId && <ConfirmModal title="Hapus Goal" message="Goal ini akan dihapus permanen." onConfirm={() => { dispatch({ type: 'DELETE_GOAL', payload: deleteId }); onToast('Goal dihapus'); setDeleteId(null) }} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}
