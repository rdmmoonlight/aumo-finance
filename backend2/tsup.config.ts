import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry point aplikasi backend
  entry: ['src/index.ts'],

  // Output format & direktori
  format: ['esm'],
  outDir: 'dist',

  // Kebersihan & Optimasi
  clean: true, // Bersihkan folder dist sebelum build
  sourcemap: true, // Memudahkan debugging jika ada error di production
  minify: false, // Set false agar mudah dibaca saat debugging
  splitting: false, // Nonaktifkan code-splitting untuk aplikasi Node.js tunggal

  // Environment & Target
  target: 'node20',
  platform: 'node',

  // Type definition & Tree shaking
  dts: false,
  treeshake: false, // Matikan tree-shaking manual agar mengandalkan runtime ESM bawaan Node.js

  // Bundling dependencies
  // Membundel seluruh node_modules ke dalam dist/index.js agar tidak ada masalah resolusi impor di runtime
  noExternal: [/(.*)/],
});
