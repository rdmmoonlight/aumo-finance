import { defineConfig } from 'tsup';

export default defineConfig({
    // Entry point aplikasi backend kamu
    entry: ['src/index.ts'],

    // Output format & direktori
    format: ['esm'],
    outDir: 'dist',

    // Kebersihan & Optimasi
    clean: true, // Bersihkan folder dist sebelum build
    sourcemap: true, // Memudahkan debugging jika ada error di production
    minify: false, // Diset false agar kode server lebih mudah dibaca saat debugging (bisa di-set true jika ingin file lebih kecil)
    splitting: false, // Menonaktifkan code-splitting untuk aplikasi Node.js tunggal

    // Environment & Target
    target: 'node20',
    platform: 'node',

    // Type definition & Tree shaking
    dts: false, // Ubah ke true jika ini berupa library/package yang butuh .d.ts files
    treeshake: true,

    // Pastikan node_modules / external dependencies tidak di-bundle ke dalam file dist
    skipNodeModulesBundle: true,
});