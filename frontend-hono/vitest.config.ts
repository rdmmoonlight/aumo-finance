import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        // RTK Query (Request Node) menolak URL relatif; fetch dimock, jadi host cukup berupa placeholder
        env: { VITE_WEB_API_URL: 'http://localhost:5000' },
        // Hanya baca file unit test .test.js / .test.ts
        include: ['src/**/*.test.{js,ts}'],
        // Kecualikan file Playwright (.spec.ts) & folder luar
        exclude: ['node_modules', 'playwright-report', 'tests/**', '**/*.spec.ts'],
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});