// The main home page is the user's dashboard, which will be protected by authentication middleware.
// Middleware runs on the edge, so we need to use edge-compatible libraries and utils in here
import { NextRequest, NextResponse } from "next/server";
import { decrypt, updateSessionEdge } from "./lib/sessions/sessions.edge";

// If the user is not authenticated, they will be redirected to the login page.
// Route exact matches (use startsWith for dynamic routes like /game/:id)
const protectedRoutes = [
  "/",
  "/profile"
];
const authPages = [
  "/auth/login",
  "/auth/signup"
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path) || path.startsWith("/game/");
  const isAuthPage = authPages.includes(path);

  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  // Redirect to "/" if the user is already signed in and tries to access auth pages
  if (session?.userId && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Allow access if we're not in a protected route.
  if (!isProtectedRoute) {
    // Proceed with rendering the page.
    return NextResponse.next();
  }

  if (isProtectedRoute && !session?.userId) {
    // This person is not authenticated!
    const response = NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    if (cookie) {
      response.cookies.delete("session");
    }
    return response;
  }

  // If user is authenticated and accessing protected route, refresh session
  if (isProtectedRoute && session?.userId) {
    try {
      const response = await updateSessionEdge(req);
      return response;
    } catch (error) {
      console.log("Session refresh failed, redirecting... ", error);
      const response = NextResponse.redirect(new URL("/auth/login", req.nextUrl))
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

// Routes Middleware should run on
// For dynamic routes, :path* is the Nextjs wildcard syntax
export const config = {
  matcher: ["/", "/auth/login", "/auth/signup", "/game/:path*", "/profile"],
}