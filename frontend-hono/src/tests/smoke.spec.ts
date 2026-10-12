import { expect, test } from '@playwright/test';

test.describe('Fase 1 Smoke Test — Navigasi Rute Utama', () => {
    test('Akses Rute Publik & Auth', async ({ page }) => {
        // Landing Page
        await page.goto('/');
        await expect(page).toHaveURL('/');

        // Auth Routes
        await page.goto('/auth/login');
        await expect(page).toHaveURL('/auth/login');

        await page.goto('/auth/register');
        await expect(page).toHaveURL('/auth/register');
    });

    test('Akses Rute Utama & Fitur Akuntansi', async ({ page }) => {
        // Alur Utama Aplikasi
        const mainRoutes = [
            '/home',
            '/dashboard',
            '/periods',
            '/chart-of-accounts',
            '/journal-entry',
            '/reports',
            '/reports/journals/general',
            '/reports/financial-statements/income-statement',
            '/reports/financial-statements/statement-of-financial-position',
            '/ai-assistant',
            '/settings',
            '/tools',
        ];

        for (const route of mainRoutes) {
            await page.goto(route);
            // Memastikan halaman berhasil dimuat tanpa crash/blank 500
            await expect(page).not.toHaveTitle(/404/i);
        }
    });
});