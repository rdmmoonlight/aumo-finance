// src/utils/route-extractor.ts

// Ambil semua file halaman di bawah src/pages
const pages = import.meta.glob('./pages/**/*.tsx');

export function getAppRoutes(): string[] {
    return Object.keys(pages).map((path) => {
        return path
            // Hapus prefix ./pages
            .replace('./pages', '')
            // Hapus ekstensi file .tsx/.ts
            .replace(/\.tsx?$/, '')
            // Ubah /index menjadi /
            .replace(/\/index$/, '')
            // Ubah sintaks parameter [id] menjadi :id (sesuai router)
            .replace(/\[(...?\w+)\]/g, ':$1') || '/';
    });
}

// Log ke console browser pas aplikasi berjalan
console.log('Daftar Rute Aplikasi:', getAppRoutes());