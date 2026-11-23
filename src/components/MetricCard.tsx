import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) {
  const up = typeof delta === "number" && delta >= 0;
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      {typeof delta === "number" ? (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-sm",
            up ? "text-emerald-400" : "text-rose-400"
          )}
        >
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(delta).toFixed(1)}%
        </div>
      ) : (
        <div className="mt-2 text-sm text-white/40">—</div>
      )}
    </div>
  );
}
