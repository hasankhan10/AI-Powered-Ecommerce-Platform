import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth session proxy.
 * Only checks authentication when users attempt to access protected routes (/account, /admin, /api/admin).
 * Public storefront routes (landing page, shop, products, collections, story, cart) load instantly
 * without blocking on any initial auth checks.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAccountRoute = pathname.startsWith("/account");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isProtectedRoute = isAccountRoute || isAdminRoute || isAdminApiRoute;

  // On public storefront pages, return immediately with zero auth overhead
  if (!isProtectedRoute) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Authenticate user only for protected routes
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect customer account routes
  if (isAccountRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin API routes
  if (isAdminApiRoute && !user) {
    // Allow verify-role for role checks during login/routing
    if (pathname === "/api/admin/verify-role") {
      return supabaseResponse;
    }
    // Allow dev-setup only in development if invoked locally
    if (pathname === "/api/admin/dev-setup" && process.env.NODE_ENV !== "production") {
      return supabaseResponse;
    }
    return NextResponse.json({ error: "Unauthorized - Admin session required" }, { status: 401 });
  }

  // Protect admin UI routes
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
