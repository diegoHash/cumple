import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' permite publicar en GitHub Pages bajo cualquier nombre de repo
export default defineConfig({
  base: './',
  plugins: [react()],
})
