import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  onClose: () => void
}

const DURATION = 2600

export function Toast({ message, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  const dismiss = useCallback(() => { setVisible(false); setTimeout(onClose, 300) }, [onClose])

  useEffect(() => {
    const t = setTimeout(dismiss, DURATION)
    return () => clearTimeout(t)
  }, [dismiss])

  return (
    <div className="fixed z-[200] bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 flex justify-center md:block pointer-events-none">
      <div
        className={`toast-in pointer-events-auto relative overflow-hidden flex items-center gap-3 bg-white border border-pink-100 rounded-2xl pl-3 pr-2 py-2.5 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        style={{ boxShadow: 'var(--shadow-pop)' }}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={16} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-700">{message}</span>
        <button onClick={dismiss} className="icon-btn text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <X size={14} />
        </button>
        <div
          className="absolute left-0 bottom-0 h-0.5 bg-pink-400 origin-left"
          style={{ width: '100%', animation: `toastBar ${DURATION}ms linear forwards` }}
        />
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ msg: string; id: number } | null>(null)
  const showToast = useCallback((msg: string) => setToast({ msg, id: Date.now() }), [])
  const hideToast = useCallback(() => setToast(null), [])
  const ToastEl = toast ? <Toast key={toast.id} message={toast.msg} onClose={hideToast} /> : null
  return { showToast, ToastEl }
}
