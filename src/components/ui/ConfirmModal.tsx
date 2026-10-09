import { Modal } from './Modal'

interface ConfirmModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  emoji?: string
}

export function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Hapus', emoji = '🗑️' }: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel} className="sm:max-w-[340px]" zIndex={150}>
      {close => (
        <>
          <div className="text-center mb-5">
            <div className="w-16 h-16 mx-auto mb-3 rounded-3xl bg-red-50 flex items-center justify-center text-3xl wiggle">{emoji}</div>
            <h3 className="font-black text-gray-800 text-lg">{title}</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{message}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => close()} className="btn-outline flex-1">
              Batal
            </button>
            <button
              onClick={() => close(onConfirm)}
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-200/50 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              {confirmLabel}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
