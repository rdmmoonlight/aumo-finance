import path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()], // Membaca alias dari tsconfig.json
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    envDir: '.', // Memuat file .env otomatis
    include: ['src/test/**/*.{test,spec}.ts'], // Fokus mencari file test di dalam folder src/test/
    setupFiles: ['./src/test/setup.ts'], // File setup global (buat file kosong jika belum ada)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/test/**'],
    },
  },
});
