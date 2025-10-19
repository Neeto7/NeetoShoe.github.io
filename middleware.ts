import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createClient(req, res);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // 🧠 Log semua info penting
  console.log("🧩 [Middleware Debug]");
  console.log("➡️ Pathname:", pathname);
  console.log("👤 User:", user ? user.email : "null");
  console.log("⚠️ User error:", userError?.message ?? "none");

  // 🔒 User belum login dan akses area user/cart
  if (!user && (pathname.startsWith("/user") || pathname.startsWith("/cart"))) {
    console.log("🚫 Redirect karena belum login (user/cart)");
    const redirectUrl = new URL("/auth", req.url);
    redirectUrl.searchParams.set("error", "unauthenticated");
    return NextResponse.redirect(redirectUrl);
  }

  // 🔒 Admin area
  if (!user && pathname.startsWith("/admin")) {
    console.log("🚫 Redirect karena belum login (admin)");
    const redirectUrl = new URL("/auth", req.url);
    redirectUrl.searchParams.set("error", "unauthenticated");
    return NextResponse.redirect(redirectUrl);
  }

  // 🧾 Jika user login, ambil role
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("📦 Profile data:", profile);
    console.log("⚠️ Profile error:", profileError?.message ?? "none");

    // 🚫 Cegah akses admin jika bukan admin
    if (pathname.startsWith("/admin") && profile?.role !== "admin") {
      console.log("⛔ Redirect karena role bukan admin");
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(redirectUrl);
    }
  }

  console.log("✅ Middleware OK, lanjut ke halaman");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*",],
};
