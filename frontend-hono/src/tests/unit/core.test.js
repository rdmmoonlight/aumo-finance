import { cn } from '@/core/cn.js';
import { createDisposer, h, mount } from '@/core/dom.js';
import { formatDate, formatRupiah } from '@/core/format.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('src/core — Vanilla Runtime Utilities', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('dom.js', () => {
        it('h() membuat elemen HTML dengan atribut & children', () => {
            const el = h('button', { className: 'btn-primary', id: 'submit' }, 'Klik');
            expect(el.tagName).toBe('BUTTON');
            expect(el.className).toBe('btn-primary');
            expect(el.textContent).toBe('Klik');
        });

        it('mount() menempelkan elemen ke container', () => {
            const container = document.createElement('div');
            container.id = 'app';
            document.body.appendChild(container);

            const child = h('p', {}, 'Konten');
            mount('#app', child);

            expect(container.innerHTML).toBe('<p>Konten</p>');
        });

        it('createDisposer() menjalankan fungsi cleanup', () => {
            const disposer = createDisposer();
            let isCleaned = false;

            disposer.add(() => {
                isCleaned = true;
            });
            disposer.clean();

            expect(isCleaned).toBe(true);
        });
    });

    describe('format.js', () => {
        it('formatRupiah() mengubah angka ke format IDR', () => {
            expect(formatRupiah(1500000)).toMatch(/1\.500\.000/);
            expect(formatRupiah(0)).toMatch(/0/);
        });

        it('formatDate() memformat tanggal indonesia', () => {
            const formatted = formatDate('2026-10-12', 'medium');
            expect(formatted).toMatch(/12 Okt 2026/);
        });
    });

    describe('cn.js', () => {
        it('cn() menggabungkan dan menyelesaikan bentrok Tailwind class', () => {
            expect(cn('p-2 p-4', 'bg-red-500')).toBe('p-4 bg-red-500');
        });
    });
});