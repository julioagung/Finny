import { useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatRp, isSameMonth } from '../utils/format'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import { AnimatedRp, MonthSwitcher, PageHeader } from '../components/ui/Primitives'

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const MONTHS_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const COLORS = ['#f9a8d4','#fca5a5','#a78bfa','#6ee7b7','#93c5fd','#fbbf24','#fb923c','#34d399']

export function Analytics() {
  const { state } = useApp()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const txThis = state.transactions.filter(t => isSameMonth(t.date, month, year))
  const income = txThis.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txThis.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Expense by category pie
  const expByCat = state.categories.filter(c => c.type === 'expense').map(c => ({
    name: `${c.icon} ${c.name}`,
    value: txThis.filter(t => t.type === 'expense' && t.categoryId === c.id).reduce((s, t) => s + t.amount, 0),
    color: c.color,
  })).filter(c => c.value > 0).sort((a, b) => b.value - a.value)

  // Monthly comparison (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const m = (month - 5 + i + 12) % 12
    const y = month - 5 + i < 0 ? year - 1 : year
    const txM = state.transactions.filter(t => isSameMonth(t.date, m, y))
    return {
      month: MONTHS[m],
      income: txM.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txM.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })

  // Spending trend by day
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const trendData = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0')
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${d}`
    return {
      day: i + 1,
      amount: txThis.filter(t => t.date === dateStr && t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })
  const avgDaily = Math.round(expense / daysInMonth)
  const gridStroke = state.darkMode ? '#2a2333' : '#f3f4f6'
  const net = income - expense

  return (
    <div className="space-y-5 stagger">
      <PageHeader
        title="Analytics"
        subtitle="Lihat pola pengeluaran dan pemasukanmu."
        action={<MonthSwitcher label={`${MONTHS_FULL[month]} ${year}`} onPrev={prevMonth} onNext={nextMonth} prevIcon={<ChevronLeft size={16} />} nextIcon={<ChevronRight size={16} />} />}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Pemasukan', value: income, color: 'text-green-500', tint: 'bg-green-50', icon: <TrendingUp size={18} className="text-green-500" /> },
          { label: 'Total Pengeluaran', value: expense, color: 'text-red-400', tint: 'bg-red-50', icon: <TrendingDown size={18} className="text-red-400" /> },
          { label: 'Net Balance', value: net, color: net >= 0 ? 'text-pink-500' : 'text-red-500', tint: 'bg-pink-50', icon: <Scale size={18} className="text-pink-500" /> },
        ].map(({ label, value, color, tint, icon }) => (
          <div key={label} className="card card-hover p-5 flex items-center gap-4 group">
            <div className={`icon-tile w-12 h-12 ${tint}`}>{icon}</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-400">{label}</p>
              <p className={`text-xl font-black truncate ${color}`}><AnimatedRp value={value} /></p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-tour="an-charts">
        {/* Pie chart */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4">Pengeluaran per Kategori</h3>
          {expByCat.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2 float-anim">👀</p>
              <p className="text-sm text-gray-400">Belum ada data pengeluaran</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-[190px] h-[190px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expByCat} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={3} cornerRadius={6} dataKey="value" stroke="none" animationDuration={1000} animationEasing="ease-out">
                      {expByCat.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatRp(v)} contentStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total</span>
                  <span className="text-sm font-black text-gray-800">{formatRp(expense)}</span>
                </div>
              </div>
              <div className="flex-1 w-full space-y-2.5">
                {expByCat.slice(0, 6).map((c, i) => {
                  const pct = expense > 0 ? Math.round((c.value / expense) * 100) : 0
                  return (
                    <div key={i} className="flex items-center justify-between text-xs gap-2 p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color || COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600 font-medium truncate">{c.name}</span>
                      </span>
                      <span className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-400 tabular-nums hidden sm:inline">{formatRp(c.value)}</span>
                        <span className="font-bold text-gray-700 tabular-nums w-9 text-right">{pct}%</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Comparison */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4">Perbandingan 6 Bulan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={12} barGap={4}>
              <defs>
                <linearGradient id="anIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#a7f3d0" />
                </linearGradient>
                <linearGradient id="anExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#fbcfe8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: state.darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(236,72,153,0.06)', radius: 8 }} formatter={(v: number) => formatRp(v)} contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
              <Bar dataKey="income" name="Pemasukan" fill="url(#anIncome)" radius={[8, 8, 8, 8]} animationDuration={900} />
              <Bar dataKey="expense" name="Pengeluaran" fill="url(#anExpense)" radius={[8, 8, 8, 8]} animationDuration={900} animationBegin={150} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending Trend */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-gray-800">Trend Pengeluaran Harian</h3>
            <p className="text-xs text-gray-400">{MONTHS_FULL[month]} {year}</p>
          </div>
          <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">Rata-rata <span className="text-pink-500 font-bold">{formatRp(avgDaily)}</span>/hari</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="anTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f472b6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} interval={3} />
            <YAxis hide />
            <Tooltip formatter={(v: number) => formatRp(v)} labelFormatter={l => `Tanggal ${l}`} contentStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="amount" name="Pengeluaran" stroke="#ec4899" strokeWidth={2.5} fill="url(#anTrend)" dot={false} activeDot={{ r: 5, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }} animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
