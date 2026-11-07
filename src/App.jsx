import { useCallback, useEffect, useState } from 'react'
import { messages } from './messages.js'
import Cake from './Cake.jsx'
import FloatingHearts from './FloatingHearts.jsx'
import * as sfx from './sound.js'
import Warp from './Warp.jsx'
import Roses from './Roses.jsx'
import Confetti from './Confetti.jsx'

const TAPS_TO_EXPLODE = 6

export default function App() {
  // fases: cards -> messages -> cake -> boom
  const [phase, setPhase] = useState('cards')
  const [picked, setPicked] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const [step, setStep] = useState(0)
  const [taps, setTaps] = useState(0)
  const [warp, setWarp] = useState(0)

  // Precarga y decodifica la foto final para que no haya tirones al mostrarla
  useEffect(() => {
    const img = new Image()
    img.src = `${import.meta.env.BASE_URL}foto.jpg`
    img.decode?.().catch(() => {})
  }, [])

  const pickCard = (i) => {
    if (picked !== null) return
    setPicked(i)
    sfx.flip()
    // voltea la carta, luego las cartas se van
    setTimeout(() => { setLeaving(true); sfx.whoosh() }, 1300)
    setTimeout(() => { setPhase('messages'); setWarp((w) => w + 1) }, 2100)
  }

  const next = useCallback(() => {
    sfx.pop()
    setWarp((w) => w + 1)
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
      className={`stage ${phase === 'boom' ? 'heavy' : ''}`}
      onPointerDown={sfx.unlock}
      onClick={phase === 'messages' ? next : undefined}
    >
      <MuteButton />
      <FloatingHearts />

      {phase === 'cards' && (
        <CardsScene picked={picked} leaving={leaving} onPick={pickCard} />
      )}

      {(phase === 'messages' || phase === 'cake') && <Warp pulse={warp} />}

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
  // Si existe public/foto.jpg se muestra al final; si no, la ilustración
  const [hasPhoto, setHasPhoto] = useState(false)
  // línea de tiempo con foto: texto (5s) → texto se va (1s) → solo foto + rosas
  const [textGone, setTextGone] = useState(false)
  const [showPhoto, setShowPhoto] = useState(false)
  const photo = `${import.meta.env.BASE_URL}foto.jpg`
  useEffect(() => {
    const img = new Image()
    img.onload = () => setHasPhoto(true)
    img.src = photo
  }, [photo])
  useEffect(() => {
    if (!hasPhoto) return
    const t1 = setTimeout(() => setTextGone(true), 5000)
    const t2 = setTimeout(() => setShowPhoto(true), 6200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [hasPhoto])
  return (
    <>
      {showPhoto && (
        <div className="photo-final">
          <img src={photo} alt="Feliz cumpleaños, mi Gaby" decoding="async" />
        </div>
      )}
      {showPhoto && <Roses />}
      {!showPhoto && (
        <div className={`confetti-wrap ${textGone ? 'fade' : ''}`}>
          <Confetti />
        </div>
      )}
      {!showPhoto && (
      <div className={`boom-text ${textGone ? 'gone' : ''}`}>
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
      )}
    </>
  )
}
