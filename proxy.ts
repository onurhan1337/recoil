import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DASHBOARD_ROUTES = [
  "/dashboard",
  "/notes",
  "/journal",
  "/collections",
  "/templates",
  "/canvas",
  "/analytics",
  "/settings",
] as const;

const AUTH_ROUTES = ["/login", "/signup"] as const;

function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

function isPublicRoute(pathname: string): boolean {
  return pathname === "/" || isAuthRoute(pathname);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/webhooks/")) {
    return NextResponse.next();
  }

  if (
    process.env.NODE_ENV === "development" &&
    pathname.startsWith("/api/cron/")
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isApiRoute(pathname)) {
    return supabaseResponse;
  }

  if (!user) {
    if (isDashboardRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (user) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isAuthRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
