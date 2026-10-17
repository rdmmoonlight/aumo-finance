// /middleware/auth.ts atau src/server/middleware/auth.ts
import { defineEventHandler, getRequestURL, parseCookies, sendRedirect, setHeaders } from 'h3';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const pathname = url.pathname;

  // 1. Logging Request Path & Environment Variables
  const apiUrl = process.env['VITE_API_URL'] || 'Not Set';
  const serverVar = process.env['SERVER_ONLY_VARIABLE'] || 'Not Set';
  
  console.log(`[Server Middleware] Path: ${pathname}`);
  console.log(`[Server Middleware] VITE_API_URL: ${apiUrl}`);
  console.log(`[Server Middleware] SERVER_ONLY_VARIABLE: ${serverVar}`);

  // 2. Custom Header untuk Route /checkout
  if (pathname === '/checkout') {
    setHeaders(event, {
      'x-analog-checkout': 'true',
    });
  }

  // 3. Proteksi Route /admin via Server Cookie
  if (pathname.startsWith('/admin')) {
    const cookies = parseCookies(event);
    const isLoggedIn = cookies['authToken'];

    if (!isLoggedIn) {
      await sendRedirect(event, '/login', 302);
    }
  }
});
