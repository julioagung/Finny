import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Transaction, TransactionType } from '../types'
import { genId, formatRp } from '../utils/format'
import { Modal, ModalHeader } from './ui/Modal'
import { Segmented } from './ui/Primitives'

interface Props {
  onClose: () => void
  onSave: (msg: string) => void
  editTx?: Transaction
}

const TYPE_ACCENT: Record<TransactionType, string> = {
  income: 'text-green-500',
  expense: 'text-gray-800',
  transfer: 'text-blue-500',
}

export function TransactionModal({ onClose, onSave, editTx }: Props) {
  const { state, dispatch } = useApp()
  const [type, setType] = useState<TransactionType>(editTx?.type ?? 'expense')
  const [amount, setAmount] = useState(editTx ? String(editTx.amount) : '')
  const [categoryId, setCategoryId] = useState(editTx?.categoryId ?? '')
  const [walletId, setWalletId] = useState(editTx?.walletId ?? state.wallets[0]?.id ?? '')
  const [toWalletId, setToWalletId] = useState(editTx?.toWalletId ?? state.wallets[1]?.id ?? '')
  const [date, setDate] = useState(editTx?.date ?? new Date().toISOString().split('T')[0])
  const [note, setNote] = useState(editTx?.note ?? '')
  const [shake, setShake] = useState(0)

  const cats = state.categories.filter(c => c.type === (type === 'transfer' ? 'expense' : type))

  function handleSave(close: (after?: () => void) => void) {
    const invalid = !amount || isNaN(Number(amount)) || Number(amount) <= 0 || (type !== 'transfer' && !categoryId)
    if (invalid) { setShake(s => s + 1); return }

    const tx: Transaction = {
      id: editTx?.id ?? genId(),
      type,
      amount: Number(amount),
      categoryId: type === 'transfer' ? '' : categoryId,
      walletId,
      toWalletId: type === 'transfer' ? toWalletId : undefined,
      date,
      note,
      createdAt: editTx?.createdAt ?? new Date().toISOString(),
    }

    if (editTx) {
      dispatch({ type: 'EDIT_TRANSACTION', payload: tx })
      onSave('Transaksi diperbarui 💗')
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: tx })
      onSave('Transaksi tersimpan 💗')
    }
    close()
  }

  const selectedWallet = state.wallets.find(w => w.id === walletId)

  return (
    <Modal onClose={onClose} className="sm:max-w-md">
      {close => (
        <>
          <ModalHeader emoji="💸" title={editTx ? 'Edit Transaksi' : 'Tambah Transaksi'} subtitle="Catat sekali, Finny yang hitung ✨" onClose={() => close()} />

          <div className="space-y-4">
            <Segmented<TransactionType>
              value={type}
              onChange={t => { setType(t); setCategoryId('') }}
              options={[
                { value: 'income', label: '💰 Masuk' },
                { value: 'expense', label: '💸 Keluar' },
                { value: 'transfer', label: '🔄 Transfer' },
              ]}
            />

            {/* Amount */}
            <div key={shake} className={shake ? 'wiggle' : ''}>
              <label className="field-label">Nominal</label>
              <div className="input-wrap py-4">
                <span className="text-gray-400 font-bold text-base mr-2">Rp</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  autoFocus
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className={`flex-1 min-w-0 text-2xl font-black transition-colors ${TYPE_ACCENT[type]}`}
                />
              </div>
              <p className={`text-xs text-pink-400 mt-1.5 px-1 h-4 transition-opacity ${amount && !isNaN(Number(amount)) ? 'opacity-100' : 'opacity-0'}`}>
                {amount && !isNaN(Number(amount)) ? formatRp(Number(amount)) : ''}
              </p>
            </div>

            {/* Transfer fields */}
            {type === 'transfer' ? (
              <div key="transfer" className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 fade-in">
                <div>
                  <label className="field-label">Dari</label>
                  <select value={walletId} onChange={e => setWalletId(e.target.value)} className="input">
                    {state.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
                  </select>
                </div>
                <div className="w-8 h-8 mb-1.5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><ArrowRight size={14} /></div>
                <div>
                  <label className="field-label">Ke</label>
                  <select value={toWalletId} onChange={e => setToWalletId(e.target.value)} className="input">
                    {state.wallets.filter(w => w.id !== walletId).map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div key="category" className="fade-in space-y-3">
                <div>
                  <label className="field-label">Kategori</label>
                  <div className="flex flex-wrap gap-2">
                    {cats.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategoryId(c.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 ${categoryId === c.id ? 'border-transparent text-white shadow-md scale-105' : 'border-gray-100 text-gray-600 bg-white hover:border-pink-200'}`}
                        style={categoryId === c.id ? { backgroundColor: c.color } : undefined}
                      >
                        <span>{c.icon}</span>{c.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="field-label">Dompet</label>
                  <select value={walletId} onChange={e => setWalletId(e.target.value)} className="input">
                    {state.wallets.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
                  </select>
                  {selectedWallet && (
                    <p className="text-xs text-gray-400 mt-1.5 px-1">Saldo {selectedWallet.name}: <span className="font-semibold text-gray-500">{formatRp(selectedWallet.balance)}</span></p>
                  )}
                </div>
              </div>
            )}

            {/* Date & Note */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Tanggal</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
              </div>
              <div>
                <label className="field-label">Catatan</label>
                <input type="text" placeholder="Opsional..." value={note} onChange={e => setNote(e.target.value)} className="input" />
              </div>
            </div>

            <button onClick={() => handleSave(close)} className="btn-primary w-full py-3.5 text-base font-bold">
              {editTx ? 'Perbarui Transaksi' : 'Simpan Transaksi'} ✨
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
