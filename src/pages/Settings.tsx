import { useState, useRef, useCallback, type ReactNode } from 'react'
import { Moon, Sun, User, Trash2, Download, Bell, Camera, X, LogOut, GraduationCap, PlayCircle, Coffee } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { AnimatedNumber, PageHeader } from '../components/ui/Primitives'
import { CreatorCredit } from '../components/ui/CreatorCredit'

interface Props { onToast: (m: string) => void; onSignOut?: () => void; onStartTour?: () => void; onSupport?: () => void }

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`relative w-12 h-7 rounded-full flex-shrink-0 transition-colors duration-300 ${on ? 'bg-gradient-to-r from-pink-500 to-pink-400' : 'bg-gray-200'}`}
    >
      <span
        className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
        style={{ transform: `translateX(${on ? 20 : 0}px)`, transition: 'transform 0.4s var(--ease-spring)' }}
      />
    </button>
  )
}

function SectionTitle({ icon, title, tint = 'bg-pink-50 text-pink-500' }: { icon: ReactNode; title: string; tint?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${tint}`}>{icon}</div>
      <h2 className="font-bold text-gray-800">{title}</h2>
    </div>
  )
}

export function Settings({ onToast, onSignOut, onStartTour, onSupport }: Props) {
  const { state, dispatch } = useApp()
  const [nameInput, setNameInput] = useState(state.userName)
  const [showReset, setShowReset] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      onToast('Ukuran foto maksimal 5MB 🥺')
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      dispatch({ type: 'SET_PROFILE_PHOTO', payload: result })
      onToast('Foto profil diperbarui 💗')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [dispatch, onToast])

  return (
    <div className="space-y-4 stagger max-w-2xl">
      <PageHeader title="Settings" subtitle="Atur preferensimu di sini." />

      {/* Profile */}
      <div className="card p-5">
        <SectionTitle icon={<User size={17} />} title="Profil" />

        {/* Photo */}
        <div className="flex items-center gap-5 mb-5">
          <div className="relative flex-shrink-0 group">
            {state.profilePhoto ? (
              <img
                src={state.profilePhoto}
                alt="profil"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-pink-100 transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center text-3xl font-black text-white ring-4 ring-pink-100 transition-transform duration-300 group-hover:scale-105">
                {state.userName.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Ganti foto"
              className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-white transition-all hover:scale-110 active:scale-90"
            >
              <Camera size={14} className="text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-800 truncate">{state.userName}</p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG maksimal 5MB</p>
            <div className="flex gap-2 mt-2.5">
              <button onClick={() => fileInputRef.current?.click()} className="btn-soft">
                {state.profilePhoto ? 'Ganti Foto' : 'Upload Foto'}
              </button>
              {state.profilePhoto && (
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_PROFILE_PHOTO', payload: null })
                    onToast('Foto dihapus')
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <X size={11} /> Hapus
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        {/* Name */}
        <div>
          <label className="field-label">Nama</label>
          <div className="flex gap-3">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="input flex-1"
              placeholder="Nama kamu"
            />
            <button
              onClick={() => { dispatch({ type: 'SET_USER_NAME', payload: nameInput }); onToast('Nama diperbarui 💗') }}
              disabled={nameInput === state.userName || !nameInput.trim()}
              className="btn-primary"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-5">
        <SectionTitle icon={state.darkMode ? <Moon size={17} /> : <Sun size={17} />} title="Tampilan" tint="bg-indigo-50 text-indigo-500" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">Dark Mode</p>
            <p className="text-xs text-gray-400">Tampilan gelap yang tetap cute</p>
          </div>
          <Toggle on={state.darkMode} onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })} label="Dark mode" />
        </div>
      </div>

      {/* Tutorial */}
      {onStartTour && (
        <div className="card p-5" data-tour="settings-tour">
          <SectionTitle icon={<GraduationCap size={17} />} title="Tutorial" tint="bg-emerald-50 text-emerald-500" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Panduan penggunaan</p>
              <p className="text-xs text-gray-400">Lihat lagi tur singkat semua fitur Finny</p>
            </div>
            <button onClick={onStartTour} className="btn-soft py-2 flex-shrink-0">
              <PlayCircle size={14} /> Mulai Tutorial
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="card p-5">
        <SectionTitle icon={<Bell size={17} />} title="Notifikasi" tint="bg-amber-50 text-amber-500" />
        {([
          { key: 'budgetWarning' as const, label: 'Budget warning', desc: 'Ingatkan saat budget 80% atau terlampaui' },
          { key: 'recurringReminder' as const, label: 'Recurring reminder', desc: 'Ingatkan H-2 sebelum transaksi rutin' },
          { key: 'goalsMilestone' as const, label: 'Goals milestone', desc: 'Ingatkan saat goal mencapai 25%, 50%, 75%, 100%' },
          { key: 'lowBalance' as const, label: 'Low balance alert', desc: 'Ingatkan saat saldo dompet di bawah Rp 50.000' },
        ]).map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-semibold text-gray-700">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <Toggle
              on={state.notificationSettings[key]}
              onClick={() => dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: { [key]: !state.notificationSettings[key] } })}
              label={label}
            />
          </div>
        ))}
      </div>

      {/* Data */}
      <div className="card p-5">
        <SectionTitle icon={<Download size={17} />} title="Data" tint="bg-sky-50 text-sky-500" />
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onToast('Export CSV sedang diproses... 💗')} className="btn-outline py-3">
            📄 Export CSV
          </button>
          <button onClick={() => onToast('Export PDF sedang diproses... 💗')} className="btn-outline py-3">
            📑 Export PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="hero-card p-5">
        <span className="sheen" />
        <h2 className="font-bold text-white mb-3">Statistik Akun 💗</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[
            { label: 'Total Transaksi', value: state.transactions.length },
            { label: 'Total Wallet', value: state.wallets.length },
            { label: 'Goals Aktif', value: state.savingsGoals.length },
            { label: 'Budget Aktif', value: state.budgets.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/20 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black text-white"><AnimatedNumber value={value} /></p>
              <p className="text-[11px] text-pink-50/90 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About & support */}
      <div className="card p-5">
        <SectionTitle icon={<Coffee size={17} />} title="Tentang Finny" tint="bg-amber-50 text-amber-500" />
        <p className="text-sm text-gray-500 leading-relaxed">
          Finny gratis untuk semua. Kalau Finny bermanfaat buat kamu, dukung pembuatnya supaya Finny terus berkembang 💗
        </p>
        {onSupport && (
          <button onClick={onSupport} className="btn-primary w-full mt-4">
            <Coffee size={16} /> Dukung via QRIS
          </button>
        )}
        <div className="text-center mt-4">
          <CreatorCredit />
        </div>
      </div>

      {/* Logout */}
      {onSignOut && (
        <button onClick={onSignOut} className="card w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-pink-500 active:scale-[0.98]">
          <LogOut size={16} /> Keluar dari Finny
        </button>
      )}

      {/* Danger */}
      <div className="card p-5 !border-red-100">
        <SectionTitle icon={<Trash2 size={17} />} title="Danger Zone" tint="bg-red-50 text-red-400" />
        <p className="text-xs text-gray-400 mb-3">Hati-hati ya, tindakan ini tidak bisa dibatalkan 🥺</p>
        <button onClick={() => setShowReset(true)} className="px-4 py-2.5 border-2 border-red-200 text-red-400 rounded-2xl text-sm font-semibold hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all">
          Reset Semua Data
        </button>
      </div>

      {showReset && (
        <ConfirmModal
          title="Reset Semua Data?"
          message="Semua transaksi, wallet, budget, dan goals akan dihapus. Tindakan ini tidak bisa dibatalkan 🥺"
          emoji="⚠️"
          confirmLabel="Reset"
          onConfirm={() => {
            dispatch({ type: 'RESET_DATA' })
            onToast('Data berhasil direset 🌸')
            setShowReset(false)
          }}
          onCancel={() => setShowReset(false)}
        />
      )}
    </div>
  )
}
