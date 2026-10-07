import { IncomingMessage, ServerResponse } from 'node:http';
import { Route } from '../types/route.types';
import { authRoutes } from './auth.route';
import { healthRoutes } from './health.route';
import { userRoutes } from './user.route';

// Gabungkan semua route dari berbagai modul
const routes: Route[] = [
    ...healthRoutes,
    ...userRoutes,
    ...authRoutes,
];

// Buat skema OpenAPI dinamis berdasarkan daftar routes
function generateOpenApiSpec() {
    const paths: Record<string, Record<string, any>> = {};

    for (const route of routes) {
        const method = route.method.toLowerCase();
        if (!paths[route.path]) {
            paths[route.path] = {};
        }
        paths[route.path][method] = {
            summary: `Endpoint ${route.method} ${route.path}`,
            responses: {
                '200': { description: 'Success' },
            },
        };
    }

    return {
        openapi: '3.0.0',
        info: {
            title: 'Aumo Backend API',
            version: '3.2.0',
            description: 'Dokumentasi API Aumo Backend',
        },
        paths,
    };
}

export async function handleRoutes(
    req: IncomingMessage,
    res: ServerResponse
): Promise<boolean> {
    const { method, url } = req;

    // Normalisasi URL (mengabaikan query params misal /auth/google/callback?code=xxx)
    const parsedUrl = new URL(url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // 1. Endpoint JSON spesifikasi OpenAPI
    if (pathname === '/openapi.json' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(generateOpenApiSpec()));
        return true;
    }

    // 2. Endpoint UI Dokumentasi Scalar
    if (pathname === '/docs' && method === 'GET') {
        const html = `<!doctype html>
<html>
  <head>
    <title>Aumo API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" data-url="/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return true;
    }

    // Cari route aplikasi yang cocok berdasarkan HTTP Method & Path
    const matchedRoute = routes.find(
        (route) => route.method === method && route.path === pathname
    );

    if (matchedRoute) {
        await matchedRoute.handler(req, res);
        return true; // Berhasil ditangani
    }

    return false; // Route tidak ditemukan di daftar, diserahkan balik ke index.ts
}