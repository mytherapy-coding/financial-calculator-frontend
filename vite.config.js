import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/financial-calculator-frontend/' : '/',
  server: {
    port: 3000,
    open: true,
  },
}))
