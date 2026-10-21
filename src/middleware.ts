import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    // Add a 10-second safety timeout so it doesn't hang Vercel's 25s limit
    return await Promise.race([
      updateSession(request),
      new Promise((resolve) =>
        setTimeout(() => resolve(NextResponse.next()), 10000)
      ),
    ]);
  } catch (error) {
    console.error("Middleware Error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Only run middleware on app routes and auth routes.
     * Do NOT run on API routes, static files, or images.
     */
    "/dashboard/:path*",
    "/seo/:path*",
    "/projects/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};