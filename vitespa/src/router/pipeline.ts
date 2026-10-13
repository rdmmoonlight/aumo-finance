import type { Match } from 'navigo';
import { renderNavbar } from '../components/navbar';
import { renderSessionModal, setupSessionModalEvents } from '../components/session-modal';
import type { Middleware, RouteContext, RouteHandler } from '../types/router';
import { router } from './index';

function applyGlobalLayout(contentHtml: string): string {
    return `
    ${renderNavbar()}
    ${contentHtml}
    ${renderSessionModal()}
  `;
}

function renderPage(pageHandler: RouteHandler, match?: Match): void {
    const app = document.getElementById('app');
    if (!app) {
        console.error('Error: Elemen #app tidak ditemukan di index.html!');
        return;
    }

    // 1. Dapatkan struktur HTML dan event handler spesifik halaman
    const { html, setupEvents } = pageHandler(match);

    // 2. Render HTML ke dalam DOM
    app.innerHTML = applyGlobalLayout(html);

    // 3. Pasang event listener spesifik komponen halaman
    if (setupEvents) {
        setupEvents();
    }

    // 4. Pasang event listener komponen global (Navbar & Session Modal)
    setupSessionModalEvents();

    // 5. Re-inisialisasi ikon Lucide jika tersedia
    if ((window as any).lucide) {
        (window as any).lucide.createIcons();
    }

    // 6. Update tautan data-navigo setelah DOM benar-benar siap
    requestAnimationFrame(() => {
        router.updatePageLinks();
    });
}

export function runPipeline(
    pageHandler: RouteHandler,
    middlewares: Middleware[] = []
) {
    return async (match?: Match) => {
        const context: RouteContext = { match };

        for (const middleware of middlewares) {
            const allowed = await middleware(context);

            if (!allowed) {
                if (context.redirectUrl) {
                    console.log(`Navigasi dicegat guard, mengalihkan ke: ${context.redirectUrl}`);
                    router.navigate(context.redirectUrl);
                }
                return;
            }
        }

        renderPage(pageHandler, match);
    };
}