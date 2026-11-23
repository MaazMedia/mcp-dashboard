import { NextResponse } from "next/server";
import { resolveShare, fetchUserDashboard } from "@/lib/queries";
import { sampleForApp } from "@/lib/sample-data";
import { hasServiceRole } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!hasServiceRole()) {
    const app = slug.startsWith("b") ? "bpiq" : "adsiq";
    return NextResponse.json({ demo: true, data: sampleForApp(app, slug) });
  }

  const share = await resolveShare(slug);
  if (!share) {
    if (slug === "demo") {
      return NextResponse.json({ demo: true, data: sampleForApp("adsiq", slug) });
    }
    return NextResponse.json({ error: "invalid or expired slug" }, { status: 404 });
  }

  const data = await fetchUserDashboard(share.user_id, share.app, slug);
  return NextResponse.json({ demo: false, data });
}
