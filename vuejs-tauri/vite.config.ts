import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const host = process.env.TAURI_DEV_HOST

export default defineConfig(({ mode }) => {
  // Memuat variabel env dari file .env / .env.production berdasarkan mode (development / production)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss()],
    clearScreen: false,
    resolve: {
      alias: {
        '#': fileURLToPath(new URL('./src', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: 'dist',
    },
    server: {
      port: 3000,
      strictPort: true, // Wajib untuk Tauri: gagalkan jika port 3000 sudah dipakai, jangan pindah port otomatis
      host: host || false,
      open: false, // Diubah ke false agar tidak membuka tab browser eksternal saat jendela Tauri muncul
      hmr: host
        ? {
            protocol: 'ws',
            host,
            port: 3001,
          }
        : undefined,
      watch: {
        // Abaikan folder Rust agar Vite tidak ikut memantau file build
        ignored: ['**/src-tauri/**'],
      },
    },
    // Mengizinkan Tauri membaca env berawalan VITE_ dan TAURI_
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
  }
})