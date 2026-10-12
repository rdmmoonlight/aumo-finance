import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  try {
    // Serahkan seluruh validasi sesi & proteksi ke RTK Query (Client-Side)
    // agar Edge Proxy tidak terkecoh oleh cookie cross-domain yang expired
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
