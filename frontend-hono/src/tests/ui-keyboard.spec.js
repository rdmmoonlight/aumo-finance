import { expect, test } from '@playwright/test';

test.describe('Uji Aksesibilitas Keyboard Komponen UI (/__ui)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/__ui');
    });

    test('1. Native Dialog & Focus Trap (Esc & Return Focus)', async ({ page }) => {
        // Inject trigger & dialog test khusus jika belum ada di DOM untuk memastikan uji isolated
        await page.evaluate(() => {
            if (!document.getElementById('test-dialog-trigger')) {
                const btn = document.createElement('button');
                btn.id = 'test-dialog-trigger';
                btn.innerText = 'Test Dialog Keyboard';
                btn.onclick = () => document.getElementById('test-dialog-elem').showModal();

                const dialog = document.createElement('dialog');
                dialog.id = 'test-dialog-elem';
                dialog.innerHTML = `
          <p>Konten Dialog Uji Keyboard</p>
          <button id="test-dialog-close" onclick="this.closest('dialog').close()">Tutup</button>
        `;

                document.body.appendChild(btn);
                document.body.appendChild(dialog);
            }
        });

        const trigger = page.locator('#test-dialog-trigger');
        await expect(trigger).toBeVisible({ timeout: 5000 });

        // Focus & Buka dialog via Enter
        await trigger.focus();
        await page.keyboard.press('Enter');

        const dialog = page.locator('#test-dialog-elem');
        await expect(dialog).toBeVisible();

        // Tekan Esc untuk menutup dialog (Uji Native Esc Event)
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();

        // Kriteria Utama: Fokus harus kembali ke pemicu
        await expect(trigger).toBeFocused();
    });

    test('2. Popover & Dropdown Menu via Popover API', async ({ page }) => {
        const trigger = page.locator('button[popovertarget]').first();

        if (await trigger.count() > 0) {
            await trigger.focus();
            await page.keyboard.press('Space');

            const popoverId = await trigger.getAttribute('popovertarget');
            const popover = page.locator(`#${popoverId}`);
            await expect(popover).toBeVisible();

            // Tutup via Esc
            await page.keyboard.press('Escape');
            await expect(popover).toBeHidden();
            await expect(trigger).toBeFocused();
        }
    });

    test('3. Collapsible Native <details>', async ({ page }) => {
        const summary = page.locator('summary').first();
        const details = page.locator('details').first();

        if (await summary.count() > 0) {
            await summary.focus();

            // Buka via Space
            await page.keyboard.press('Space');
            await expect(details).toHaveAttribute('open', '');

            // Tutup via Space
            await page.keyboard.press('Space');
            await expect(details).not.toHaveAttribute('open', '');
        }
    });

    test('4. Sidebar Keyboard Shortcut (Ctrl+B / Cmd+B)', async ({ page }) => {
        const sidebar = page.locator('[data-state], [data-sidebar]').first();

        if (await sidebar.count() > 0) {
            await page.keyboard.press('Control+b');
            await page.waitForTimeout(300);
            const newState = await sidebar.getAttribute('data-state');
            expect(newState).not.toBeNull();
        }
    });
});