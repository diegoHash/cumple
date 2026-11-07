import { useMemo } from 'react'
import { LOW } from './perf.js'

export default function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: LOW ? 9 : 14 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 12 + Math.random() * 28,
        dur: 9 + Math.random() * 12,
        delay: -Math.random() * 20,
        op: 0.12 + Math.random() * 0.28,
      })),
    []
  )
  return (
    <div className="bg-hearts" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          style={{
            left: `${h.left}%`,
            fontSize: h.size,
            animationDuration: `${h.dur}s`,
            animationDelay: `${h.delay}s`,
            opacity: h.op,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  )
}
