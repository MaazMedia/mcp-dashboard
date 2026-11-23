"use client";

import { useEffect, useState } from "react";
import { AppSwitcher } from "@/components/AppSwitcher";
import { MetricCard } from "@/components/MetricCard";
import { TrendChart } from "@/components/TrendChart";
import { supabaseAnon, hasSupabaseEnv } from "@/lib/supabase";
import type { AppKind, TrendPoint } from "@/lib/types";

type Overview = {
  totals: { users: number; activeUsers30d: number; revenueCents: number; reports30d: number };
  revenueTrend: TrendPoint[];
  leaderboard: { user: string; value: number }[];
};

export default function AdminPage() {
  const [app, setApp] = useState<AppKind>("adsiq");
  const [data, setData] = useState<Overview | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const envOk = hasSupabaseEnv();

  useEffect(() => {
    const sb = supabaseAnon();
    if (!sb) {
      setChecking(false);
      return;
    }
    sb.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    fetch(`/api/metrics?view=admin&app=${app}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .catch(() => setData(null));
  }, [app]);

  if (checking) return <main className="p-10 text-white/60">Checking session…</main>;

  if (envOk && !email) {
    return (
      <main className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-2xl font-semibold">Admin sign-in required</h1>
        <a href="/app" className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm text-black">
          Sign in
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50">Admin</div>
          <h1 className="mt-1 text-3xl font-semibold">Global overview</h1>
          {!envOk ? (
            <p className="mt-1 text-xs text-amber-400">Demo data — no Supabase env configured.</p>
          ) : null}
        </div>
        <AppSwitcher value={app} onChange={setApp} />
      </div>

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <MetricCard label="Users" value={String(data.totals.users)} />
            <MetricCard label="Active / 30d" value={String(data.totals.activeUsers30d)} />
            <MetricCard
              label="Revenue / 30d"
              value={`$${(data.totals.revenueCents / 100).toFixed(0)}`}
            />
            <MetricCard label="Reports / 30d" value={String(data.totals.reports30d)} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-2 text-sm text-white/60">Revenue trend</div>
              <TrendChart data={data.revenueTrend} color="#a78bfa" label="USD" />
            </div>
            <div>
              <div className="mb-2 text-sm text-white/60">Usage leaderboard</div>
              <ol className="rounded-xl border border-white/10 bg-white/5">
                {data.leaderboard.map((r, i) => (
                  <li
                    key={r.user}
                    className="flex items-center justify-between border-b border-white/5 p-3 text-sm last:border-0"
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                        {i + 1}
                      </span>
                      <span className="truncate">{r.user}</span>
                    </span>
                    <span className="text-white/60">{r.value}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </>
      ) : (
        <div className="py-20 text-center text-white/50">Loading…</div>
      )}
    </main>
  );
}
