import { useEffect, useState } from 'react'
import { BIRTHDAY } from './config.js'

const target = Date.parse(BIRTHDAY)
const pad = (n) => String(n).padStart(2, '0')

// Cuenta regresiva hasta las 12:00 a. m. (hora de Venezuela)
export default function Countdown({ clock, onDone }) {
  const [left, setLeft] = useState(() => target - clock.now())

  useEffect(() => {
    let id
    const tick = () => {
      const l = target - clock.now()
      if (l <= 0) { onDone(); return }
      setLeft(l)
      id = setTimeout(tick, (l % 1000) || 1000) // sincronizado con el cambio de segundo
    }
    tick()
    return () => clearTimeout(id)
  }, [clock, onDone])

  const s = Math.max(0, Math.ceil(left / 1000))
  const days = Math.floor(s / 86400)
  const units = [
    ...(days > 0 ? [[days, 'días']] : []),
    [Math.floor((s % 86400) / 3600), 'horas'],
    [Math.floor((s % 3600) / 60), 'min'],
    [s % 60, 'seg'],
  ]

  return (
    <div className="countdown">
      <p className="cd-top">Gaby, falta muy poquito para tu primer regalo 🎁</p>
      <div className="cd-digits" role="timer" aria-live="off">
        {units.map(([v, label]) => (
          <div className="cd-unit" key={label}>
            <b>{pad(v)}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="cd-bottom">Se abrirá a las 12:00 a. m. <small>(hora de Venezuela)</small> ♥</p>
    </div>
  )
}
