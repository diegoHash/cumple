// Efectos de sonido sintetizados con Web Audio (sin archivos externos).
let ctx = null
let master = null
let noiseBuf = null
let muted = false
try { muted = localStorage.getItem('muted') === '1' } catch { /* sin storage */ }

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 0.8
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export const isMuted = () => muted
export function setMuted(m) {
  muted = m
  try { localStorage.setItem('muted', m ? '1' : '0') } catch { /* sin storage */ }
  if (master) master.gain.value = m ? 0 : 0.8
}
// llamar en el primer toque para desbloquear el audio en móviles
export const unlock = () => { ac() }

function tone({ freq, to, dur = 0.2, type = 'sine', vol = 0.3, at = 0, attack = 0.01 }) {
  const c = ac(); if (!c) return
  const t = c.currentTime + at
  const o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t); o.stop(t + dur + 0.05)
}

function noise({ dur = 0.4, vol = 0.3, at = 0, from = 4000, to = 300, q = 1 }) {
  const c = ac(); if (!c) return
  const t = c.currentTime + at
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = c.createBufferSource(); s.buffer = noiseBuf
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q
  f.frequency.setValueAtTime(from, t)
  f.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f).connect(g).connect(master)
  s.start(t, Math.random() * 0.8)
}

// Carta que se voltea
export function flip() {
  noise({ dur: 0.18, vol: 0.25, from: 6000, to: 1500, q: 0.8 })
  tone({ freq: 700, to: 1300, dur: 0.15, type: 'triangle', vol: 0.12, at: 0.05 })
  ;[784, 988, 1175, 1568].forEach((f, i) =>
    tone({ freq: f, dur: 0.5, vol: 0.12, at: 0.25 + i * 0.07 }))
}

// Cartas que se van volando
export function whoosh() {
  noise({ dur: 0.7, vol: 0.35, from: 400, to: 5000, q: 0.6 })
}

// Aparece un mensaje / siguiente
export function pop() {
  tone({ freq: 520, to: 880, dur: 0.12, type: 'sine', vol: 0.28 })
  tone({ freq: 1320, dur: 0.25, type: 'sine', vol: 0.08, at: 0.06 })
}

// Cada toque a la torta: sube el tono
export function tick(n) {
  const base = 330 * Math.pow(1.122, n * 2)
  tone({ freq: base, to: base * 1.6, dur: 0.16, type: 'square', vol: 0.12 })
  noise({ dur: 0.08, vol: 0.2, from: 3000, to: 800 })
}

// Explosión + melodía de cumpleaños
export function boom() {
  tone({ freq: 160, to: 30, dur: 0.9, type: 'sine', vol: 0.8 })
  noise({ dur: 1.1, vol: 0.55, from: 2500, to: 80, q: 0.5 })
  noise({ dur: 0.6, vol: 0.3, from: 9000, to: 2000, at: 0.05, q: 0.5 })
  ;[1047, 1319, 1568, 2093].forEach((f, i) =>
    tone({ freq: f, dur: 0.7, vol: 0.14, at: 0.25 + i * 0.08, type: 'triangle' }))
  // fuegos artificiales
  for (let i = 0; i < 8; i++) {
    noise({ dur: 0.25, vol: 0.18, at: 0.5 + i * 0.22 + Math.random() * 0.1, from: 5000, to: 700 })
  }
  // Cumpleaños feliz (C mayor)
  const C4 = 262, D4 = 294, E4 = 330, F4 = 349, G4 = 392, A4 = 440, C5 = 523
  const song = [
    [G4, .3], [G4, .15], [A4, .45], [G4, .45], [C5, .45], [4 / 3 * 0 + 494, .9],
    [G4, .3], [G4, .15], [A4, .45], [G4, .45], [D4 * 2, .45], [C5, .9],
  ]
  let t = 1.3
  song.forEach(([f, d]) => {
    tone({ freq: f, dur: d + 0.15, type: 'triangle', vol: 0.2, at: t, attack: 0.02 })
    tone({ freq: f * 2, dur: d, type: 'sine', vol: 0.06, at: t })
    t += d + 0.05
  })
  void C4; void E4; void F4
}
