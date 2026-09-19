import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ambil cookie session ASP.NET Core
  const sessionToken = request.cookies.get("AumoFinance.Session")?.value;

  // Cek status autentikasi berdasarkan keberadaan cookie
  const isAuthenticated = Boolean(sessionToken);

  // Tentukan apakah user sedang mengakses halaman autentikasi (/auth/login, /auth/register, dll)
  const isAuthPage = pathname.startsWith("/auth");

  // 1. Jika pengguna BELUM login dan mencoba mengakses halaman selain '/' dan '/auth/*'
  if (!isAuthenticated && !isAuthPage && pathname !== "/") {
    const loginUrl = new URL("/auth", request.url);
    // Simpan rute tujuan agar bisa diarahkan kembali setelah login
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika pengguna SUDAH login dan mencoba mengakses halaman auth (/auth/*) atau landing page ('/')
  if (isAuthenticated && (isAuthPage || pathname === "/")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

// Config Matcher: Hanya memproses rute utama web dan mengabaikan static asset, API, dan favicon
export const config = {
  matcher: [
    /*
     * Match semua request rute KECUALI:
     * - api (Next.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, asset gambar/svg
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
