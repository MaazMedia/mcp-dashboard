import type { DashboardPayload } from "./types";

function trailingDays(n: number): { date: string; value: number }[] {
  const out: { date: string; value: number }[] = [];
  const base = Date.now();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base - i * 86_400_000);
    const noise = Math.sin(i / 2) * 15 + Math.random() * 10;
    out.push({ date: d.toISOString().slice(0, 10), value: Math.max(0, 50 + noise + (n - i) * 1.2) });
  }
  return out;
}

export function sampleAdsiq(slug = "demo"): DashboardPayload {
  return {
    app: "adsiq",
    slug,
    client: { name: "Acme Media (demo)", email: "demo@acme.co" },
    metrics: [
      { label: "ROAS", value: "4.8x", delta: 12.4 },
      { label: "CTR", value: "2.31%", delta: 0.18 },
      { label: "CPA", value: "$12.40", delta: -5.2 },
      { label: "Campaigns live", value: "17", delta: 3 },
    ],
    trend: trailingDays(30),
    activity: [
      { id: "1", at: new Date(Date.now() - 1000 * 60 * 12).toISOString(), title: "Prediction run: Summer DCO Launch", kind: "prediction" },
      { id: "2", at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), title: "Campaign Winter Retargeting marked complete", kind: "status" },
      { id: "3", at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), title: "New campaign submitted: Black Friday Core", kind: "submission" },
      { id: "4", at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), title: "AI usage: 142k tokens billed", kind: "usage" },
    ],
  };
}

export function sampleBpiq(slug = "demo"): DashboardPayload {
  return {
    app: "bpiq",
    slug,
    client: { name: "Northgate Builders (demo)", email: "demo@northgate.au" },
    metrics: [
      { label: "Risk score", value: "38 / 100", delta: -6 },
      { label: "Budget exposure", value: "$1.42M", delta: 4.1 },
      { label: "Reports / mo", value: "22", delta: 7 },
      { label: "Avg confidence", value: "91%", delta: 1.4 },
    ],
    trend: trailingDays(30),
    activity: [
      { id: "1", at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), title: "Report generated: 14 Carter St extension", kind: "report" },
      { id: "2", at: new Date(Date.now() - 1000 * 60 * 150).toISOString(), title: "High-risk flag cleared on project #4421", kind: "status" },
      { id: "3", at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), title: "New project submitted: Harbourside duplex", kind: "submission" },
      { id: "4", at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), title: "Payment received: $495 AUD", kind: "payment" },
    ],
  };
}

export function sampleForApp(app: "adsiq" | "bpiq", slug = "demo") {
  return app === "adsiq" ? sampleAdsiq(slug) : sampleBpiq(slug);
}
