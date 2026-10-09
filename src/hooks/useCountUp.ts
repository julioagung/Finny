import { useEffect, useRef, useState } from 'react'

/** Eases a number from its previous value to `value` (starts from 0 on mount). */
export function useCountUp(value: number, duration = 900) {
  const [display, setDisplay] = useState(0)
  const current = useRef(0)

  useEffect(() => {
    const from = current.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const total = reduce ? 0 : duration
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = total === 0 ? 1 : Math.min(1, (now - start) / total)
      const eased = 1 - Math.pow(1 - t, 3)
      current.current = from + (value - from) * eased
      setDisplay(current.current)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return Math.round(display)
}
