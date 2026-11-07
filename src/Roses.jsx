import { useEffect, useRef } from 'react'
import { LOW, getDpr, emojiSprite, governor } from './perf.js'

// Rosas que caen poco a poco sobre la foto final
export default function Roses() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = getDpr(1.5)
    let w = 0, h = 0
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const sprites = ['🌹', '🌹', '🌹', '🌸', '🌷'].map((g) => emojiSprite(g, 64))
    const gov = governor()
    const MAX = LOW ? 22 : 40
    const rand = (a, b) => a + Math.random() * (b - a)
    const roses = []
    const start = performance.now()
    let nextSpawn = 0, raf, last = start

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      gov.tick(dt)
      const elapsed = (now - start) / 1000
      const gap = Math.max(LOW ? 0.5 : 0.28, 1.1 - elapsed * 0.05) / gov.q
      if (elapsed >= nextSpawn && roses.length < MAX * gov.q + 4) {
        nextSpawn = elapsed + gap * rand(0.7, 1.3)
        roses.push({
          x: rand(0, w), y: -40, size: rand(22, 40), vy: rand(35, 80),
          sway: rand(10, 30), freq: rand(0.6, 1.4), phase: rand(0, 6.28),
          rot: rand(0, 6.28), vr: rand(-0.8, 0.8), s: sprites[(Math.random() * sprites.length) | 0],
        })
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = roses.length - 1; i >= 0; i--) {
        const r = roses[i]
        r.y += r.vy * dt
        r.rot += r.vr * dt
        if (r.y > h + 50) { roses[i] = roses[roses.length - 1]; roses.pop(); continue }
        const x = r.x + Math.sin(elapsed * r.freq + r.phase) * r.sway
        const cos = Math.cos(r.rot) * dpr, sin = Math.sin(r.rot) * dpr
        ctx.setTransform(cos, sin, -sin, cos, x * dpr, r.y * dpr)
        ctx.drawImage(r.s, -r.size / 2, -r.size / 2, r.size, r.size)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="roses" aria-hidden="true" />
}
