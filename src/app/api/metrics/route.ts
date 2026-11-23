import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchUserDashboard, fetchAdminOverview } from "@/lib/queries";
import { sampleForApp } from "@/lib/sample-data";
import { hasSupabaseEnv } from "@/lib/supabase";
import type { AppKind } from "@/lib/types";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const app = ((url.searchParams.get("app") as AppKind) ?? "adsiq") as AppKind;
  const view = url.searchParams.get("view");

  // Demo mode: no Supabase env.
  if (!hasSupabaseEnv()) {
    if (view === "admin") {
      return NextResponse.json({ demo: true, data: await fetchAdminOverview(app) });
    }
    return NextResponse.json({ demo: true, data: sampleForApp(app, "me") });
  }

  // Authenticated with user JWT from Authorization header (client passes it on fetch).
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    }
  );
  const { data: userData } = await sb.auth.getUser();
  const user = userData.user;

  if (!user) {
    // Fall back to demo so the page renders during dev.
    return NextResponse.json({ demo: true, data: sampleForApp(app, "me") });
  }

  if (view === "admin") {
    if (!adminEmails().includes((user.email ?? "").toLowerCase())) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    return NextResponse.json({ demo: false, data: await fetchAdminOverview(app) });
  }

  const data = await fetchUserDashboard(user.id, app, "me");
  return NextResponse.json({ demo: false, data });
}
