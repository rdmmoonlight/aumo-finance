import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  try {
    const { pathname, search } = request.nextUrl;

    // Ambil cookie session ASP.NET Core
    const sessionToken = request.cookies.get("AumoFinance.Session")?.value;

    const isAuthenticated = Boolean(sessionToken);
    const isAuthPage = pathname.startsWith("/auth");

    // 1. Pengguna BELUM login & mencoba mengakses halaman terproteksi (selain '/' dan '/auth/*')
    if (!isAuthenticated && !isAuthPage && pathname !== "/") {
      const loginUrl = new URL("/auth", request.url);
      // Simpan rute tujuan beserta query-nya agar bisa diarahkan kembali setelah login
      loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Pengguna SUDAH login & mencoba mengakses halaman auth (/auth/*) atau landing page ('/')
    if (isAuthenticated && (isAuthPage || pathname === "/")) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[MIDDLEWARE ERROR]", error);
    // Jangan kembalikan JSON 500 saat middleware error agar tidak memutus navigasi user,
    // biarkan request dilanjutkan ke halaman yang dituju.
    return NextResponse.next();
  }
}

// Config Matcher: Mengecualikan rute static asset, API backend, dan file media
export const config = {
  matcher: [
    /*
     * Match semua request rute KECUALI:
     * - api (Next.js API routes & Rewrites proxy ke ASP.NET Core)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, asset gambar/svg
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
