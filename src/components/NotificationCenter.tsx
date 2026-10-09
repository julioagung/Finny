import { useRef, useEffect } from 'react'
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { AppNotification } from '../types'

interface Props {
  open: boolean
  onToggle: () => void
  onNavigate: (page: string) => void
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return `${Math.floor(diff / 86400)} hari lalu`
}

const TYPE_BG: Record<AppNotification['type'], string> = {
  budget_warning: 'bg-yellow-50 border-yellow-100',
  budget_exceeded: 'bg-red-50 border-red-100',
  recurring_due: 'bg-blue-50 border-blue-100',
  goal_milestone: 'bg-pink-50 border-pink-100',
  goal_complete: 'bg-green-50 border-green-100',
  low_balance: 'bg-orange-50 border-orange-100',
}

export function NotificationCenter({ open, onToggle, onNavigate }: Props) {
  const { state, dispatch } = useApp()
  const ref = useRef<HTMLDivElement>(null)
  const unread = state.notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle()
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onToggle])

  function handleNotifClick(n: AppNotification) {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })
    if (n.linkTo) { onNavigate(n.linkTo); onToggle() }
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={onToggle}
        data-tour="notif"
        aria-label="Notifikasi"
        className={`relative w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-200 active:scale-90 ${open ? 'bg-pink-100' : 'bg-white/70 hover:bg-pink-50 border border-gray-100'}`}
      >
        <Bell size={18} key={unread} className={`${unread > 0 ? 'text-pink-500 wiggle' : 'text-gray-400'}`} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white pop-in">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-3xl border border-gray-100 z-[200] overflow-hidden pop-in" style={{ boxShadow: 'var(--shadow-pop)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-pink-500" />
              <span className="font-bold text-gray-800 text-sm">Notifikasi</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 bg-pink-100 text-pink-600 text-xs font-bold rounded-lg">{unread} baru</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={() => dispatch({ type: 'MARK_ALL_READ' })} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-green-500 transition-colors" title="Tandai semua dibaca">
                  <CheckCheck size={15} />
                </button>
              )}
              {state.notifications.length > 0 && (
                <button onClick={() => dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' })} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-red-400 transition-colors" title="Hapus semua">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {state.notifications.length === 0 ? (
              <div className="py-12 text-center fade-in">
                <div className="text-4xl mb-2 float-anim">🔔</div>
                <p className="text-sm font-semibold text-gray-600">Semua beres!</p>
                <p className="text-xs text-gray-400 mt-1">Tidak ada notifikasi baru.</p>
              </div>
            ) : (
              state.notifications.map((n, i) => (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
                  className={`fade-in group flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-pink-50/40' : ''}`}
                >
                  <div className={`icon-tile w-9 h-9 text-lg border ${TYPE_BG[n.type] ?? 'bg-gray-50 border-gray-100'}`}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-bold ${!n.read ? 'text-gray-800' : 'text-gray-600'}`}>{n.title}</p>
                      {!n.read && <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id }) }}
                    className="icon-btn p-1 md:opacity-0 md:group-hover:opacity-100 hover:bg-gray-200 text-gray-300 hover:text-gray-500 flex-shrink-0"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))
            )}
          </div>

          {state.notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-50 text-center">
              <p className="text-xs text-gray-400">{state.notifications.length} notifikasi total</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
