import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  envDir: '.', // Memuat file .env otomatis
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/test/**/*.ts'],
    exclude: ['./src/test/setup.ts'], // Fokus mencari file test di dalam folder src/test/
    setupFiles: ['./src/test/setup.ts'], // File setup global (buat file kosong jika belum ada)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/test/**'],
    },
  },
});
