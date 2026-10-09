export function formatRp(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function getMonthYear(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function isSameMonth(dateStr: string, month: number, year: number): boolean {
  const d = new Date(dateStr)
  return d.getMonth() === month && d.getFullYear() === year
}

export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
