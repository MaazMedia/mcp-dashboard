import { MetricCard } from "./MetricCard";
import { TrendChart } from "./TrendChart";
import { ActivityFeed } from "./ActivityFeed";
import type { DashboardPayload } from "@/lib/types";

export function DashboardView({ data }: { data: DashboardPayload }) {
  const color = data.app === "adsiq" ? "#60a5fa" : "#34d399";
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data.metrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} delta={m.delta} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-2 text-sm text-white/60">
            {data.app === "adsiq" ? "Predictions over time" : "Reports over time"}
          </div>
          <TrendChart data={data.trend} color={color} />
        </div>
        <div>
          <div className="mb-2 text-sm text-white/60">Recent activity</div>
          <ActivityFeed items={data.activity} />
        </div>
      </div>
    </div>
  );
}
