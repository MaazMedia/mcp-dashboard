import { supabaseService } from "./supabase";
import { sampleForApp } from "./sample-data";
import type { AppKind, DashboardPayload, ActivityItem, TrendPoint, Metric } from "./types";

type ShareRow = {
  slug: string;
  user_id: string;
  app: AppKind;
  expires_at: string | null;
  revoked: boolean;
};

export async function resolveShare(slug: string): Promise<ShareRow | null> {
  const svc = supabaseService();
  if (!svc) return null;
  const { data, error } = await svc
    .from("dashboard_shares")
    .select("slug,user_id,app,expires_at,revoked")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  if (data.revoked) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return null;
  return data as ShareRow;
}

/** Pulls last-30-days metrics for a given user on a given app. */
export async function fetchUserDashboard(
  userId: string,
  app: AppKind,
  slug: string
): Promise<DashboardPayload> {
  const svc = supabaseService();
  if (!svc) return sampleForApp(app, slug);

  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();

  if (app === "adsiq") {
    const [{ data: campaigns }, { data: usage }] = await Promise.all([
      svc
        .from("campaigns")
        .select("id,status,prediction,after_metrics,date_submitted")
        .eq("user_id", userId)
        .gte("date_submitted", since)
        .order("date_submitted", { ascending: false })
        .limit(500),
      svc
        .from("ai_usage")
        .select("prompt_tokens,completion_tokens,cost,created_at")
        .eq("user_id", userId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    const rows = campaigns ?? [];
    const live = rows.filter((r) => r.status === "active" || r.status === "live").length;
    const totalTokens =
      (usage ?? []).reduce(
        (s, u) => s + (u.prompt_tokens ?? 0) + (u.completion_tokens ?? 0),
        0
      );
    const avgRoas = avgFromAfterMetrics(rows, "roas");
    const avgCtr = avgFromAfterMetrics(rows, "ctr");
    const avgCpa = avgFromAfterMetrics(rows, "cpa");

    const metrics: Metric[] = [
      { label: "ROAS", value: avgRoas ? `${avgRoas.toFixed(2)}x` : "—" },
      { label: "CTR", value: avgCtr ? `${avgCtr.toFixed(2)}%` : "—" },
      { label: "CPA", value: avgCpa ? `$${avgCpa.toFixed(2)}` : "—" },
      { label: "Campaigns live", value: String(live) },
    ];

    const trend: TrendPoint[] = bucketByDay(
      rows.map((r) => ({ date: r.date_submitted as string, value: 1 }))
    );
    const activity: ActivityItem[] = rows.slice(0, 8).map((r, i) => ({
      id: String(r.id ?? i),
      at: r.date_submitted as string,
      title: `Campaign status: ${r.status ?? "updated"}`,
      kind: "status",
    }));
    if (totalTokens > 0) {
      activity.unshift({
        id: "tokens",
        at: new Date().toISOString(),
        title: `AI usage: ${Intl.NumberFormat("en-US").format(totalTokens)} tokens in last 30d`,
        kind: "usage",
      });
    }

    return {
      app,
      slug,
      client: { name: "Client", email: "" },
      metrics,
      trend,
      activity,
    };
  }

  // BPIQ
  const paymentsRes = await svc
    .from("payments")
    .select("amount,currency,status,created_at")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);
  const payments = paymentsRes.data as
    | { amount: number | null; currency: string | null; status: string | null; created_at: string }[]
    | null;

  let usage:
    | { report_type: string | null; created_at: string }[]
    | null = null;
  try {
    const u = await svc
      .from("usage_tracking")
      .select("report_type,created_at")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);
    usage = (u.data as typeof usage) ?? [];
  } catch {
    usage = [];
  }

  const reportCount = usage?.length ?? 0;
  const revenue = (payments ?? [])
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + (p.amount ?? 0), 0);

  const metrics: Metric[] = [
    { label: "Reports / 30d", value: String(reportCount) },
    { label: "Revenue / 30d", value: `$${(revenue / 100).toFixed(0)}` },
    { label: "Risk score", value: "—" },
    { label: "Budget exposure", value: "—" },
  ];

  const trend: TrendPoint[] = bucketByDay(
    (payments ?? []).map((p) => ({ date: p.created_at as string, value: (p.amount ?? 0) / 100 }))
  );
  const activity: ActivityItem[] = (payments ?? []).slice(0, 8).map((p, i) => ({
    id: String(i),
    at: p.created_at as string,
    title: `Payment ${p.status}: $${((p.amount ?? 0) / 100).toFixed(0)} ${p.currency ?? ""}`.trim(),
    kind: "payment",
  }));

  return {
    app,
    slug,
    client: { name: "Client", email: "" },
    metrics,
    trend,
    activity,
  };
}

function avgFromAfterMetrics(rows: { after_metrics?: unknown }[], key: string): number {
  const vals: number[] = [];
  for (const r of rows) {
    const m = (r.after_metrics ?? {}) as Record<string, unknown>;
    const v = Number(m?.[key]);
    if (Number.isFinite(v)) vals.push(v);
  }
  if (!vals.length) return 0;
  return vals.reduce((s, x) => s + x, 0) / vals.length;
}

function bucketByDay(
  rows: { date: string; value: number }[]
): TrendPoint[] {
  const buckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    buckets.set(d, 0);
  }
  for (const r of rows) {
    if (!r.date) continue;
    const d = r.date.slice(0, 10);
    if (buckets.has(d)) buckets.set(d, (buckets.get(d) ?? 0) + (r.value ?? 0));
  }
  return [...buckets.entries()].map(([date, value]) => ({ date, value }));
}

/** Admin: cross-user global metrics. */
export async function fetchAdminOverview(app: AppKind) {
  const svc = supabaseService();
  if (!svc) {
    return {
      totals: {
        users: 142,
        activeUsers30d: 88,
        revenueCents: 1_942_300,
        reports30d: 612,
      },
      revenueTrend: bucketByDay(
        Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 86_400_000).toISOString(),
          value: 20 + Math.random() * 120,
        }))
      ),
      leaderboard: [
        { user: "acme@example.com", value: 128 },
        { user: "northgate@example.com", value: 92 },
        { user: "brightside@example.com", value: 71 },
        { user: "ridge@example.com", value: 44 },
      ],
    };
  }

  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const table = app === "adsiq" ? "purchases" : "payments";
  const amountCol = app === "adsiq" ? "amount_cents" : "amount";

  const { data: pay } = await svc
    .from(table)
    .select(`user_id,${amountCol},status,created_at`)
    .gte("created_at", since)
    .limit(2000);

  const rows = (pay ?? []) as Array<Record<string, unknown>>;
  const revenueCents = rows
    .filter((r) => (r.status as string) === "completed")
    .reduce((s, r) => s + Number(r[amountCol] ?? 0), 0);
  const users = new Set(rows.map((r) => r.user_id as string)).size;

  const byUser = new Map<string, number>();
  for (const r of rows) {
    const u = (r.user_id as string) ?? "unknown";
    byUser.set(u, (byUser.get(u) ?? 0) + 1);
  }
  const leaderboard = [...byUser.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([user, value]) => ({ user, value }));

  const revenueTrend = bucketByDay(
    rows.map((r) => ({
      date: r.created_at as string,
      value: Number(r[amountCol] ?? 0) / 100,
    }))
  );

  return {
    totals: {
      users,
      activeUsers30d: users,
      revenueCents,
      reports30d: rows.length,
    },
    revenueTrend,
    leaderboard,
  };
}
