import { useEffect, useState } from 'react'

// Devuelve una función now() que usa la hora real del servidor (no la del teléfono, que puede estar mal).
// Para probar: añade ?ahora=2026-11-06T23:59:50-04:00 a la URL.
export function useServerClock() {
  const [clock, setClock] = useState(null)

  useEffect(() => {
    let done = false
    const finish = (offset) => {
      if (done) return
      done = true
      setClock({ now: () => Date.now() + offset })
    }

    const forced = new URLSearchParams(window.location.search).get('ahora')
    if (forced && !Number.isNaN(Date.parse(forced))) {
      finish(Date.parse(forced) - Date.now())
      return
    }

    const ctrl = new AbortController()
    const timer = setTimeout(() => { ctrl.abort(); finish(0) }, 1500)
    const t0 = Date.now()
    fetch(window.location.pathname, { method: 'HEAD', cache: 'no-store', signal: ctrl.signal })
      .then((r) => {
        const d = Date.parse(r.headers.get('date') || '')
        const t1 = Date.now()
        // compensa la mitad de la latencia de ida y vuelta
        finish(Number.isNaN(d) ? 0 : d + (t1 - t0) / 2 - t1)
      })
      .catch(() => finish(0))
      .finally(() => clearTimeout(timer))
    return () => { clearTimeout(timer); ctrl.abort() }
  }, [])

  return clock
}
