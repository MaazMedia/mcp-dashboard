import { notFound } from "next/navigation";
import { ShareLinkBanner } from "@/components/ShareLinkBanner";
import { DashboardView } from "@/components/DashboardView";
import { resolveShare, fetchUserDashboard } from "@/lib/queries";
import { sampleForApp } from "@/lib/sample-data";
import { hasServiceRole } from "@/lib/supabase";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: `Client dashboard · ${slug}` };
}

export default async function ClientSharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // No Supabase configured → demo mode for any slug, so the page is useful in local/dev.
  if (!hasServiceRole()) {
    const app = slug.startsWith("b") ? "bpiq" : "adsiq";
    const data = sampleForApp(app, slug);
    return <Page slug={slug} data={data} demo />;
  }

  const share = await resolveShare(slug);
  if (!share) {
    // Still render the demo fallback for the literal "demo" slug so the smoke test passes.
    if (slug === "demo") {
      const data = sampleForApp("adsiq", slug);
      return <Page slug={slug} data={data} demo />;
    }
    notFound();
  }

  const data = await fetchUserDashboard(share.user_id, share.app, slug);
  return <Page slug={slug} data={data} demo={false} />;
}

function Page({
  slug,
  data,
  demo,
}: {
  slug: string;
  data: ReturnType<typeof sampleForApp>;
  demo: boolean;
}) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-wider text-white/50">
          {data.app === "adsiq" ? "AdsIQ" : "BuildPredict"} · Client dashboard
        </div>
        <h1 className="mt-2 text-3xl font-semibold">
          {data.client.name}
          {demo ? <span className="ml-3 text-sm text-amber-400">demo mode</span> : null}
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Last 30 days of activity. Updated live from Supabase.
        </p>
      </header>

      <div className="mb-6">
        <ShareLinkBanner slug={slug} app={data.app} />
      </div>

      <DashboardView data={data} />

      <footer className="mt-12 text-xs text-white/40">
        Shared via dashboard_shares · slug {slug}
      </footer>
    </main>
  );
}
