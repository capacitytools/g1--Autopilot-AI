import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    console.error("Middleware Error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Only run middleware on app routes and auth routes.
     * Skip static files, images, and API routes.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};