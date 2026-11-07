// Utilidades de rendimiento: detección de equipos modestos, sprites y gobernador de calidad.
const nav = typeof navigator !== 'undefined' ? navigator : {}

// Android (p. ej. Tecno) o pocos núcleos/memoria => modo ligero
export const LOW =
  /Android/i.test(nav.userAgent || '') ||
  (nav.hardwareConcurrency || 8) <= 4 ||
  (nav.deviceMemory || 8) <= 4

export const getDpr = (cap = 1.5) => Math.min(window.devicePixelRatio || 1, LOW ? 1 : cap)

// Dibuja un corazón ya "horneado" en un canvas pequeño; luego solo se usa drawImage (muy barato)
export function heartSprite(color, size = 48) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const x = c.getContext('2d')
  const s = size / 1.25
  x.translate(size / 2, size * 0.06)
  x.fillStyle = color
  x.beginPath()
  x.moveTo(0, s * 0.3)
  x.bezierCurveTo(0, -s * 0.2, -s * 0.6, -s * 0.2, -s * 0.6, s * 0.15)
  x.bezierCurveTo(-s * 0.6, s * 0.5, 0, s * 0.7, 0, s * 0.95)
  x.bezierCurveTo(0, s * 0.7, s * 0.6, s * 0.5, s * 0.6, s * 0.15)
  x.bezierCurveTo(s * 0.6, -s * 0.2, 0, -s * 0.2, 0, s * 0.3)
  x.closePath()
  x.fill()
  return c
}

export function emojiSprite(ch, size = 64) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const x = c.getContext('2d')
  x.font = `${size * 0.8}px serif`
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.fillText(ch, size / 2, size / 2 + size * 0.04)
  return c
}

// Si los cuadros tardan demasiado, baja la calidad (q de 1 a 0.3) automáticamente
export function governor() {
  let acc = 0, n = 0
  const g = {
    q: LOW ? 0.6 : 1,
    tick(dt) {
      acc += dt; n++
      if (n >= 20) {
        const avg = acc / n
        if (avg > 0.028) g.q = Math.max(0.3, g.q - 0.15)
        else if (avg < 0.019) g.q = Math.min(LOW ? 0.7 : 1, g.q + 0.03)
        acc = 0; n = 0
      }
    },
  }
  return g
}
