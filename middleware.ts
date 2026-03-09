import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware for protecting admin routes and managing authentication
 *
 * Protected routes:
 * - /admin/* (except /admin/login)
 *
 * Public routes:
 * - /admin/login
 * - / (home page)
 * - /booking/* (customer booking flow)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip middleware for login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Only check authentication for admin routes
  if (pathname.startsWith("/admin")) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing Supabase environment variables");
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
            });

            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });

            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      // If no session, redirect to login
      if (userError || !user) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Verify user is in admin_users table
      const { data: adminUser, error } = await supabase
        .from("admin_users")
        .select("id, is_active")
        .eq("id", user.id)
        .single();

      if (error || !adminUser || !adminUser.is_active) {
        // User is authenticated but not an admin or inactive
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // User is authenticated and authorized
      return response;
    } catch (error) {
      console.error("Middleware auth error:", error);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
