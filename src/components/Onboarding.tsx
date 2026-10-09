import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft } from 'lucide-react'

interface Step {
  /** Page to open before showing this step. */
  page?: string
  /** Matches a `data-tour` attribute. No target = centered card. */
  target?: string
  emoji: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    emoji: '👋',
    title: 'Selamat datang di Finny!',
    body: 'Aku akan ajak kamu keliling sebentar untuk kenalan sama semua fiturnya. Cukup pencet OK untuk lanjut ke langkah berikutnya.',
  },
  {
    page: 'wallets', target: 'wallet-add', emoji: '💳',
    title: 'Langkah 1: Siapkan dompetmu',
    body: 'Mulai dari sini. Tambahkan semua tempat kamu menyimpan uang — rekening bank, e-wallet (DANA, OVO, GoPay), atau uang cash. Isi nama, tipe, dan saldo awalnya.',
  },
  {
    page: 'wallets', target: 'wallet-total', emoji: '💰',
    title: 'Total saldo otomatis',
    body: 'Saldo semua dompet dijumlahkan di sini. Saldo tiap dompet ikut berubah sendiri setiap kamu mencatat transaksi.',
  },
  {
    target: 'add-tx', emoji: '✍️',
    title: 'Langkah 2: Catat transaksi',
    body: 'Pencet tombol ini setiap ada uang masuk atau keluar. Pilih jenisnya (Masuk / Keluar), isi nominal, pilih kategori dan dompet yang dipakai, lalu simpan.',
  },
  {
    emoji: '🔄',
    title: 'Transfer antar dompet',
    body: 'Pindah uang dari rekening ke e-wallet? Pilih tab "Transfer" saat mencatat. Saldo dompet asal berkurang dan dompet tujuan bertambah — tidak dihitung sebagai pengeluaran.',
  },
  {
    page: 'transactions', target: 'tx-filters', emoji: '🔍',
    title: 'Riwayat transaksi',
    body: 'Semua catatanmu tersimpan di halaman Transaksi. Cari pakai kata kunci, atau filter berdasarkan jenis, kategori, dan dompet.',
  },
  {
    page: 'transactions', target: 'tx-list', emoji: '✏️',
    title: 'Edit atau hapus',
    body: 'Salah catat? Di samping nominal ada ikon pensil untuk mengedit dan tempat sampah untuk menghapus (di laptop, arahkan kursor ke transaksinya dulu).',
  },
  {
    page: 'dashboard', target: 'dash-balance', emoji: '🏠',
    title: 'Dashboard',
    body: 'Ringkasan keuanganmu: total saldo, pemasukan, dan pengeluaran bulan ini dibanding bulan lalu. Pencet ikon mata untuk menyembunyikan saldo.',
  },
  {
    page: 'dashboard', target: 'month-switch', emoji: '📅',
    title: 'Lihat bulan lain',
    body: 'Pakai panah ini untuk melihat ringkasan bulan-bulan sebelumnya.',
  },
  {
    page: 'analytics', target: 'an-charts', emoji: '📊',
    title: 'Analytics',
    body: 'Lihat ke mana uangmu pergi: pengeluaran per kategori, perbandingan 6 bulan terakhir, dan tren pengeluaran harian.',
  },
  {
    page: 'budget', target: 'budget-add', emoji: '🎯',
    title: 'Budget',
    body: 'Atur batas pengeluaran per kategori tiap bulan, misalnya Makan Rp 1.500.000. Finny kasih peringatan saat sudah terpakai 80% dan saat terlampaui.',
  },
  {
    page: 'goals', target: 'goals-add', emoji: '🌱',
    title: 'Savings Goals',
    body: 'Punya impian? Buat target tabungan lengkap dengan deadline, lalu pencet "Tambah Dana" setiap kamu menabung untuk melihat progresnya.',
  },
  {
    page: 'recurring', target: 'recurring-add', emoji: '🔁',
    title: 'Transaksi rutin',
    body: 'Catat yang terjadi tiap bulan seperti gaji, bayar kos, atau langganan. Finny akan mengingatkan sebelum tanggalnya tiba.',
  },
  {
    target: 'notif', emoji: '🔔',
    title: 'Notifikasi',
    body: 'Peringatan budget, pengingat transaksi rutin, milestone goals, dan saldo menipis semuanya muncul di sini.',
  },
  {
    page: 'settings', target: 'settings-tour', emoji: '⚙️',
    title: 'Settings',
    body: 'Ganti nama & foto profil, aktifkan dark mode, atur notifikasi — dan ulangi tutorial ini kapan saja dari sini.',
  },
  {
    target: 'support', emoji: '☕',
    title: 'Dukung Finny',
    body: 'Finny gratis untuk semua. Kalau bermanfaat, kamu bisa traktir kopi pembuatnya lewat QRIS di sini (di HP ada di menu Lainnya). Berapa pun sangat berarti 💗',
  },
  {
    emoji: '🎉',
    title: 'Kamu siap!',
    body: 'Yuk mulai dengan menambahkan dompet pertamamu. Little steps, big goals 🌸',
  },
]

const PAD = 8
const GAP = 14

type Rect = { top: number; left: number; width: number; height: number }

/** First element with this data-tour value that is actually rendered (desktop and mobile variants share names). */
function findTarget(name: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return el
  }
  return null
}

interface Props {
  page: string
  onNavigate: (page: string) => void
  onFinish: () => void
}

export function Onboarding({ page, onNavigate, onFinish }: Props) {
  const [idx, setIdx] = useState(0)
  // Both are tagged with the step they belong to, so a new step starts clean without resetting state in an effect.
  const [measured, setMeasured] = useState<{ idx: number; rect: Rect } | null>(null)
  const [missingFor, setMissingFor] = useState<number | null>(null)
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })

  const step = STEPS[idx]
  const isLast = idx === STEPS.length - 1
  const rect = measured?.idx === idx ? measured.rect : null
  const missing = missingFor === idx

  useEffect(() => {
    if (step.page && step.page !== page) onNavigate(step.page)
  }, [step.page, page, onNavigate])

  // Locate the target, scroll it into view, then keep tracking it (pages animate in and can scroll).
  useEffect(() => {
    if (!step.target) return
    let raf = 0
    let scrolled = false
    let last: Rect | null = null
    const started = performance.now()

    const tick = () => {
      const el = findTarget(step.target!)
      if (el) {
        if (!scrolled) {
          scrolled = true
          const r = el.getBoundingClientRect()
          if (r.top < 80 || r.bottom > window.innerHeight - 120) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
        const r = el.getBoundingClientRect()
        const next = { top: r.top, left: r.left, width: r.width, height: r.height }
        if (!last || Math.abs(last.top - next.top) > 0.5 || Math.abs(last.left - next.left) > 0.5 || Math.abs(last.width - next.width) > 0.5 || Math.abs(last.height - next.height) > 0.5) {
          last = next
          setMeasured({ idx, rect: next })
        }
      } else if (performance.now() - started > 1500) {
        setMissingFor(idx)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [idx, step.target])

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Enter is handled by the autofocused OK button.
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') back()
      if (e.key === 'Escape') onFinish()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  function next() {
    if (isLast) onFinish()
    else setIdx(i => i + 1)
  }
  function back() {
    setIdx(i => Math.max(0, i - 1))
  }

  const centered = !step.target || missing
  const waiting = !!step.target && !rect && !missing

  // Spotlight, clipped to the viewport so very tall targets still look right.
  let spot: Rect | null = null
  if (rect && !centered) {
    const top = Math.max(8, rect.top - PAD)
    const left = Math.max(8, rect.left - PAD)
    const bottom = Math.min(vp.h - 8, rect.top + rect.height + PAD)
    const right = Math.min(vp.w - 8, rect.left + rect.width + PAD)
    spot = { top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) }
  }

  const cardW = Math.min(360, vp.w - 32)
  let cardStyle: CSSProperties = { width: cardW }
  if (spot) {
    const spaceBelow = vp.h - (spot.top + spot.height)
    const spaceAbove = spot.top
    const left = Math.min(Math.max(16, spot.left + spot.width / 2 - cardW / 2), vp.w - cardW - 16)
    if (spaceBelow >= 250) cardStyle = { ...cardStyle, left, top: spot.top + spot.height + GAP }
    else if (spaceAbove >= 250) cardStyle = { ...cardStyle, left, bottom: vp.h - spot.top + GAP }
    else cardStyle = { ...cardStyle, left: (vp.w - cardW) / 2, bottom: 16 }
  }

  return createPortal(
    <div className="fixed inset-0 z-[300]" role="dialog" aria-modal="true" aria-label="Tutorial Finny">
      {/* Click blocker */}
      <div className="absolute inset-0" />

      {spot ? (
        <div
          className="absolute rounded-[20px] pointer-events-none tour-spot"
          style={{ ...spot, boxShadow: '0 0 0 9999px rgba(17, 12, 24, 0.62)' }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(17,12,24,0.62)] backdrop-blur-[2px] overlay-in" />
      )}

      {!waiting && (
        <div className={centered ? 'absolute inset-0 flex items-center justify-center pointer-events-none' : 'contents'}>
        <div
          key={idx}
          className={`bg-white rounded-3xl p-5 tour-card pointer-events-auto ${centered ? 'relative text-center' : 'absolute'}`}
          style={{ ...(centered ? { width: cardW } : cardStyle), boxShadow: 'var(--shadow-pop)' }}
        >
          <div className={`flex items-center gap-3 mb-3 ${centered ? 'flex-col' : ''}`}>
            <div className={`${centered ? 'w-16 h-16 text-4xl float-anim' : 'w-11 h-11 text-2xl'} rounded-2xl bg-pink-50 flex items-center justify-center flex-shrink-0`}>
              {step.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">Langkah {idx + 1} dari {STEPS.length}</p>
              <h3 className="font-black text-gray-800 text-lg leading-tight">{step.title}</h3>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>

          {/* Progress */}
          <div className={`flex gap-1 mt-4 ${centered ? 'justify-center' : ''}`}>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? 'w-5 bg-pink-500' : i < idx ? 'w-1.5 bg-pink-300' : 'w-1.5 bg-gray-200'}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4">
            {!isLast && (
              <button onClick={onFinish} className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-2 py-2 transition-colors">
                Lewati
              </button>
            )}
            <div className="flex-1" />
            {idx > 0 && (
              <button onClick={back} aria-label="Kembali" className="icon-btn p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <ChevronLeft size={16} />
              </button>
            )}
            <button onClick={next} autoFocus className={`btn-primary font-bold ${isLast ? 'px-5' : 'px-7'}`}>
              {isLast ? 'Mulai pakai Finny 🎉' : idx === 0 ? 'OK, ayo mulai!' : 'OK'}
            </button>
          </div>
        </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
