import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const cloneBlock = `git clone https://github.com/a-n-oss/AgentLedger.git
cd AgentLedger
docker compose up -d`;

const envBlock = `cp apps/web/.env.example apps/web/.env.local

# Required for BYOK encryption (hosted or multi-project):
#   openssl rand -base64 32  →  AGENTLEDGER_SECRETS_KEY=

# Self-host single-tenant fallback (optional if you use BYOK UI):
#   OPENAI_API_KEY=sk-...

# Invite-only hosted auth (recommended):
#   AGENTLEDGER_DEMO_MODE=false
#   NEXT_PUBLIC_CLERK_INVITE_ONLY=true
#   + Clerk keys`;

const installBlock = `pnpm install
pnpm db:migrate
pnpm db:seed   # optional sample charts
pnpm dev       # http://localhost:3000`;

const inviteBlock = `# Load CLERK_SECRET_KEY from apps/web/.env.local
pnpm invite -- user@example.com
pnpm invite -- alice@acme.com bob@acme.com`;

const openaiBlock = `import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AGENTLEDGER_API_KEY!,
  baseURL: "http://localhost:3000/api/v1",
  defaultHeaders: {
    "x-al-agent": "support-triage",
    "x-al-team": "support",
  },
});`;

const secretsBlock = `# Generate once per environment — never commit
openssl rand -base64 32
# Paste into apps/web/.env.local as AGENTLEDGER_SECRETS_KEY=...`;

export default function DocsPage() {
  return (
    <div className="docs-shell min-h-screen text-[var(--al-ink)]">
      <SiteHeader variant="simple" />
      <div className="mx-auto max-w-3xl px-6 pb-14 pt-2 md:pb-16">
        <article className="docs-prose">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">
            AgentLedger docs
          </h1>
          <p className="mt-4 text-lg text-[var(--al-muted)]">
            Self-host or run a private invite-only control plane with <strong>BYOK</strong> (bring
            your own provider keys). Live console is <code>/app</code> (Clerk). SaaS subscriptions
            are deferred — installs unlock full entitlements without Stripe. Optional local{" "}
            <code>/demo</code> exists only when <code>AGENTLEDGER_DEMO_MODE=true</code>.
          </p>

          <h2 className="mt-12 text-2xl font-semibold">1. Quick start (self-host)</h2>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {cloneBlock}
          </pre>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {envBlock}
          </pre>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {installBlock}
          </pre>

          <h2 id="byok" className="mt-12 text-2xl font-semibold">
            2. Hosted BYOK (safest token keys)
          </h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Do <strong>not</strong> put customer OpenAI keys in server env and redeploy. Each project
            stores its own key encrypted at rest.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[var(--al-muted)]">
            <li>
              Set a master key (32 bytes, base64):
              <pre className="al-code mt-2 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
                {secretsBlock}
              </pre>
            </li>
            <li>
              Open a project → <strong>Provider keys (BYOK)</strong> → paste xAI / OpenAI /
              Anthropic / Google key → Save. Only a hint like <code>…abcd</code> is shown afterward.
              Models containing <code>grok</code> auto-route to xAI (<code>https://api.x.ai/v1</code>
              ).
            </li>
            <li>
              Proxy resolves keys in order: <strong>project BYOK</strong> → then optional env
              fallback for single-tenant self-host.
            </li>
            <li>Revoke in the UI anytime — no redeploy.</li>
          </ol>

          <h2 id="invite-only" className="mt-12 text-2xl font-semibold">
            3. Invite-only sign-up
          </h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Disable public registration in Clerk and set:
          </p>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {`AGENTLEDGER_DEMO_MODE=false
NEXT_PUBLIC_CLERK_INVITE_ONLY=true`}
          </pre>
          <p className="mt-3 text-[var(--al-muted)]">
            In{" "}
            <a
              href="https://dashboard.clerk.com"
              className="font-medium text-[var(--al-accent)] underline"
            >
              Clerk Dashboard
            </a>
            : User &amp; authentication → restrict sign-ups / use invitations only.{" "}
            <code>/sign-up</code> shows “Invite only” when the flag is on.
          </p>
          <p className="mt-3 text-[var(--al-muted)]">
            Invite users from your machine (never commit <code>CLERK_SECRET_KEY</code>):
          </p>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {inviteBlock}
          </pre>

          <h2 id="env-fallback" className="mt-12 text-2xl font-semibold">
            4. Self-host env fallback
          </h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Single-tenant installs can skip the BYOK UI and set <code>XAI_API_KEY</code> /{" "}
            <code>OPENAI_API_KEY</code> (and/or Anthropic / Google) on the server. Prefer BYOK when
            multiple teams share one AgentLedger.
          </p>

          <h2 className="mt-12 text-2xl font-semibold">5. Create a project + AgentLedger API key</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            In{" "}
            <Link href="/app/projects" className="font-medium text-[var(--al-accent)] underline">
              Projects
            </Link>
            , copy the <code>al_live_…</code> key (shown once). That key authenticates agents to{" "}
            <em>your</em> AgentLedger — it is not the OpenAI key.
          </p>
          <pre className="al-code mt-4 overflow-x-auto rounded-xl p-4 text-[0.9rem] leading-relaxed">
            {openaiBlock}
          </pre>

          <h2 id="alerts" className="mt-12 text-2xl font-semibold">
            6. Email budget alerts
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[var(--al-muted)]">
            <li>
              Set <code>RESEND_API_KEY</code> and a verified <code>ALERT_FROM_EMAIL</code> in{" "}
              <code>.env.local</code>.
            </li>
            <li>
              Add an email channel under{" "}
              <Link href="/app/alerts" className="font-medium text-[var(--al-accent)] underline">
                Alerts
              </Link>
              .
            </li>
            <li>
              Click <strong>Send test alert</strong> (no spend required). Leave{" "}
              <code>INNGEST_EVENT_KEY</code> empty for inline delivery.
            </li>
            <li>
              For a real threshold: create a tiny soft budget, then{" "}
              <code>POST /api/v1/runs/spans</code> with <code>costUsd</code> large enough to cross
              it.
            </li>
          </ol>

          <h2 className="mt-12 text-2xl font-semibold">7. Hard budgets</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Create a monthly project budget. When spent ≥ amount on a hard budget, the proxy returns
            HTTP <strong>402</strong>. Self-host installs unlock hard budgets without a paid plan.
          </p>

          <h2 className="mt-12 text-2xl font-semibold">8. Billing (deferred)</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Stripe Checkout / Customer Portal are <strong>not</strong> offered yet. Entitlements are
            unlocked for self-host. Webhook and checkout code remain inert unless you set{" "}
            <code>AGENTLEDGER_BILLING_ENABLED=true</code> (not recommended until monetization
            returns).
          </p>

          <h2 className="mt-12 text-2xl font-semibold">More</h2>
          <p className="mt-3 text-[var(--al-muted)]">
            Deploy notes:{" "}
            <a
              href="https://github.com/a-n-oss/AgentLedger/blob/main/DEPLOY.md"
              className="font-medium text-[var(--al-accent)] underline"
            >
              DEPLOY.md
            </a>
            .
          </p>
        </article>
      </div>
    </div>
  );
}
