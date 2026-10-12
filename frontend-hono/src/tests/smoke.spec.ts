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
            const errors: string[] = [];
            page.on('pageerror', (e) => errors.push(e.message));
            await page.goto(route);
            // Halaman harus merender isi (bukan layar kosong) dan tanpa galat JS yang tidak tertangani
            await expect(page.locator('#root')).not.toBeEmpty();
            await expect(page).not.toHaveTitle(/404/i);
            expect(errors, `Galat JS pada ${route}`).toEqual([]);
        }
    });
});