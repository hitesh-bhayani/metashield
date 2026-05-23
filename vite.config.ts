import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Use repo subpath only for production (GitHub Pages). Local dev runs at /.
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/metashield/' : '/',
  plugins: [react(), tailwindcss()],
})
