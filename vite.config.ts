import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  // GitHub Pages serves this project at /House_Hunter/, so assets must be
  // requested from that prefix. Override with VITE_BASE for other hosts.
  base: process.env.VITE_BASE ?? '/House_Hunter/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
