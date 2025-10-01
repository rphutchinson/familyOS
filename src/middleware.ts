import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnSignInPage = req.nextUrl.pathname.startsWith("/auth/signin");

  // If not logged in and not on sign-in page, redirect to sign-in
  if (!isLoggedIn && !isOnSignInPage) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // If logged in and on sign-in page, redirect to home
  if (isLoggedIn && isOnSignInPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};