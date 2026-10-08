import type { RouterRoute } from 'hono/types';

interface RouteDoc {
  summary: string;
  description?: string;
  tags?: string[];
  responses?: Record<string, { description: string }>;
}

/** Metadata dokumentasi per route. Key: "METHOD /path". */
const routeDocs: Record<string, RouteDoc> = {
  'GET /': { summary: 'Status API', tags: ['Health'] },
  'GET /health': {
    summary: 'Cek kesehatan server',
    tags: ['Health'],
    responses: { '200': { description: 'Server berjalan normal' } },
  },
  'GET /users': {
    summary: 'Ambil daftar user',
    tags: ['Users'],
    responses: { '200': { description: 'Berhasil mengambil data user' } },
  },
  'POST /users': {
    summary: 'Buat user',
    tags: ['Users'],
    responses: { '201': { description: 'User berhasil dibuat' } },
  },
  'POST /auth/register': {
    summary: 'User Register',
    description: 'Mendaftarkan user baru menggunakan email & password.',
    tags: ['Auth'],
    responses: {
      '201': { description: 'Registrasi berhasil' },
      '400': { description: 'Validasi input gagal atau email sudah terdaftar' },
    },
  },
  'POST /auth/login': {
    summary: 'User Login',
    description: 'Login menggunakan email & password.',
    tags: ['Auth'],
    responses: {
      '200': { description: 'Login berhasil' },
      '400': { description: 'Validasi input gagal' },
      '401': { description: 'Email atau password salah' },
    },
  },
  'POST /auth/logout': {
    summary: 'User Logout',
    description: 'Menghapus cookie autentikasi web.',
    tags: ['Auth'],
    responses: { '200': { description: 'Logout berhasil' } },
  },
  'GET /auth/google/callback': {
    summary: 'Google OAuth Callback',
    description: 'Callback handler setelah autentikasi Google.',
    tags: ['Auth'],
    responses: {
      '302': { description: 'Redirect ke frontend' },
      '400': { description: 'Authorization code missing' },
    },
  },
};

const HIDDEN_PATHS = new Set(['/openapi.json', '/docs']);

/** Bangun spesifikasi OpenAPI dari daftar route Hono yang terdaftar. */
export function buildOpenApiSpec(routes: readonly RouterRoute[]) {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const route of routes) {
    // Lewati middleware (method ALL / path wildcard) dan endpoint dokumentasi itu sendiri
    if (route.method === 'ALL' || route.path.includes('*') || HIDDEN_PATHS.has(route.path)) {
      continue;
    }

    const method = route.method.toLowerCase();
    const path = route.path.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
    const doc = routeDocs[`${route.method} ${route.path}`];

    paths[path] ??= {};
    paths[path][method] = {
      summary: doc?.summary ?? `Endpoint ${route.method} ${route.path}`,
      ...(doc?.description && { description: doc.description }),
      ...(doc?.tags && { tags: doc.tags }),
      responses: doc?.responses ?? { '200': { description: 'Success' } },
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

export const docsHtml = `<!doctype html>
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
