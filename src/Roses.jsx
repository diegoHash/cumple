import { useEffect, useRef } from 'react'

// Rosas que caen poco a poco sobre la foto final
export default function Roses() {
  const ref = useRef(null)

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

    const rand = (a, b) => a + Math.random() * (b - a)
    const glyphs = ['🌹', '🌹', '🌹', '🌸', '🌷']
    const roses = []
    const start = performance.now()
    let nextSpawn = 0

    let raf, last = start
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const elapsed = (now - start) / 1000
      // al inicio caen pocas y poco a poco van siendo más
      const gap = Math.max(0.22, 1.1 - elapsed * 0.05)
      if (elapsed >= nextSpawn && roses.length < 70) {
        nextSpawn = elapsed + gap * rand(0.7, 1.3)
        roses.push({
          x: rand(0, w), y: -40, size: rand(20, 40),
          vy: rand(35, 80), sway: rand(10, 30), freq: rand(0.6, 1.4), phase: rand(0, 6.28),
          rot: rand(0, 6.28), vr: rand(-0.8, 0.8), g: glyphs[(Math.random() * glyphs.length) | 0],
        })
      }
      ctx.clearRect(0, 0, w, h)
      for (let i = roses.length - 1; i >= 0; i--) {
        const r = roses[i]
        r.y += r.vy * dt
        r.rot += r.vr * dt
        if (r.y > h + 50) { roses.splice(i, 1); continue }
        ctx.save()
        ctx.translate(r.x + Math.sin(elapsed * r.freq + r.phase) * r.sway, r.y)
        ctx.rotate(r.rot)
        ctx.font = `${r.size}px serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(r.g, 0, 0)
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} className="roses" aria-hidden="true" />
}
