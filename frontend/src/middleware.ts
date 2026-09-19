import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // ⏱️ Batas waktu tunggu maksimal: 1 menit (60.000 ms)
  const TIMEOUT_MS = 60000;

  const timeoutPromise = new Promise<NextResponse>((_, reject) =>
    setTimeout(() => reject(new Error("Middleware Timeout")), TIMEOUT_MS),
  );

  const handleMiddleware = async (): Promise<NextResponse> => {
    const { pathname } = request.nextUrl;

    // Ambil cookie session ASP.NET Core
    const sessionToken = request.cookies.get("AumoFinance.Session")?.value;

    // Cek status autentikasi berdasarkan keberadaan cookie
    const isAuthenticated = Boolean(sessionToken);

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
  };

  try {
    // Balapan antara logika middleware dan timer timeout 1 menit
    return await Promise.race([handleMiddleware(), timeoutPromise]);
  } catch (error) {
    console.error("[MIDDLEWARE TIMEOUT]", error);

    // Kembalikan response 504 Gateway Timeout jika melepasi 1 menit
    const response = NextResponse.json(
      {
        success: false,
        message: "Request timeout pada server middleware (lebih dari 1 menit).",
        path: request.nextUrl.pathname,
      },
      { status: 504 },
    );

    response.headers.set("X-Server-Timeout", "true");
    return response;
  }
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
