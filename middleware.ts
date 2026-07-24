import { NextRequest, NextResponse } from "next/server";

// Basic auth gate for /internal/*. v1 only — replace with UI SSO later.
//
// Requires BASIC_AUTH_USER and BASIC_AUTH_PASS in the environment. If
// either is unset the middleware fails closed (503) rather than letting
// the route through without authentication.

export function middleware(req: NextRequest) {
  // /internal/requests went public at /portfolio/pipeline (ADR 0005
  // amendment, 2026-07-24) — redirect before the auth gate so old links
  // land on the public queue without a credential prompt.
  if (req.nextUrl.pathname.startsWith("/internal/requests")) {
    return NextResponse.redirect(
      new URL("/portfolio/pipeline", req.nextUrl.origin)
    );
  }

  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (!user || !pass) {
    return new NextResponse(
      "Internal view is not configured on this deployment.",
      { status: 503 }
    );
  }

  const auth = req.headers.get("authorization");
  const expected =
    "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");

  if (auth !== expected) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="IIDS Internal"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/internal/:path*",
};
