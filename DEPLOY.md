# Deploy AgentLedger

## Which platform for this test?

| Option | Best for | Caveat |
|---|---|---|
| **Railway (Hobby) — recommended first** | Real E2E test of proxy + budgets + dashboard | One project: Postgres + web |
| **Vercel + Railway/Neon Postgres** | Fast UI deploys, edge CDN | Serverless timeouts can cut long LLM streams; keep Postgres elsewhere |

**Recommendation:** start on **Railway** for this MVP test. The product is an LLM proxy — a long-lived Node server is a better fit than Vercel serverless for streaming/completions. Use Vercel later if you want a polished marketing front door.

---

## A) Railway (recommended)

### 1. Create project
1. New project → **Deploy from GitHub** (this repo, branch `cursor/agentledger-mvp` or `main`).
2. Add a **Postgres** plugin in the same project.
3. Railway will inject `DATABASE_URL`.

### 2. Service settings
Configs in [`railway.toml`](railway.toml):
- **Build:** `pnpm install && pnpm build`
- **Pre-deploy:** `pnpm db:migrate`
- **Start:** `pnpm start` (binds to Railway `PORT`)
- **Health:** `GET /api/health`

Root directory: **repo root** (monorepo).

### 3. Environment variables

Copy from [`apps/web/.env.example`](apps/web/.env.example). Minimum for a real closed test:

```bash
# Required
DATABASE_URL=<from Railway Postgres>
NEXT_PUBLIC_APP_URL=https://<your-railway-domain>
AGENTLEDGER_DEMO_MODE=false

# Auth (required when demo is false)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app

# At least one provider for live proxy
OPENAI_API_KEY=

# Billing (optional for first smoke; needed for checkout test)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO=
STRIPE_PRICE_TEAM=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### 4. First deploy checklist
1. Deploy web service.
2. Confirm `https://<domain>/api/health` → `{"status":"ok",...}`.
3. Sign up via Clerk → `/app`.
4. Create project → copy API key.
5. Call proxy with real OpenAI traffic.
6. Create a tiny hard budget → confirm HTTP **402**.
7. (Optional) Stripe webhook endpoint: `https://<domain>/api/stripe/webhook`.

### 5. Optional seed (demo data on staging)
Only if you want charts before real traffic:

```bash
railway run pnpm db:seed
```

Do **not** leave `AGENTLEDGER_DEMO_MODE=true` if you want real Clerk auth.

---

## B) Vercel (optional / later)

Config: [`apps/web/vercel.json`](apps/web/vercel.json).

1. Import repo in Vercel → **Root Directory = `apps/web`**.
2. Install/build commands come from `vercel.json` (run from monorepo root via `cd ../..`).
3. Add env vars (same list as above).
4. Attach an external Postgres (`DATABASE_URL` from Railway or Neon).
5. Run migrations separately (Vercel does not use `railway.toml` preDeploy):
   - local: `DATABASE_URL=... pnpm db:migrate`, or
   - CI job on deploy.

**Vercel note:** Hobby/serverless function limits can interrupt long streaming LLM responses. Fine for dashboard + short calls; weak for production proxy load.

---

## Production vs staging flags

| Setting | Staging closed test | Public prod later |
|---|---|---|
| `AGENTLEDGER_DEMO_MODE` | `false` (or `true` only for no-Clerk UI peek) | `false` |
| Clerk | Required for real auth test | Required |
| Provider key | Required for proxy test | Required |
| Stripe | Optional first day | Required to sell |
| Rate limits | In-memory (ok for solo test) | Move to Redis/Upstash |

---

## Smoke test commands (after deploy)

```bash
# Health
curl -s https://<domain>/api/health

# Open a run (no provider key needed)
curl -s https://<domain>/api/v1/runs \
  -H "authorization: Bearer al_live_…" \
  -H "content-type: application/json" \
  -d '{"agent":"staging-bot","team":"platform"}'

# Live proxy (needs OPENAI_API_KEY on server)
curl -s https://<domain>/api/v1/chat/completions \
  -H "authorization: Bearer al_live_…" \
  -H "content-type: application/json" \
  -H "x-al-agent: staging-bot" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"ping"}]}'
```
