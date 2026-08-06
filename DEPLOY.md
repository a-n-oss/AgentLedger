# Deploy AgentLedger

AgentLedger is **self-host first**: your control plane, invite-only Clerk, and **BYOK** (encrypted per-project provider keys). SaaS subscriptions are deferred — installs unlock full entitlements without Stripe.

| Path | Purpose |
|---|---|
| **A) Self-host / private hosted** | Production: Postgres + invite-only Clerk + BYOK (or env fallback); `/app` |
| **B) Optional local demo** | Seeded UI at `/demo` only when `AGENTLEDGER_DEMO_MODE=true` (local explore) |

---

## A) Self-host / private hosted (recommended)

### 1. Database
```bash
docker compose up -d
# DATABASE_URL=postgres://postgres:postgres@localhost:5433/agentledger
```

Or any managed Postgres (Neon, RDS, Railway Postgres, etc.).

### 2. Environment
```bash
cp apps/web/.env.example apps/web/.env.local
```

Private hosted / multi-user (`/app` + invite-only + BYOK):

```bash
AGENTLEDGER_DEMO_MODE=false
NEXT_PUBLIC_CLERK_INVITE_ONLY=true
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app

# Master key for AES-GCM BYOK (required to save keys in UI)
# openssl rand -base64 32
AGENTLEDGER_SECRETS_KEY=

# Optional single-tenant fallback if a project has no BYOK secret
OPENAI_API_KEY=
XAI_API_KEY=

# Budget alerts (Resend)
RESEND_API_KEY=
ALERT_FROM_EMAIL=onboarding@resend.dev   # or your verified domain sender

NEXT_PUBLIC_APP_URL=https://your-host

# Billing is deferred — leave unset (do not enable SaaS Checkout yet)
# AGENTLEDGER_BILLING_ENABLED=true
```

Optional local explore without Clerk (not the production path):

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5433/agentledger
NEXT_PUBLIC_APP_URL=http://localhost:3000
AGENTLEDGER_DEMO_MODE=true
```

In [Clerk Dashboard](https://dashboard.clerk.com): disable public sign-ups / use invitations only.

### Invite users (secure local script)

Public sign-up is gated when `NEXT_PUBLIC_CLERK_INVITE_ONLY=true`. Invite from your machine:

```bash
# Requires CLERK_SECRET_KEY in apps/web/.env.local (never commit secrets)
pnpm invite -- user@example.com
pnpm invite -- alice@acme.com bob@acme.com
```

The script uses the Clerk Backend API (`invitations.createInvitation`), prints invitation id/status (and invite URL when Clerk returns one), and emails the recipient. Sign-in stays at `/sign-in`.

### Billing (deferred — reactivation path)

Stripe Checkout / Customer Portal / plan paywalls are **off** by default. Self-host orgs receive full Team-level entitlements (hard budgets, audit export, Slack alerts, payload retention) without a subscription.

Webhook at `/api/stripe/webhook` returns early when billing is disabled (`apps/web/src/lib/billing.ts`).

**Do not** set `AGENTLEDGER_BILLING_ENABLED=true` on the current Railway smoke host. When you are ready to monetize a **paid hosted** product:

1. Configure Stripe products/prices — see [`scripts/stripe-sandbox.md`](scripts/stripe-sandbox.md).
2. On that host only: `AGENTLEDGER_BILLING_ENABLED=true` plus `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_TEAM` (and publishable/metered keys as needed).
3. Register webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
4. Redeploy. Orgs then follow Stripe-synced plans instead of unlocked Team entitlements.

Self-host installs can leave billing unset forever.

### 3. Install and run
```bash
pnpm install
pnpm db:migrate
pnpm db:seed          # optional charts + sample API key
pnpm dev              # http://localhost:3000
```

Then: create a project → **Provider keys (BYOK)** → paste OpenAI/xAI key → use `al_live_…` with `/api/v1`.

### 4. Smoke checks
```bash
curl -s http://localhost:3000/api/health

# Live proxy (BYOK or OPENAI_API_KEY)
curl -s http://localhost:3000/api/v1/chat/completions \
  -H "authorization: Bearer al_live_…" \
  -H "content-type: application/json" \
  -H "x-al-agent: local-bot" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"ping"}]}'
```

Email: open `/app/alerts` → **Send test alert**.

See `/docs` for BYOK, invite-only, and alert details.

---

## B) Railway / private hosted deploy

Configs in [`railway.toml`](railway.toml). Ship via **GitHub merge → Railway auto-deploy** (do not `railway up` unless you explicitly need a CLI override).

**Networking posture:**

| Service | Exposure |
|---|---|
| AgentLedger (Next.js) | **Public** HTTP (custom domain / Railway URL) |
| Postgres | **Private** network only — app connects via internal `DATABASE_URL`; do not publish Postgres to the internet |

Recommended env on the app service:

```bash
DATABASE_URL=<Railway Postgres private URL>
NEXT_PUBLIC_APP_URL=https://<your-domain>
AGENTLEDGER_DEMO_MODE=false
NEXT_PUBLIC_CLERK_INVITE_ONLY=true
# + Clerk, AGENTLEDGER_SECRETS_KEY, Resend as needed
# Leave AGENTLEDGER_BILLING_ENABLED unset (billing deferred)
```

Keep provider secrets out of a public marketing-only host. Prefer BYOK on private installs. Email alerts load `/brand/email-logo.png` from `NEXT_PUBLIC_APP_URL` — ensure the public app can serve that static file.

---

## C) Vercel (optional marketing only)

Config: [`apps/web/vercel.json`](apps/web/vercel.json). Keep the LLM proxy on a long-lived host.

---

## Flag cheat sheet

| Setting | Local explore | Private hosted / Railway |
|---|---|---|
| `AGENTLEDGER_DEMO_MODE` | `true` → `/demo` | `false` (default product path) |
| Live console | `/app` needs Clerk | `/app` + invite-only |
| `NEXT_PUBLIC_CLERK_INVITE_ONLY` | — | `true` |
| Invite users | — | `pnpm invite -- email@…` |
| `AGENTLEDGER_SECRETS_KEY` | For BYOK UI | Required for BYOK |
| Provider key | BYOK or env | BYOK preferred |
| `AGENTLEDGER_BILLING_ENABLED` | unset | unset (billing deferred — do not enable on smoke) |
| Resend | Optional | For email alerts (static PNG logo) |
| Postgres | Local Docker `:5433` | Private Railway plugin |
