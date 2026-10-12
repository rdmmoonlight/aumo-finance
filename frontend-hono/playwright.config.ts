import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  // Hanya eksekusi file spec untuk Playwright
  testMatch: '**/*.spec.{ts,js}',
  // Abaikan folder unit test milik Vitest
  testIgnore: ['**/unit/**', '**/*.test.{ts,js}'],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  /* Timeout global disesuaikan untuk menangani kemungkinan cold start Render.com */
  timeout: 60000,

  use: {
    /* Frontend lokal (webServer di bawah); backend diakses lewat proxy /api */
    baseURL: 'http://localhost:3000',

    /* Toleransi batas waktu navigasi hingga 30 detik */
    navigationTimeout: 30000,
    actionTimeout: 15000,

    trace: 'on-first-retry',
  },

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

});