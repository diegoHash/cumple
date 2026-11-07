import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { messages } from './messages.js'
import Cake from './Cake.jsx'
import FloatingHearts from './FloatingHearts.jsx'
import * as sfx from './sound.js'

const TAPS_TO_EXPLODE = 6

export default function App() {
  // fases: cards -> messages -> cake -> boom
  const [phase, setPhase] = useState('cards')
  const [picked, setPicked] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const [step, setStep] = useState(0)
  const [taps, setTaps] = useState(0)

  const pickCard = (i) => {
    if (picked !== null) return
    setPicked(i)
    sfx.flip()
    // voltea la carta, luego las cartas se van
    setTimeout(() => { setLeaving(true); sfx.whoosh() }, 1300)
    setTimeout(() => setPhase('messages'), 2100)
  }

  const next = useCallback(() => {
    sfx.pop()
    setStep((s) => {
      if (s >= messages.length - 1) {
        setPhase('cake')
        return s
      }
      return s + 1
    })
  }, [])

  // En la fase de mensajes, cualquier toque en la pantalla avanza
  useEffect(() => {
    if (phase !== 'messages') return
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, next])

  return (
    <div
      className="stage"
      onPointerDown={sfx.unlock}
      onClick={phase === 'messages' ? next : undefined}
    >
      <MuteButton />
      <FloatingHearts />

      {phase === 'cards' && (
        <CardsScene picked={picked} leaving={leaving} onPick={pickCard} />
      )}

      {phase === 'messages' && <MessageScene step={step} />}

      {(phase === 'cake' || phase === 'boom') && (
        <CakeScene
          phase={phase}
          taps={taps}
          onTap={() => {
            const t = taps + 1
            sfx.tick(t)
            setTaps(t)
            if (t >= TAPS_TO_EXPLODE) setPhase('boom')
          }}
        />
      )}
    </div>
  )
}

function MuteButton() {
  const [m, setM] = useState(sfx.isMuted())
  return (
    <button
      className="mute"
      aria-label={m ? 'Activar sonido' : 'Silenciar'}
      onClick={(e) => {
        e.stopPropagation()
        sfx.setMuted(!m)
        setM(!m)
      }}
    >
      {m ? '🔇' : '🔊'}
    </button>
  )
}

/* ---------------- Cartas ---------------- */

function CardsScene({ picked, leaving, onPick }) {
  return (
    <div className={`cards-scene ${leaving ? 'leaving' : ''}`}>
      <p className={`cards-hint ${picked !== null ? 'hide' : ''}`}>
        Elige una carta ♥
      </p>
      <div className="cards">
        {[0, 1].map((i) => (
          <button
            key={i}
            className={`card-wrap card-${i} ${picked === i ? 'picked' : ''} ${
              picked !== null && picked !== i ? 'dim' : ''
            }`}
            onClick={() => onPick(i)}
            aria-label={`Carta ${i + 1}`}
          >
            <div className="card">
              <div className="card-face card-back">
                <div className="back-inner">
                  <span className="back-heart">♥</span>
                </div>
              </div>
              <div className="card-face card-front">
                <span className="corner tl">A<small>♥</small></span>
                <span className="big-heart">♥</span>
                <span className="corner br">A<small>♥</small></span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Mensajes ---------------- */

function MessageScene({ step }) {
  const m = messages[step]
  const isLast = step === messages.length - 1
  return (
    <div className="message-scene">
      <div className="msg-box" key={step}>
        <span className="msg-heart top">♥</span>
        {m.title && <h2>{m.title}</h2>}
        <p>{m.text}</p>
        <div className="msg-footer">
          <span className="dots" aria-hidden="true">
            {messages.map((_, i) => (
              <i key={i} className={i <= step ? 'on' : ''} />
            ))}
          </span>
          <button className="next-btn">
            {isLast ? 'Mi sorpresa' : 'Sigue'} ♥
          </button>
        </div>
      </div>
      <p className="tap-hint">Toca en cualquier lugar de la pantalla para continuar</p>
    </div>
  )
}

/* ---------------- Torta ---------------- */

function CakeScene({ phase, taps, onTap }) {
  const boom = phase === 'boom'
  return (
    <div className="cake-scene">
      {!boom && (
        <>
          <h1 className="hb">¡Feliz cumpleaños!</h1>
          <button
            className={`cake-btn ${taps === 0 ? '' : taps % 2 ? 'shake-1' : 'shake-2'}`}
            style={{ '--scale': 1 + taps * 0.06 }}
            onClick={onTap}
            key={taps}
            aria-label="Torta de cumpleaños"
          >
            <Cake />
          </button>
          <p className="cake-hint">
            Pulsa varias veces encima de la torta 🎂
            <span className="progress">
              <i style={{ width: `${(taps / TAPS_TO_EXPLODE) * 100}%` }} />
            </span>
          </p>
        </>
      )}
      {boom && <Boom />}
    </div>
  )
}

function Boom() {
  useEffect(() => { sfx.boom() }, [])
  // Si existe public/foto.jpg se usa como fondo; si no, se muestra la ilustración
  const [hasPhoto, setHasPhoto] = useState(false)
  useEffect(() => {
    const img = new Image()
    img.onload = () => setHasPhoto(true)
    img.src = `${import.meta.env.BASE_URL}foto.jpg`
  }, [])
  return (
    <>
      {hasPhoto && (
        <div
          className="photo-bg"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}foto.jpg)` }}
        />
      )}
      <Confetti />
      <div className="boom-text">
        <div className="flash" />
        <h1>¡Feliz cumpleaños,<br />mi reina!</h1>
        <p>Gaby, te quiero con todo mi corazón. 💖👑</p>
        {!hasPhoto && (
        <figure className="polaroid">
          <img src={`${import.meta.env.BASE_URL}gaby.svg`} alt="Para Gaby, mi reina" />
          <figcaption>Para ti, mi reina 👑</figcaption>
        </figure>
        )}
      </div>
    </>
  )
}

/* ---------------- Explosión (canvas) ---------------- */

function Confetti() {
  const ref = useRef(null)
  const colors = useMemo(
    () => ['#ff4d8d', '#ff8fb8', '#ffd1e3', '#ffd166', '#ffffff', '#e0245e', '#c77dff'],
    []
  )

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w, h
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const rand = (a, b) => a + Math.random() * (b - a)
    const parts = []
    const burst = (n, cx, cy, power) => {
      for (let i = 0; i < n; i++) {
        const a = rand(0, Math.PI * 2)
        const s = rand(2, power)
        parts.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 2,
          size: rand(8, 22),
          rot: rand(0, 6.28),
          vr: rand(-0.2, 0.2),
          color: colors[(Math.random() * colors.length) | 0],
          kind: Math.random() < 0.55 ? 'heart' : Math.random() < 0.5 ? 'rect' : 'circle',
          life: rand(160, 320),
          age: 0,
        })
      }
    }

    burst(160, w / 2, h * 0.45, 20)
    const timers = [
      setTimeout(() => burst(90, w * 0.25, h * 0.35, 15), 350),
      setTimeout(() => burst(90, w * 0.75, h * 0.35, 15), 650),
      setTimeout(() => burst(120, w / 2, h * 0.3, 17), 1100),
    ]
    // lluvia continua de corazones
    const rain = setInterval(() => {
      for (let i = 0; i < 3; i++) {
        parts.push({
          x: rand(0, w), y: -20, vx: rand(-1, 1), vy: rand(1.5, 3.5),
          size: rand(10, 20), rot: rand(-0.5, 0.5), vr: rand(-0.04, 0.04),
          color: colors[(Math.random() * 3) | 0], kind: 'heart',
          life: 400, age: 0, floaty: true,
        })
      }
    }, 120)

    const heart = (x, y, s) => {
      ctx.beginPath()
      ctx.moveTo(x, y + s * 0.3)
      ctx.bezierCurveTo(x, y - s * 0.2, x - s * 0.6, y - s * 0.2, x - s * 0.6, y + s * 0.15)
      ctx.bezierCurveTo(x - s * 0.6, y + s * 0.5, x, y + s * 0.7, x, y + s * 0.95)
      ctx.bezierCurveTo(x, y + s * 0.7, x + s * 0.6, y + s * 0.5, x + s * 0.6, y + s * 0.15)
      ctx.bezierCurveTo(x + s * 0.6, y - s * 0.2, x, y - s * 0.2, x, y + s * 0.3)
      ctx.closePath()
    }

    let raf
    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.age++
        p.vy += p.floaty ? 0.01 : 0.28
        p.vx *= p.floaty ? 1 : 0.985
        p.vy *= 0.995
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        if (p.age > p.life || p.y > h + 40) {
          parts.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.globalAlpha = Math.min(1, (p.life - p.age) / 40)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.kind === 'heart') {
          heart(0, -p.size / 2, p.size)
          ctx.fill()
        } else if (p.kind === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 3, 0, 6.28)
          ctx.fill()
        }
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(rain)
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
    }
  }, [colors])

  return <canvas ref={ref} className="confetti" />
}
