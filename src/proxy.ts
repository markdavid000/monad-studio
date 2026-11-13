import { NextResponse, type NextRequest } from "next/server";
import { readSession } from "@/lib/server/session";
import { connectUrl } from "@/lib/studio-entry";

export function proxy(request: NextRequest) {
  if (readSession(request)) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Connect and sign in with your wallet first." } },
      { status: 401 }
    );
  }
  return NextResponse.redirect(new URL(connectUrl(pathname + search), request.url));
}

export const config = {
  matcher: [
    "/studio",
    "/studio/:path*",
    "/api/monguard/:path*",
    "/api/gaslens/:path*",
    "/api/forge/:path*",
    "/api/history",
    "/api/history/:path*",
  ],
};
