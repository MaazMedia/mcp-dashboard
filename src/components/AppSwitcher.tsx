"use client";

import { cn } from "@/lib/utils";

export function AppSwitcher({
  value,
  onChange,
}: {
  value: "adsiq" | "bpiq";
  onChange: (v: "adsiq" | "bpiq") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 text-sm">
      {(["adsiq", "bpiq"] as const).map((k) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={cn(
            "rounded-md px-3 py-1.5 transition",
            value === k ? "bg-white text-black" : "text-white/70 hover:text-white"
          )}
        >
          {k === "adsiq" ? "AdsIQ" : "BuildPredict"}
        </button>
      ))}
    </div>
  );
}
