import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
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