import { useEffect, useRef } from 'react'
import { LOW, getDpr, heartSprite, governor } from './perf.js'

const COUNT = LOW ? 34 : 56
const DURATION = 1500 // ms que dura cada "salto"
const COLORS = ['#ff4d8d', '#ff8fb8', '#ffd1e3', '#ffffff', '#c77dff', '#ffd166']

// Túnel de corazones: cada cambio de `pulse` acelera, y frena suavemente.
export default function Warp({ pulse }) {
  const ref = useRef(null)
  const startRef = useRef(-1e9)

  useEffect(() => { startRef.current = performance.now() }, [pulse])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = getDpr(1.25)
    let w = 0, h = 0
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const sprites = COLORS.map((c) => heartSprite(c, 48))
    const gov = governor()
    const mk = (z) => {
      const a = Math.random() * Math.PI * 2
      const r = 0.15 + Math.random() * 1.1
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, z, s: sprites[(Math.random() * sprites.length) | 0] }
    }
    const stars = Array.from({ length: COUNT }, () => mk(Math.random()))

    let raf, last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      gov.tick(dt)
      const t = Math.min(1, (now - startRef.current) / DURATION)
      // acelera y frena con curva suave (0 → 1 → 0)
      const env = t >= 1 ? 0 : Math.pow(Math.sin(Math.PI * t), 2)
      const speed = 0.06 + env * 2.6
      const cx = w / 2, cy = h / 2, f = Math.min(w, h) * 0.275

      ctx.clearRect(0, 0, w, h)
      const maxGhost = LOW ? 5 : 8
      const ghosts = 1 + Math.round(env * (maxGhost - 1) * gov.q)
      const streak = 0.012 + env * 0.05
      const active = Math.max(12, Math.round(COUNT * gov.q))
      for (let i = 0; i < active; i++) {
        const s = stars[i]
        s.z -= speed * dt
        if (s.z <= 0.02) Object.assign(s, mk(1))
        for (let k = ghosts - 1; k >= 0; k--) {
          const z = s.z + k * streak
          if (z > 1.2) continue
          const size = Math.min(60, 7 / z)
          ctx.globalAlpha = (k === 0 ? 0.9 : 0.5 / (k + 1)) * Math.min(1, (1.2 - z) * 3) * (0.35 + 0.65 * (1 - z))
          ctx.drawImage(s.s, cx + (s.x / z) * f - size / 2, cy + (s.y / z) * f - size, size, size)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="warp" aria-hidden="true" />
}
