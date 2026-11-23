"use client";

import { useEffect, useState } from "react";
import { DashboardView } from "@/components/DashboardView";
import { AppSwitcher } from "@/components/AppSwitcher";
import { supabaseAnon, hasSupabaseEnv } from "@/lib/supabase";
import { sampleForApp } from "@/lib/sample-data";
import type { DashboardPayload, AppKind } from "@/lib/types";

export default function AppPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [app, setApp] = useState<AppKind>("adsiq");
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const envOk = hasSupabaseEnv();

  useEffect(() => {
    const sb = supabaseAnon();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const r = await fetch(`/api/metrics?app=${app}`, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (!cancelled) setData(j.data);
        } else {
          if (!cancelled) setData(sampleForApp(app, "me"));
        }
      } catch {
        if (!cancelled) setData(sampleForApp(app, "me"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [app]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabaseAnon();
    if (!sb) return;
    await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/app" },
    });
    setSent(true);
  }

  if (!envOk) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Supabase env vars missing — signed-out demo mode.
        </div>
        <Header app={app} onApp={setApp} who="demo user" />
        {data ? <DashboardView data={data} /> : null}
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-white/60">We&apos;ll email you a magic link.</p>
        {sent ? (
          <div className="mt-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
            Check your inbox at <b>{email}</b>.
          </div>
        ) : (
          <form onSubmit={signIn} className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-black"
            >
              Send magic link
            </button>
          </form>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Header app={app} onApp={setApp} who={userEmail} />
      {loading ? (
        <div className="py-20 text-center text-white/50">Loading…</div>
      ) : data ? (
        <DashboardView data={data} />
      ) : null}
    </main>
  );
}

function Header({
  app,
  onApp,
  who,
}: {
  app: AppKind;
  onApp: (v: AppKind) => void;
  who: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-white/50">Your dashboard</div>
        <h1 className="mt-1 text-3xl font-semibold">Welcome, {who}</h1>
      </div>
      <AppSwitcher value={app} onChange={onApp} />
    </div>
  );
}
