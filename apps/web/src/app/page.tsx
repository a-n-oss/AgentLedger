import Link from "next/link";
import { BrandLockup, BrandMark } from "@/components/brand/logo";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen text-[var(--al-ink)]">
      <SiteHeader variant="marketing" />

      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-20 pt-8 md:pt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-80"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, var(--al-accent-soft), transparent 42%),
              linear-gradient(var(--al-grid) 1px, transparent 1px),
              linear-gradient(90deg, var(--al-grid) 1px, transparent 1px)
            `,
            backgroundSize: "auto, 48px 48px, 48px 48px",
            maskImage: "linear-gradient(180deg, black 40%, transparent 95%)",
          }}
        />
        <p className="mb-4 inline-flex items-center rounded-full border border-[var(--al-line)] bg-[var(--al-panel)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--al-accent)]">
          Self-host first
        </p>
        <h1 className="flex max-w-3xl items-center gap-4 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] tracking-tight md:gap-5 md:text-6xl">
          <BrandMark size={64} className="md:h-[72px] md:w-[72px]" />
          <span>AgentLedger</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--al-muted)]">
          Hard budgets, chargeback, and an audit ledger for production AI agents — run it on your
          own stack. This site is docs and a seeded demo, not your production proxy.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/docs">
            <Button size="lg" variant="accent">
              Self-host
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="secondary">
              Try demo
            </Button>
          </Link>
        </div>
        <pre className="al-code mt-12 max-w-2xl overflow-x-auto rounded-2xl p-5 text-sm shadow-[var(--al-shadow)]">
{`const client = new OpenAI({
  apiKey: process.env.AGENTLEDGER_API_KEY,
  baseURL: "http://localhost:3000/api/v1",
  defaultHeaders: { "x-al-agent": "support-triage", "x-al-team": "support" },
});`}
        </pre>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3">
        {[
          {
            title: "Hard stop budgets",
            body: "Cap spend by project or agent. When the ledger hits the line, the proxy returns 402 — not a polite Slack ping.",
          },
          {
            title: "Chargeback by agent",
            body: "Attribute every LLM and tool action to agent, team, and product so finance can finally reconcile the AI bill.",
          },
          {
            title: "Audit-ready export",
            body: "Export the run ledger as CSV/JSON for ops reviews and compliance without dumping raw prompts by default.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-[var(--al-line)] bg-[var(--al-panel)]/90 p-6 shadow-[var(--al-shadow)]"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--al-muted)]">{item.body}</p>
          </div>
        ))}
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Plans when you self-host
        </h2>
        <p className="mt-2 text-[var(--al-muted)]">
          Entitlement tiers for your own install. This public site is a demo — point production
          traffic at your host.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { name: "Free", price: "$0", detail: "10k events · 1 project · soft alerts" },
            { name: "Pro", price: "$99", detail: "250k events · hard budgets · Slack alerts", featured: true },
            { name: "Team", price: "$299", detail: "1M events · audit export · payload retention" },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                plan.featured
                  ? "border-[var(--al-accent)] bg-[var(--al-accent-soft)] shadow-[var(--al-shadow)]"
                  : "border-[var(--al-line)] bg-[var(--al-panel)]"
              }`}
            >
              <div className="text-sm uppercase tracking-wide text-[var(--al-muted)]">{plan.name}</div>
              <div className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold">
                {plan.price}
                <span className="text-base font-normal text-[var(--al-muted)]">/mo</span>
              </div>
              <p className="mt-3 text-sm text-[var(--al-muted)]">{plan.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--al-line)] px-6 py-8 text-sm text-[var(--al-muted)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
          <BrandLockup markSize={20} className="text-sm text-[var(--al-muted)]" />
          <span>© {new Date().getFullYear()}</span>
          <Link href="/privacy" className="hover:text-[var(--al-ink)]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[var(--al-ink)]">
            Terms
          </Link>
          <Link href="/dpa" className="hover:text-[var(--al-ink)]">
            DPA
          </Link>
          <Link href="/api/health" className="hover:text-[var(--al-ink)]">
            Status
          </Link>
        </div>
      </footer>
    </div>
  );
}
