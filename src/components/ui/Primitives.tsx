import type { ReactNode } from 'react'
import { formatRp } from '../../utils/format'
import { useCountUp } from '../../hooks/useCountUp'

export function AnimatedRp({ value, hidden = false, className }: { value: number; hidden?: boolean; className?: string }) {
  const n = useCountUp(value)
  return <span className={`tabular-nums ${className ?? ''}`}>{hidden ? 'Rp •••••' : formatRp(n)}</span>
}

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const n = useCountUp(value, 700)
  return <span className={`tabular-nums ${className ?? ''}`}>{n.toLocaleString('id-ID')}</span>
}

export function PageHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-2xl md:text-[28px] font-black text-gray-800 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function ProgressBar({ pct, color, height = 10 }: { pct: number; color: string; height?: number }) {
  return (
    <div className="progress-track" style={{ height }}>
      <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color }} />
    </div>
  )
}

/** Segmented control with a sliding thumb. */
export function Segmented<T extends string>({ value, onChange, options }: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode }[]
}) {
  const idx = Math.max(0, options.findIndex(o => o.value === value))
  const w = 100 / options.length
  return (
    <div className="segmented">
      <div
        className="segmented-thumb"
        style={{ left: 4, width: `calc(${w}% - ${8 / options.length + 4 * (options.length - 1) / options.length}px)`, transform: `translateX(calc(${idx * 100}% + ${idx * 4}px))` }}
      />
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className={value === o.value ? 'text-white' : 'text-gray-500 hover:text-gray-700'}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function MonthSwitcher({ label, onPrev, onNext, prevIcon, nextIcon }: { label: string; onPrev: () => void; onNext: () => void; prevIcon: ReactNode; nextIcon: ReactNode }) {
  return (
    <div className="card flex items-center gap-1 rounded-2xl px-1.5 py-1.5">
      <button onClick={onPrev} aria-label="Bulan sebelumnya" className="icon-btn p-1.5 text-gray-500 hover:bg-pink-50 hover:text-pink-500">{prevIcon}</button>
      <span key={label} className="fade-in text-sm font-bold text-gray-700 min-w-[124px] text-center">{label}</span>
      <button onClick={onNext} aria-label="Bulan berikutnya" className="icon-btn p-1.5 text-gray-500 hover:bg-pink-50 hover:text-pink-500">{nextIcon}</button>
    </div>
  )
}
