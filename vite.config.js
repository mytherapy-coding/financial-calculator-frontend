import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/financial-calculator-frontend/' : '/',
  build: {
    // Main bundle includes React + Recharts; ~580 kB minified is expected unless we code-split.
    chunkSizeWarningLimit: 650,
  },
  server: {
    port: 3000,
    open: true,
  },
}))
