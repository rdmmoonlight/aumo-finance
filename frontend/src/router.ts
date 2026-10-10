// src/router.ts
import Navigo from 'navigo';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

export const router = new Navigo('/', { hash: false });

let currentReactRoot: Root | null = null;

/**
 * Membersihkan DOM & unmount React instance sebelumnya
 * untuk mencegah memory leak saat berpindah halaman.
 */
function prepareContainer(): HTMLElement {
    const container = document.getElementById('app');
    if (!container) throw new Error('Elemen #app tidak ditemukan di HTML');

    if (currentReactRoot) {
        currentReactRoot.unmount();
        currentReactRoot = null;
    }

    container.innerHTML = '';
    return container;
}

/**
 * Render untuk modul yang SUDAH dikonversi ke Vanilla JS / TS
 */
export function renderVanilla(content: HTMLElement | string) {
    const container = prepareContainer();
    if (typeof content === 'string') {
        container.innerHTML = content;
    } else {
        container.appendChild(content);
    }
}

/**
 * Render untuk modul yang MASIH menggunakan React (peralihan)
 */
export function renderReact(Component: React.ComponentType) {
    const container = prepareContainer();
    currentReactRoot = createRoot(container);
    currentReactRoot.render(React.createElement(Component));
}

/**
 * Inisialisasi daftar Route
 */
export function initRouter() {
    router
        // Auth Routes
        .on('/auth/login', () => {
            renderVanilla('<div class="p-6"><h1>Login Page (Vanilla)</h1></div>');
        })
        .on('/auth/register', () => {
            renderVanilla('<div class="p-6"><h1>Register Page (Vanilla)</h1></div>');
        })

        // Authenticated Routes
        .on('/dashboard', () => {
            // Contoh jika modul ini masih React: renderReact(DashboardPage)
            renderVanilla('<div class="p-6"><h1>Dashboard Page (Vanilla)</h1></div>');
        })
        .on('/chart-of-accounts', () => {
            renderVanilla('<div class="p-6"><h1>Chart of Accounts (Vanilla)</h1></div>');
        })
        .on('/journal-entry', () => {
            renderVanilla('<div class="p-6"><h1>Journal Entry (Vanilla)</h1></div>');
        })
        .on('/periods', () => {
            renderVanilla('<div class="p-6"><h1>Periods (Vanilla)</h1></div>');
        })

        // Reports Routes
        .on('/reports/financial-statements/income-statement', () => {
            renderVanilla('<div class="p-6"><h1>Income Statement (Vanilla)</h1></div>');
        })
        .on('/reports/financial-statements/statement-of-financial-position', () => {
            renderVanilla('<div class="p-6"><h1>Financial Position (Vanilla)</h1></div>');
        })

        // Root Redirect (Diperbaiki dari router.navigate('/') agar tidak infinite loop)
        .on('/', () => {
            router.navigate('/home');
        })

        // 404 Handler
        .notFound(() => {
            renderVanilla('<div class="p-6 text-red-500"><h1>404 - Halaman Tidak Ditemukan</h1></div>');
        })
        .resolve();
}