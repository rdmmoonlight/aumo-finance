// src/server/middleware/auth.ts
import { defineEventHandler, getRequestURL, parseCookies, sendRedirect, setHeaders } from 'h3';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const pathname = url.pathname;

  // 1. Logging path & Environment Variables
  console.log('Path:', pathname);
  console.log('Server Only Environment Variable:', process.env['SERVER_ONLY_VARIABLE']);
  console.log('Public Environment Variable:', process.env['VITE_EXAMPLE_VARIABLE']);

  // 2. Custom header untuk route /checkout
  if (pathname === '/checkout') {
    console.log('event url', pathname);
    setHeaders(event, {
      'x-analog-checkout': 'true',
    });
  }

  // 3. Auth Guard untuk route /admin
  if (pathname.startsWith('/admin')) {
    const cookies = parseCookies(event);
    const isLoggedIn = cookies['authToken'];

    if (!isLoggedIn) {
      await sendRedirect(event, '/login', 302);
    }
  }
});
