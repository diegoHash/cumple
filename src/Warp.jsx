import { useEffect, useRef } from 'react'

const COUNT = 70
const DURATION = 1500 // ms que dura cada "salto"

// Túnel de corazones: cada cambio de `pulse` acelera, y frena suavemente.
export default function Warp({ pulse }) {
  const ref = useRef(null)
  const startRef = useRef(-1e9)

  useEffect(() => { startRef.current = performance.now() }, [pulse])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#ff4d8d', '#ff8fb8', '#ffd1e3', '#ffffff', '#c77dff', '#ffd166']
    const mk = (z) => {
      const a = Math.random() * Math.PI * 2
      const r = 0.15 + Math.random() * 1.1
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, z, c: colors[(Math.random() * colors.length) | 0] }
    }
    const stars = Array.from({ length: COUNT }, () => mk(Math.random()))

    const heart = (s) => {
      ctx.beginPath()
      ctx.moveTo(0, s * 0.3)
      ctx.bezierCurveTo(0, -s * 0.2, -s * 0.6, -s * 0.2, -s * 0.6, s * 0.15)
      ctx.bezierCurveTo(-s * 0.6, s * 0.5, 0, s * 0.7, 0, s * 0.95)
      ctx.bezierCurveTo(0, s * 0.7, s * 0.6, s * 0.5, s * 0.6, s * 0.15)
      ctx.bezierCurveTo(s * 0.6, -s * 0.2, 0, -s * 0.2, 0, s * 0.3)
      ctx.closePath()
    }

    let raf, last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const t = Math.min(1, (now - startRef.current) / DURATION)
      // acelera y frena con curva suave (0 → 1 → 0)
      const env = t >= 1 ? 0 : Math.pow(Math.sin(Math.PI * t), 2)
      const speed = 0.06 + env * 2.6
      const cx = w / 2, cy = h / 2, f = Math.min(w, h) * 0.55

      // el fondo "arrastra" más cuando va rápido => desenfoque de movimiento
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, w, h)

      const ghosts = 1 + Math.round(env * 9)
      const streak = 0.012 + env * 0.05
      for (const s of stars) {
        s.z -= speed * dt
        if (s.z <= 0.02) Object.assign(s, mk(1))
        for (let k = ghosts - 1; k >= 0; k--) {
          const z = s.z + k * streak
          if (z > 1.2) continue
          const px = cx + (s.x / z) * f * 0.5
          const py = cy + (s.y / z) * f * 0.5
          const size = Math.min(60, 7 / z)
          ctx.save()
          ctx.translate(px, py - size / 2)
          ctx.rotate(Math.atan2(py - cy, px - cx) * 0.0)
          ctx.fillStyle = s.c
          ctx.globalAlpha = (k === 0 ? 0.9 : 0.5 / (k + 1)) * Math.min(1, (1.2 - z) * 3) * (0.35 + 0.65 * (1 - z))
          heart(size)
          ctx.fill()
          ctx.restore()
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="warp" aria-hidden="true" />
}
