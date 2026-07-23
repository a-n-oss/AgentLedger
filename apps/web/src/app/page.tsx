import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="font-[family-name:var(--font-display)] text-2xl tracking-tight">AgentLedger</div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/docs" className="text-[var(--al-muted)] hover:text-[var(--al-ink)]">
            Docs
          </Link>
          <Link href="/#pricing" className="text-[var(--al-muted)] hover:text-[var(--al-ink)]">
            Pricing
          </Link>
          <Link href="/app">
            <Button size="sm" variant="accent">
              Open app
            </Button>
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-20 pt-10">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(15,122,108,0.12), transparent 40%), url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f7a6c' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[var(--al-accent)]">
          Agent control plane
        </p>
        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight md:text-6xl">
          AgentLedger
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--al-muted)]">
          Hard budgets, chargeback, and an audit ledger for production AI agents — not another
          trace debugger.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/app">
            <Button size="lg" variant="accent">
              Start free
            </Button>
          </Link>
          <Link href="/docs">
            <Button size="lg" variant="secondary">
              Proxy quickstart
            </Button>
          </Link>
        </div>
        <pre className="mt-12 max-w-2xl overflow-x-auto rounded-xl border border-[var(--al-line)] bg-[var(--al-ink)] p-5 text-sm text-[var(--al-glow)] shadow-lg">
{`const client = new OpenAI({
  apiKey: process.env.AGENTLEDGER_API_KEY,
  baseURL: "https://your-host/api/v1",
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
          <div key={item.title} className="rounded-2xl border border-[var(--al-line)] bg-[var(--al-panel)]/80 p-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--al-muted)]">{item.body}</p>
          </div>
        ))}
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">Pricing</h2>
        <p className="mt-2 text-[var(--al-muted)]">Subscription-ready from day one. Upgrade when agents leave sandbox.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { name: "Free", price: "$0", detail: "10k events · 1 project · soft alerts" },
            { name: "Pro", price: "$99", detail: "250k events · hard budgets · Slack alerts" },
            { name: "Team", price: "$299", detail: "1M events · audit export · payload retention" },
          ].map((plan) => (
            <div key={plan.name} className="rounded-2xl border border-[var(--al-line)] bg-[var(--al-panel)] p-6">
              <div className="text-sm uppercase tracking-wide text-[var(--al-muted)]">{plan.name}</div>
              <div className="mt-2 font-[family-name:var(--font-display)] text-4xl">{plan.price}<span className="text-base text-[var(--al-muted)]">/mo</span></div>
              <p className="mt-3 text-sm text-[var(--al-muted)]">{plan.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--al-line)] px-6 py-8 text-sm text-[var(--al-muted)]">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4">
          <span>© {new Date().getFullYear()} AgentLedger</span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/dpa">DPA</Link>
          <Link href="/api/health">Status</Link>
        </div>
      </footer>
    </div>
  );
}
