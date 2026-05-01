import { NextRequest, NextResponse } from "next/server";

// Basic auth gate for /internal/*. v1 only — replace with UI SSO when ready.
//
// Requires BASIC_AUTH_USER and BASIC_AUTH_PASS in the environment. If either
// is unset (e.g. local dev without .env), the gate fails closed and returns
// 503 rather than letting the route through.

export function middleware(req: NextRequest) {
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
