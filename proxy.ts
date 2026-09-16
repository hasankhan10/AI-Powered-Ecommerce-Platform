import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth session refresh proxy.
 * Keeps the Supabase session alive by refreshing the token on every request.
 * Also protects /account and /admin routes.
 */
export async function proxy(request: NextRequest) {
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

  // Refresh session — do not remove this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect customer account routes
  if (request.nextUrl.pathname.startsWith("/account") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin API routes
  if (request.nextUrl.pathname.startsWith("/api/admin") && !user) {
    // Allow verify-role for role checks during login/routing
    if (request.nextUrl.pathname === "/api/admin/verify-role") {
      return supabaseResponse;
    }
    // Allow dev-setup only in development if invoked locally
    if (request.nextUrl.pathname === "/api/admin/dev-setup" && process.env.NODE_ENV !== "production") {
      return supabaseResponse;
    }
    return NextResponse.json({ error: "Unauthorized - Admin session required" }, { status: 401 });
  }

  // Protect admin UI routes — role check happens server-side inside the layout
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
