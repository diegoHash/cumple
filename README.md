# 💖 Cumpleaños de Gaby

Sorpresa interactiva hecha con React + Vite.
Mensajes editables en `src/messages.js`.

```bash
npm install
npm run dev      # desarrollo
npm run build    # producción
```

## Publicar en GitHub Pages
1. Sube la rama a `main`.
2. En GitHub: **Settings → Pages → Source: GitHub Actions**.
3. El workflow `.github/workflows/deploy.yml` publica en `https://<usuario>.github.io/cumple/`.

## Cuenta regresiva
El cumpleaños empieza en `BIRTHDAY` (`src/config.js`, hora de Venezuela). Antes de esa hora se ve una cuenta regresiva; a las 12:00 a. m. aparece la bienvenida.
La hora se toma del servidor, no del teléfono. Para probar: `?ahora=2026-11-06T23:59:50-04:00` en la URL.
