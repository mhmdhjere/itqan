import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PREFIXES = [
  "/login",
  "/api/auth",
  "/api/quran",
  "/api/config/active",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";

  if (isPublicPath(pathname)) {
    if (pathname === "/login" && isLoggedIn) {
      const dest = isAdmin ? "/admin" : "/circles";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    !isAdmin
  ) {
    return new NextResponse("Forbidden — admin access required", { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
