import { useEffect, useRef } from 'react'
import { LOW, getDpr, heartSprite, governor } from './perf.js'

const COLORS = ['#ff4d8d', '#ff8fb8', '#ffd1e3', '#ffd166', '#ffffff', '#e0245e', '#c77dff']

export default function Confetti() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d', { alpha: true })
    const dpr = getDpr(1.5)
    let w, h
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const sprites = COLORS.map((c) => heartSprite(c, 40))
    const gov = governor()
    const k = LOW ? 0.5 : 1
    const MAX = LOW ? 110 : 220
    const rand = (a, b) => a + Math.random() * (b - a)
    const parts = []

    const burst = (n, cx, cy, power) => {
      n = Math.round(n * k * gov.q)
      for (let i = 0; i < n && parts.length < MAX; i++) {
        const a = rand(0, Math.PI * 2), s = rand(2, power)
        const ci = (Math.random() * COLORS.length) | 0
        parts.push({
          x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2,
          size: rand(10, 22), rot: rand(0, 6.28), vr: rand(-0.2, 0.2),
          ci, rect: Math.random() < 0.3, life: rand(150, 250), age: 0,
        })
      }
    }

    burst(130, w / 2, h * 0.45, 20)
    const timers = [
      setTimeout(() => burst(70, w * 0.25, h * 0.35, 15), 350),
      setTimeout(() => burst(70, w * 0.75, h * 0.35, 15), 650),
      setTimeout(() => burst(90, w / 2, h * 0.3, 17), 1100),
    ]

    let raf, last = performance.now(), rainAcc = 0
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      gov.tick(dt)
      const f = dt * 60 // normaliza a 60 fps: la velocidad no depende del dispositivo

      // lluvia suave de corazones
      rainAcc += dt
      const gap = (LOW ? 0.3 : 0.16) / gov.q
      while (rainAcc > gap) {
        rainAcc -= gap
        if (parts.length < MAX) {
          parts.push({
            x: rand(0, w), y: -20, vx: rand(-1, 1), vy: rand(1.5, 3.5),
            size: rand(12, 20), rot: rand(-0.5, 0.5), vr: rand(-0.04, 0.04),
            ci: (Math.random() * 3) | 0, rect: false, life: 300, age: 0, floaty: true,
          })
        }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.age += f
        p.vy += (p.floaty ? 0.01 : 0.28) * f
        if (!p.floaty) p.vx *= 0.985
        p.vy *= 0.995
        p.x += p.vx * f; p.y += p.vy * f; p.rot += p.vr * f
        if (p.age > p.life || p.y > h + 40) {
          parts[i] = parts[parts.length - 1]; parts.pop(); continue
        }
        const cos = Math.cos(p.rot) * dpr, sin = Math.sin(p.rot) * dpr
        ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr)
        ctx.globalAlpha = Math.min(1, (p.life - p.age) / 30)
        if (p.rect) {
          ctx.fillStyle = COLORS[p.ci]
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.drawImage(sprites[p.ci], -p.size / 2, -p.size / 2, p.size, p.size)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="confetti" />
}
