import { Activity, CreditCard, FileText, Rocket, Sparkles, TrendingUp } from "lucide-react";
import type { ActivityItem } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

const ICONS = {
  prediction: Sparkles,
  status: TrendingUp,
  submission: Rocket,
  usage: Activity,
  report: FileText,
  payment: CreditCard,
} as const;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items.length)
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/50">
        No recent activity in the last 30 days.
      </div>
    );
  return (
    <ol className="rounded-xl border border-white/10 bg-white/5">
      {items.map((a, i) => {
        const Icon = ICONS[a.kind] ?? Activity;
        return (
          <li
            key={a.id}
            className={`flex items-start gap-3 p-4 ${
              i !== items.length - 1 ? "border-b border-white/5" : ""
            }`}
          >
            <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
              <Icon size={15} />
            </span>
            <div className="flex-1">
              <div className="text-sm text-white">{a.title}</div>
              <div className="text-xs text-white/40">{relativeTime(a.at)}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
