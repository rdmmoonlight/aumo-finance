// vite.config.ts
import { sync as globSync } from 'glob'; // Pastikan install: npm i -D glob
import { extname, relative, resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiUrl = env.VITE_API_URL || 'https://aumonext-api.onrender.com';

    // 1. Cari semua file .html di root dan di dalam folder src/pages/
    const htmlFiles = globSync('{index.html,src/pages/**/*.html}');

    // 2. Petakan file-file tersebut ke dalam objek input Rollup secara otomatis
    const inputEntries = htmlFiles.reduce((acc, filePath) => {
        // Buat nama entry kunci unik berdasarkan path relatif (misal: "src/pages/login")
        const entryName = relative(__dirname, filePath).slice(0, -extname(filePath).length);
        acc[entryName] = resolve(__dirname, filePath);
        return acc;
    }, {} as Record<string, string>);

    return {
        build: {
            rollupOptions: {
                input: inputEntries, // Semua file HTML otomatis terdaftar di sini
            },
        },
        server: {
            proxy: {
                '/api': {
                    target: apiUrl,
                    changeOrigin: true,
                    secure: true,
                },
            },
        },
    };
});