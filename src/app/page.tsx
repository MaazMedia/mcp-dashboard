import Link from "next/link";
import { ArrowRight, BarChart3, Building2 } from "lucide-react";

export default function Landing() {
  const adsiqUrl = process.env.NEXT_PUBLIC_ADSIQ_APP_URL ?? "https://ads-iq.vercel.app";
  const bpiqUrl = process.env.NEXT_PUBLIC_BPIQ_APP_URL ?? "https://buildpredict.vercel.app";

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-balance text-5xl font-semibold tracking-tight">
        Live metrics for{" "}
        <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
          AdsIQ
        </span>{" "}
        &amp;{" "}
        <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
          BuildPredict
        </span>
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-white/70">
        One dashboard, two products. Share a client-scoped link, or sign in to see your
        account.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card
          title="AdsIQ"
          tag="Ads optimization"
          body="ROAS, CTR, CPA, campaign predictions and AI token usage — last 30 days."
          href={adsiqUrl}
          icon={<BarChart3 />}
          gradient="from-sky-500/20 to-indigo-500/20"
        />
        <Card
          title="BuildPredict"
          tag="Construction risk"
          body="Risk score, budget exposure, report pipeline and payments — last 30 days."
          href={bpiqUrl}
          icon={<Building2 />}
          gradient="from-emerald-500/20 to-teal-500/20"
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-white/60">
        <Link href="/app" className="rounded-lg bg-white px-4 py-2 font-medium text-black">
          Sign in to your dashboard
        </Link>
        <Link href="/c/demo" className="underline underline-offset-4 hover:text-white">
          View a demo client dashboard →
        </Link>
      </div>
    </main>
  );
}

function Card({
  title,
  tag,
  body,
  href,
  icon,
  gradient,
}: {
  title: string;
  tag: string;
  body: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-7 transition hover:border-white/30`}
    >
      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-white/70">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
          {icon}
        </span>
        {tag}
      </div>
      <div className="mt-5 text-3xl font-semibold">{title}</div>
      <p className="mt-2 text-white/70">{body}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white">
        View my dashboard
        <ArrowRight size={15} className="transition group-hover:translate-x-1" />
      </div>
    </a>
  );
}
