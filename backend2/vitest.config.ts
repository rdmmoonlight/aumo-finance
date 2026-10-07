import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [tsconfigPaths()], // Agar support path alias seperti '@/lib/env'
    test: {
        globals: true,
        environment: 'node',
        envDir: '.', // Otomatis load file .env saat testing berjalan
        setupFiles: ['./tests/setup.ts'], // Jika butuh setup global
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
});