"use client";

import { Check, Copy, Link2 } from "lucide-react";
import { useState } from "react";

export function ShareLinkBanner({ slug, app }: { slug: string; app: "adsiq" | "bpiq" }) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/c/${slug}`
      : `/c/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-emerald-500/10 p-4">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
        <Link2 size={13} />
        {app === "adsiq" ? "AdsIQ" : "BuildPredict"} share link
      </span>
      <code className="flex-1 truncate rounded bg-black/30 px-3 py-1 text-xs text-white/80">
        {url}
      </code>
      <button
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-white/90"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
