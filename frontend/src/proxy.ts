import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Cek cookie sesi jika ada
    const sessionToken = request.cookies.get("AumoFinance.Session")?.value;
    const isAuthenticated = Boolean(sessionToken);

    if (isAuthenticated && pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[MIDDLEWARE ERROR]", error);
    return NextResponse.next();
  }
}

// Config Matcher
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
