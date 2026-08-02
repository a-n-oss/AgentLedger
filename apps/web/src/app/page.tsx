import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen text-[var(--al-ink)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          AgentLedger
        </div>
        <nav className="flex items-center gap-3 text-sm sm:gap-4">
          <Link href="/docs" className="text-[var(--al-muted)] hover:text-[var(--al-ink)]">
            Docs
          </Link>
          <Link href="/#pricing" className="text-[var(--al-muted)] hover:text-[var(--al-ink)]">
            Pricing
          </Link>
          <ThemeToggle />
          <Link href="/sign-in">
            <Button size="sm" variant="accent">
              Sign in
            </Button>
          </Link>
        </nav>
      </header>

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
          Agent control plane
        </p>
        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          AgentLedger
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--al-muted)]">
          Hard budgets, chargeback, and an audit ledger for production AI agents — not another
          trace debugger.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/sign-up">
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
        <pre className="al-code mt-12 max-w-2xl overflow-x-auto rounded-2xl p-5 text-sm shadow-[var(--al-shadow)]">
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
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">Pricing</h2>
        <p className="mt-2 text-[var(--al-muted)]">
          Subscription-ready from day one. Upgrade when agents leave sandbox.
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
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4">
          <span>© {new Date().getFullYear()} AgentLedger</span>
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
