import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, Loader2, Mail, Lock, User, PieChart, Target, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Segmented } from '../components/ui/Primitives'
import { CreatorCredit } from '../components/ui/CreatorCredit'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

const FEATURES = [
  { icon: PieChart, title: 'Analytics otomatis', desc: 'Lihat ke mana uangmu pergi tiap bulan.' },
  { icon: Target, title: 'Budget & Goals', desc: 'Atur limit dan wujudkan target tabungan.' },
  { icon: Wallet, title: 'Semua dompet', desc: 'Bank, e-wallet, cash — dalam satu tempat.' },
]

export function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function switchMode(m: 'login' | 'register') {
    setMode(m); setError(''); setSuccess('')
  }

  async function handleGoogle() {
    setError(''); setSuccess('')
    setGoogleLoading(true)
    const err = await signInWithGoogle()
    // On success the browser navigates to Google, so only the error path returns here.
    if (err) { setError(err); setGoogleLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!email || !password) { setError('Email dan password wajib diisi.'); return }
    if (mode === 'register' && !name) { setError('Nama wajib diisi.'); return }

    setLoading(true)
    let err: string | null = null

    if (mode === 'login') {
      err = await signIn(email, password)
    } else {
      err = await signUp(email, password, name)
      if (!err) setSuccess('Akun berhasil dibuat! Silakan cek email untuk verifikasi, lalu login.')
    }

    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background */}
      <div className="app-bg" aria-hidden>
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
        <span className="absolute top-10 left-10 text-4xl opacity-20 float-anim">💗</span>
        <span className="absolute top-32 right-20 text-3xl opacity-20 float-anim" style={{ animationDelay: '1s' }}>✦</span>
        <span className="absolute bottom-20 left-16 text-3xl opacity-20 float-anim" style={{ animationDelay: '2s' }}>🌸</span>
        <span className="absolute bottom-32 right-10 text-4xl opacity-20 float-anim" style={{ animationDelay: '0.5s' }}>⭐</span>
      </div>

      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 gap-6 items-center">
        {/* Brand panel (desktop) */}
        <div className="hidden lg:block hero-card p-10 min-h-[540px] stagger">
          <span className="sheen" />
          <img src="/logo.png" alt="Finny" className="w-16 h-16 rounded-3xl object-cover shadow-lg ring-4 ring-white/30"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <h1 className="text-4xl font-black mt-8 leading-tight">Catat sekali,<br />Finny yang hitung semuanya ✨</h1>
          <p className="text-pink-50/90 mt-3 text-sm">Personal finance yang ringan, cute, dan bikin kamu rajin nyatat. Gratis untuk semua 💗</p>
          <div className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-white/15 rounded-2xl p-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center flex-shrink-0"><Icon size={18} /></div>
                <div>
                  <p className="font-bold text-sm">{title}</p>
                  <p className="text-xs text-pink-50/85">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="w-full max-w-sm mx-auto stagger">
          <div className="text-center mb-7 lg:hidden">
            <img src="/logo.png" alt="Finny" className="w-20 h-20 mx-auto mb-3 rounded-3xl object-cover shadow-lg float-anim"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <h1 className="text-3xl font-black text-gray-800">Finny</h1>
            <p className="text-gray-400 text-sm mt-1">Catat sekali, Finny yang hitung semuanya ✨</p>
          </div>

          <div className="card p-6 !rounded-[2rem]" style={{ boxShadow: 'var(--shadow-pop)' }}>
            <div className="mb-5">
              <h2 key={mode} className="text-xl font-black text-gray-800 fade-in">{mode === 'login' ? 'Welcome back 👋' : 'Buat akun baru 🌸'}</h2>
              <p className="text-xs text-gray-400 mt-1">{mode === 'login' ? 'Masuk untuk lanjut mencatat keuanganmu.' : 'Gratis, cuma butuh semenit ✨'}</p>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-gray-100 bg-white text-sm font-bold text-gray-700 hover:border-pink-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 transition-all mb-4"
            >
              {googleLoading ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <GoogleIcon />}
              Lanjut dengan Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">atau pakai email</span>
              <span className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="mb-5">
              <Segmented<'login' | 'register'>
                value={mode}
                onChange={switchMode}
                options={[{ value: 'login', label: 'Masuk' }, { value: 'register', label: 'Daftar' }]}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className={`grid transition-all duration-500 ${mode === 'register' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} style={{ transitionTimingFunction: 'var(--ease-out)' }}>
                <div className="overflow-hidden">
                  <label className="field-label">Nama</label>
                  <div className="input-wrap py-2.5 gap-2 mb-0.5">
                    <User size={16} className="text-gray-400" />
                    <input type="text" placeholder="Nama kamu" value={name} onChange={e => setName(e.target.value)} tabIndex={mode === 'register' ? 0 : -1} className="flex-1 min-w-0 text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="field-label">Email</label>
                <div className="input-wrap py-2.5 gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <input type="email" placeholder="email@kamu.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 min-w-0 text-sm" />
                </div>
              </div>

              <div>
                <label className="field-label">Password</label>
                <div className="input-wrap py-2.5 gap-2">
                  <Lock size={16} className="text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="flex-1 min-w-0 text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} aria-label="Tampilkan password" className="text-gray-400 hover:text-pink-500 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div key={error} className="bg-red-50 border border-red-100 rounded-2xl px-4 py-2.5 wiggle">
                  <p className="text-xs text-red-500 font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-2.5 fade-in">
                  <p className="text-xs text-green-600 font-medium">{success}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-bold !mt-5 group">
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Masuk ke Finny' : 'Buat Akun'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} className="text-pink-500 font-semibold hover:underline">
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
            </button>
          </p>
          <div className="text-center mt-4">
            <CreatorCredit />
          </div>
        </div>
      </div>
    </div>
  )
}
