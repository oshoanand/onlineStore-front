import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Next.js strictly requires a default export for middleware.
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuth = !!req.nextauth.token;

    // 1. Prevent logged-in users from accessing auth pages
    if (
      (pathname.startsWith("/auth/login") ||
        pathname.startsWith("/auth/register")) &&
      isAuth
    ) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // 2. Define strictly protected routes
        const protectedRoutes = [
          "/checkout",
          "/profile",
          "/orders",
          "/returns",
          "/chat",
          "/notifications",
        ];

        const isProtectedRoute = protectedRoutes.some((route) =>
          pathname.startsWith(route),
        );

        // If it's a protected route, require a token
        if (isProtectedRoute) {
          return !!token;
        }

        // Return true to allow the inner middleware function to execute for public pages (like /auth/login)
        return true;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  },
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|images|sounds|firebase-messaging-sw.js).*)",
  ],
};
