import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const EXIT_MS = 200

type CloseFn = (after?: () => void) => void

interface ModalProps {
  onClose: () => void
  /** Pass a function to get `close`, which plays the exit animation before running `after` (default: onClose). */
  children: ReactNode | ((close: CloseFn) => ReactNode)
  className?: string
  zIndex?: number
}

export function Modal({ onClose, children, className = 'max-w-sm', zIndex = 100 }: ModalProps) {
  // The pending callback runs once the exit animation has played.
  const [pending, setPending] = useState<{ fn: () => void } | null>(null)
  const leaving = pending !== null

  const close = useCallback<CloseFn>(after => {
    setPending(p => p ?? { fn: after ?? onClose })
  }, [onClose])

  useEffect(() => {
    if (!pending) return
    const t = setTimeout(pending.fn, EXIT_MS)
    return () => clearTimeout(t)
  }, [pending])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [close])

  return createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4" style={{ zIndex }}>
      <div
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm ${leaving ? 'overlay-out' : 'overlay-in'}`}
        onClick={() => close()}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${className} max-h-[92vh] overflow-y-auto bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 sheet-mobile ${leaving ? 'modal-out' : 'modal-in'}`}
        style={{ boxShadow: 'var(--shadow-pop)' }}
      >
        <div className="sm:hidden mx-auto -mt-2 mb-4 h-1.5 w-10 rounded-full bg-gray-200" />
        {typeof children === 'function' ? children(close) : children}
      </div>
    </div>,
    document.body,
  )
}

export function ModalHeader({ emoji, title, subtitle, onClose }: { emoji?: string; title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        {emoji && (
          <div className="icon-tile w-11 h-11 bg-pink-50 text-xl">{emoji}</div>
        )}
        <div>
          <h2 className="font-black text-gray-800 text-lg leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <button onClick={onClose} aria-label="Tutup" className="icon-btn p-2 text-gray-400 hover:bg-gray-100 hover:rotate-90">
        <X size={18} />
      </button>
    </div>
  )
}
