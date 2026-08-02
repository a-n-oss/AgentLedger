# Deploy AgentLedger

AgentLedger is designed to run as **your** control plane. Use **BYOK** (encrypted per-project provider keys) on hosted/private installs so you never put customer OpenAI keys in env and redeploy. The Railway project in this repo is a **docs + seeded demo** only.

| Path | Purpose |
|---|---|
| **A) Self-host / private hosted** | Production: Postgres + invite-only Clerk + BYOK (or env fallback) |
| **B) Public Railway demo** | Docs + demo UI — no provider secrets |

Stripe subscription tiers are deferred while BYOK is the primary model.

---

## A) Self-host / private hosted (recommended)

### 1. Database
```bash
docker compose up -d
# DATABASE_URL=postgres://postgres:postgres@localhost:5433/agentledger
```

Or any managed Postgres (Neon, RDS, Railway Postgres for a private instance, etc.).

### 2. Environment
```bash
cp apps/web/.env.example apps/web/.env.local
```

Minimum local explore (demo mode):

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5433/agentledger
NEXT_PUBLIC_APP_URL=http://localhost:3000
AGENTLEDGER_DEMO_MODE=true
```

Private hosted / multi-user (invite-only + BYOK):

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

# Budget alert smoke (optional)
RESEND_API_KEY=
ALERT_FROM_EMAIL=alerts@yourdomain.com
```

In [Clerk Dashboard](https://dashboard.clerk.com): disable public sign-ups / use invitations only.

### 3. Install and run
```bash
pnpm install
pnpm db:migrate
pnpm db:seed          # optional charts + demo API key
pnpm dev              # http://localhost:3000
```

Then: create a project → **Provider keys (BYOK)** → paste OpenAI key → use `al_live_…` with `/api/v1`.

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

## B) Public demo (Railway)

Configs in [`railway.toml`](railway.toml). Required env:

```bash
DATABASE_URL=<Railway Postgres>
NEXT_PUBLIC_APP_URL=https://<your-railway-domain>
AGENTLEDGER_DEMO_MODE=true
```

```bash
railway run pnpm db:seed
```

**Do not** set `OPENAI_API_KEY`, `AGENTLEDGER_SECRETS_KEY`, or project BYOK on the public demo.

---

## C) Vercel (optional marketing only)

Config: [`apps/web/vercel.json`](apps/web/vercel.json). Keep the LLM proxy on a long-lived host.

---

## Flag cheat sheet

| Setting | Local explore | Private hosted | Public Railway |
|---|---|---|---|
| `AGENTLEDGER_DEMO_MODE` | `true` | `false` | `true` |
| `NEXT_PUBLIC_CLERK_INVITE_ONLY` | — | `true` | — |
| `AGENTLEDGER_SECRETS_KEY` | For BYOK UI | Required for BYOK | Leave unset |
| Provider key | BYOK or env | BYOK preferred | Leave unset |
| Stripe | Deferred | Deferred | Leave unset |
