import { useState, useEffect } from 'react'
import { LogOut, RefreshCw, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { CreatorCredit } from '../components/ui/CreatorCredit'

interface Profile {
  id: string
  name: string
  created_at: string
  is_admin: boolean
}

function fetchUsers() {
  return supabase.from('profiles').select('*').order('created_at', { ascending: false })
}

export function AdminPage() {
  const { signOut, user } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  // Reference time for the "new users" stats, captured when data loads (keeps render pure).
  const [loadedAt, setLoadedAt] = useState(0)

  useEffect(() => {
    let active = true
    fetchUsers().then(({ data, error }) => {
      if (!active) return
      if (error) setError(error.message)
      else { setError(''); setUsers(data ?? []) }
      setLoadedAt(Date.now())
      setLoading(false)
    })
    return () => { active = false }
  }, [reloadKey])

  function reload() {
    setLoading(true)
    setReloadKey(k => k + 1)
  }

  const weekAgo = loadedAt - 7 * 24 * 60 * 60 * 1000
  const now = new Date(loadedAt)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const newThisWeek = users.filter(u => new Date(u.created_at).getTime() >= weekAgo).length
  const newThisMonth = users.filter(u => new Date(u.created_at).getTime() >= monthStart).length

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div className="app-bg" aria-hidden><div className="blob blob-1" /><div className="blob blob-2" /></div>
      <div className="relative max-w-3xl mx-auto stagger">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="Finny" className="w-10 h-10 rounded-2xl object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div className="min-w-0">
              <h1 className="text-xl font-black text-gray-800">Admin Panel</h1>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { window.location.hash = ''; window.location.reload() }} aria-label="Kembali ke app" className="p-2.5 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all">
              <ArrowLeft size={16} className="text-gray-400" />
            </button>
            <button onClick={reload} aria-label="Refresh" className="p-2.5 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all">
              <RefreshCw size={16} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={signOut} className="btn-outline py-2 px-3">
              <LogOut size={14} /> Keluar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total User', value: users.length, icon: '👥' },
            { label: 'Baru minggu ini', value: newThisWeek, icon: '✨' },
            { label: 'Baru bulan ini', value: newThisMonth, icon: '📅' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card card-hover p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-2xl font-black text-pink-500">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-2.5 mb-3">
            <p className="text-xs text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Users */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50">
            <p className="font-bold text-gray-800 text-sm">Users</p>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center gap-1.5">{[0, 1, 2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-sm text-gray-400">Belum ada user terdaftar.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map((u, i) => (
                <div key={u.id} className="fade-in flex items-center justify-between px-5 py-3.5 hover:bg-pink-50/40 transition-colors" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center font-bold text-white">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{u.name}</p>
                      <p className="text-xs text-gray-400">Bergabung {new Date(u.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  {u.is_admin && <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs font-bold rounded-lg">Admin</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <CreatorCredit />
        </div>
      </div>
    </div>
  )
}
