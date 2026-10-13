import Navigo from 'navigo';
import { appStore } from '../store/appStore';
import { guestGuard } from './guards';
import { runPipeline } from './pipeline';

// Impor Komponen & Halaman
import { renderAuthPage, setupAuthEvents } from '../components/auth';
import { renderCalculator, setupCalculatorEvents } from '../components/calculator';
import { renderFAQ, setupFAQEvents } from '../components/faq';
import { renderHero } from '../components/hero';
import { renderPricing, setupPricingEvents } from '../components/pricing';
import type { RouteResult } from '../types/router';

// Inisialisasi Navigo Router
export const router = new Navigo('/', { hash: false });

export function navigateTo(url: string): void {
    router.navigate(url);
}

// ----------------------------------------------------------------------
// Page Handlers
// ----------------------------------------------------------------------

// Halaman Beranda / Public Landing Page
const homePage = (): RouteResult => {
    const html = `
    <main>
      ${renderHero()}
      ${renderCalculator()}
      ${renderPricing()}
      ${renderFAQ()}
    </main>
  `;

    const setupEvents = () => {
        setupCalculatorEvents();
        setupPricingEvents();
        setupFAQEvents();
    };

    return { html, setupEvents };
};

// Halaman Autentikasi (Hanya untuk Guest)
const authPage = (): RouteResult => {
    const html = `
    <main>
      ${renderAuthPage()}
    </main>
  `;

    const setupEvents = () => {
        setupAuthEvents();
    };

    return { html, setupEvents };
};

// Halaman 404 (Not Found)
const notFoundPage = (): RouteResult => {
    const html = `
    <main class="max-w-xl mx-auto px-6 py-24 text-center">
      <h1 class="text-6xl font-extrabold text-indigo-500 mb-4">404</h1>
      <p class="text-slate-300 text-xl mb-8">Halaman yang kamu cari tidak ditemukan.</p>
      <a href="/" data-navigo class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition">
        Kembali ke Beranda
      </a>
    </main>
  `;
    return { html };
};

// ----------------------------------------------------------------------
// Inisialisasi Router dengan Pipeline & Guards
// ----------------------------------------------------------------------
export function initRouter(): void {
    router
        // Landing Page (Publik)
        .on('/', runPipeline(homePage))

        // Auth Routes (Dipelindungi Guest Guard - User login akan didirect ke /home)
        .on('/auth', runPipeline(authPage, [guestGuard]))
        .on('/login', runPipeline(authPage, [guestGuard]))
        .on('/register', runPipeline(authPage, [guestGuard]))

        // Contoh Halaman Terproteksi (Dipelindungi Auth Guard - Hanya user login)
        // .on('/home', runPipeline(dashboardPage, [authGuard]))

        .notFound(runPipeline(notFoundPage));

    // Resolve rute saat pertama kali aplikasi di-load
    router.resolve();

    // Re-sync tautan data-navigo jika ada perubahan state di Zustand
    appStore.subscribe(() => {
        router.updatePageLinks();
    });
}