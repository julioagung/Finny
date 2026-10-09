import { useState, type ReactNode } from 'react'
import { TrendingUp, TrendingDown, Eye, EyeOff, ArrowRight, ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatRp, isSameMonth } from '../utils/format'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AnimatedRp, MonthSwitcher, ProgressBar } from '../components/ui/Primitives'

interface Props { onAddTransaction: () => void; onNavigate: (p: string) => void }

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 19) return 'Selamat sore'
  return 'Selamat malam'
}

export function Dashboard({ onAddTransaction, onNavigate }: Props) {
  const { state } = useApp()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [hideBalance, setHideBalance] = useState(false)

  const txThisMonth = state.transactions.filter(t => isSameMonth(t.date, month, year))
  const txLastMonth = state.transactions.filter(t => {
    const lm = month === 0 ? 11 : month - 1
    const ly = month === 0 ? year - 1 : year
    return isSameMonth(t.date, lm, ly)
  })

  const income = txThisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txThisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const lastIncome = txLastMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const lastExpense = txLastMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalBalance = state.wallets.reduce((s, w) => s + w.balance, 0)

  const incomePct = lastIncome ? Math.round(((income - lastIncome) / lastIncome) * 100) : 0
  const expensePct = lastExpense ? Math.round(((expense - lastExpense) / lastExpense) * 100) : 0
  const savingRate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  // Chart data — last 7 days of selected month
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(year, month, i + 1)
    const ds = d.toISOString().split('T')[0]
    const dayTx = state.transactions.filter(t => t.date === ds)
    return {
      day: i + 1,
      income: dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })

  // Expense by category
  const catExpense = state.categories.filter(c => c.type === 'expense').map(c => ({
    ...c,
    total: txThisMonth.filter(t => t.type === 'expense' && t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 5)

  const recentTx = [...state.transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  function getCat(id: string) { return state.categories.find(c => c.id === id) }
  function getWallet(id: string) { return state.wallets.find(w => w.id === id) }

  const mask = (n: number) => hideBalance ? 'Rp •••••' : formatRp(n)

  return (
    <div className="space-y-5 stagger">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-semibold text-pink-400">{greeting()} ✨</p>
          <h1 className="text-2xl md:text-[28px] font-black text-gray-800 leading-tight">Hi, {state.userName} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Let's keep your money organized.</p>
        </div>
        <div data-tour="month-switch"><MonthSwitcher label={`${MONTHS[month]} ${year}`} onPrev={prevMonth} onNext={nextMonth} prevIcon={<ChevronLeft size={16} />} nextIcon={<ChevronRight size={16} />} /></div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr_1fr] gap-4">
        {/* Total Balance */}
        <div className="hero-card p-6 flex flex-col justify-between min-h-[180px]" data-tour="dash-balance">
          <span className="sheen" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-pink-50/90 flex items-center gap-1.5"><Sparkles size={14} /> Total Saldo</span>
            <button onClick={() => setHideBalance(b => !b)} aria-label="Sembunyikan saldo" className="p-2 bg-white/20 rounded-xl hover:bg-white/30 active:scale-90 transition-all">
              {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div>
            <div className="text-3xl md:text-[34px] font-black tracking-tight my-2">
              <AnimatedRp value={totalBalance} hidden={hideBalance} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-pink-50/80">{state.wallets.length} dompet aktif ✦</span>
              <button onClick={onAddTransaction} className="flex items-center gap-1 text-xs font-bold bg-white text-pink-500 px-3 py-1.5 rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-sm">
                <Plus size={13} /> Catat
              </button>
            </div>
          </div>
        </div>

        {/* Income */}
        <StatCard
          label="Pemasukan"
          value={income}
          hidden={hideBalance}
          icon={<TrendingUp size={18} className="text-green-500" />}
          tint="bg-green-50"
          delta={incomePct}
          good={incomePct >= 0}
        />

        {/* Expense */}
        <StatCard
          label="Pengeluaran"
          value={expense}
          hidden={hideBalance}
          icon={<TrendingDown size={18} className="text-red-400" />}
          tint="bg-red-50"
          delta={expensePct}
          good={expensePct <= 0}
        />
      </div>

      {/* Chart + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar Chart */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
            <div>
              <h3 className="font-bold text-gray-800">Ringkasan Keuangan</h3>
              <p className="text-xs text-gray-400">7 hari pertama {MONTHS[month]}</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-pink-400 to-pink-300 inline-block" />Pemasukan</span>
              <span className="flex items-center gap-1.5 text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-violet-300 to-violet-200 inline-block" />Pengeluaran</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={chartData} barSize={12} barGap={4}>
              <defs>
                <linearGradient id="dashIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f9a8d4" />
                </linearGradient>
                <linearGradient id="dashExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#ddd6fe" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={state.darkMode ? '#2a2333' : '#f3f4f6'} vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: state.darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(236,72,153,0.06)', radius: 8 }}
                formatter={(v: number) => formatRp(v)}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="income" name="Pemasukan" fill="url(#dashIncome)" radius={[8, 8, 8, 8]} animationDuration={900} animationEasing="ease-out" />
              <Bar dataKey="expense" name="Pengeluaran" fill="url(#dashExpense)" radius={[8, 8, 8, 8]} animationDuration={900} animationBegin={150} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Top Pengeluaran</h3>
            <span className="text-[11px] font-semibold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-lg">Top {catExpense.length}</span>
          </div>
          {catExpense.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2 float-anim">👀</p>
              <p className="text-sm text-gray-400">Belum ada data</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {catExpense.map(c => (
                <div key={c.id} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                      <span className="icon-tile w-7 h-7 rounded-xl text-sm" style={{ backgroundColor: c.color + '22' }}>{c.icon}</span>{c.name}
                    </span>
                    <span className="text-xs font-bold text-gray-700 tabular-nums">{Math.round((c.total / expense) * 100)}%</span>
                  </div>
                  <ProgressBar pct={(c.total / expense) * 100} color={c.color} height={6} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Transaksi Terbaru</h3>
            <button onClick={() => onNavigate('transactions')} className="text-xs text-pink-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Lihat Semua <ArrowRight size={12} />
            </button>
          </div>
          {recentTx.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2 float-anim">👀</p>
              <p className="text-sm text-gray-400">Nothing here yet</p>
              <button onClick={onAddTransaction} className="btn-soft mt-3">+ Tambah Transaksi</button>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTx.map((tx, i) => {
                const cat = getCat(tx.categoryId)
                const wallet = getWallet(tx.walletId)
                const toWallet = tx.toWalletId ? getWallet(tx.toWalletId) : null
                return (
                  <div key={tx.id} className="group fade-in flex items-center gap-3 p-2.5 -mx-1 hover:bg-gray-50 rounded-2xl transition-colors" style={{ animationDelay: `${0.25 + i * 0.05}s` }}>
                    <div className="icon-tile w-11 h-11 text-lg" style={{ backgroundColor: tx.type === 'transfer' ? '#dbeafe' : (cat?.color ?? '#e5e7eb') + '22' }}>
                      {tx.type === 'transfer' ? '🔄' : cat?.icon ?? '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{tx.note || cat?.name || 'Transfer'}</p>
                      <p className="text-xs text-gray-400 truncate">{tx.type === 'transfer' ? `${wallet?.name} → ${toWallet?.name}` : wallet?.name}</p>
                    </div>
                    <div className={`text-sm font-bold tabular-nums ${tx.type === 'income' ? 'text-green-500' : tx.type === 'expense' ? 'text-red-400' : 'text-blue-400'}`}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatRp(tx.amount)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Summary + Wallets */}
        <div className="space-y-4">
          {/* Monthly Summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Ringkasan {MONTHS[month]}</h3>
              <span className="text-[11px] font-semibold text-gray-400">Saving rate <span className="text-pink-500 font-bold">{savingRate}%</span></span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Masuk', value: income, color: 'text-green-500', bg: 'bg-green-50' },
                { label: 'Keluar', value: expense, color: 'text-red-400', bg: 'bg-red-50' },
                { label: 'Tabungan', value: income - expense, color: 'text-pink-500', bg: 'bg-pink-50' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-2xl p-3`}>
                  <p className="text-[11px] text-gray-500 font-medium">{label}</p>
                  <p className={`text-sm font-black truncate ${color}`}>{mask(value)}</p>
                </div>
              ))}
            </div>
            <ProgressBar pct={savingRate} color="#ec4899" height={8} />
            {catExpense[0] && (
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-50 gap-2">
                <span className="text-xs text-gray-400">Top spending</span>
                <span className="text-xs font-semibold text-gray-600 truncate">{catExpense[0].icon} {catExpense[0].name} — {formatRp(catExpense[0].total)}</span>
              </div>
            )}
          </div>

          {/* Quick Wallets */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">Dompet</h3>
              <button onClick={() => onNavigate('wallets')} className="text-xs text-pink-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Lihat <ArrowRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {state.wallets.slice(0, 4).map(w => (
                <div key={w.id} className="group flex items-center gap-2.5 p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-pink-100 hover:bg-pink-50/50 transition-all">
                  <span className="icon-tile w-9 h-9 rounded-xl bg-white text-lg shadow-sm">{w.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-600 truncate">{w.name}</p>
                    <p className="text-xs font-bold text-gray-800 truncate tabular-nums">{mask(w.balance)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Doodle decoration */}
      <div className="text-center py-2 text-gray-300 text-xs select-none">
        ♡ ✦ ₍ᐢ. .ᐢ₎ ₊˚⊹ Your money, your way. — Finny 💗
      </div>
    </div>
  )
}

function StatCard({ label, value, hidden, icon, tint, delta, good }: {
  label: string; value: number; hidden: boolean; icon: ReactNode; tint: string; delta: number; good: boolean
}) {
  return (
    <div className="card card-hover p-5 flex flex-col justify-between group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`icon-tile w-10 h-10 ${tint}`}>{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-black text-gray-800"><AnimatedRp value={value} hidden={hidden} /></div>
        <div className={`inline-flex items-center gap-1 mt-2 text-[11px] font-bold px-2 py-1 rounded-lg ${good ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
          {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta >= 0 ? '+' : ''}{delta}% <span className="font-medium opacity-70">dari bulan lalu</span>
        </div>
      </div>
    </div>
  )
}
