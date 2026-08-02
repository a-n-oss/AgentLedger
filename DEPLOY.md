# Deploy AgentLedger

AgentLedger is **self-host first**. Run the proxy and dashboard on your own Postgres + Node host. The public Railway site is **docs + seeded demo only** — do not point production agent traffic at it.

| Path | Best for | Notes |
|---|---|---|
| **Self-host (recommended)** | Real proxy, budgets, your provider keys | Docker Compose Postgres + `pnpm` app |
| **Public demo (Railway)** | Marketing, docs, UI walkthrough | `AGENTLEDGER_DEMO_MODE=true`; no live LLM proxy |
| **Vercel (optional)** | Marketing front door only | Poor fit for long LLM streams |

---

## A) Self-host (recommended)

### 1. Postgres
```bash
docker compose up -d
```
Host port **5433** → container `5432`. Default URL:

```text
postgres://postgres:postgres@localhost:5433/agentledger
```

### 2. Environment
```bash
cp apps/web/.env.example apps/web/.env.local
```

Minimum for a local control plane:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5433/agentledger
NEXT_PUBLIC_APP_URL=http://localhost:3000
AGENTLEDGER_DEMO_MODE=true   # set false + Clerk for multi-user auth
OPENAI_API_KEY=              # required only for live proxy
```

For a private multi-user install:

```bash
AGENTLEDGER_DEMO_MODE=false
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app
```

Stripe is optional (self-host billing UI works without it; checkout shows a demo notice).

### 3. Install and run
```bash
pnpm install
pnpm db:migrate
pnpm db:seed          # optional charts + demo API key
pnpm dev              # http://localhost:3000
```

Production-style process on your host:

```bash
pnpm build
pnpm start            # binds 0.0.0.0; set PORT if needed
```

### 4. Smoke checks
```bash
curl -s http://localhost:3000/api/health

# Run ingest (no provider key)
curl -s http://localhost:3000/api/v1/runs \
  -H "authorization: Bearer al_live_…" \
  -H "content-type: application/json" \
  -d '{"agent":"local-bot","team":"platform"}'

# Live proxy (needs OPENAI_API_KEY on the server)
curl -s http://localhost:3000/api/v1/chat/completions \
  -H "authorization: Bearer al_live_…" \
  -H "content-type: application/json" \
  -H "x-al-agent: local-bot" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"ping"}]}'
```

See [README.md](README.md) Quick start and `/docs` in the app for the proxy SDK walkthrough.

---

## B) Public demo (Railway)

The linked Railway project hosts **docs + demo UI** for people who want to click around without cloning.

Configs in [`railway.toml`](railway.toml):

- **Build:** `pnpm install && pnpm build`
- **Pre-deploy:** `pnpm db:migrate`
- **Start:** `pnpm start`
- **Health:** `GET /api/health`

Required env on the demo service:

```bash
DATABASE_URL=<Railway Postgres>
NEXT_PUBLIC_APP_URL=https://<your-railway-domain>
AGENTLEDGER_DEMO_MODE=true
```

Then seed once:

```bash
railway run pnpm db:seed
```

**Do not** set provider keys on the public demo (avoids turning it into an open proxy).  
**Do not** use the Railway URL as `baseURL` for production agents — self-host instead.

Clerk keys may remain on the service; demo mode bypasses them for `/app`.

---

## C) Vercel (optional marketing only)

Config: [`apps/web/vercel.json`](apps/web/vercel.json). Suitable for a static marketing front door with an external Postgres. Serverless timeouts are a poor fit for the LLM proxy — keep the control plane self-hosted.

---

## Flag cheat sheet

| Setting | Self-host (local) | Self-host (private multi-user) | Public Railway demo |
|---|---|---|---|
| `AGENTLEDGER_DEMO_MODE` | `true` | `false` | `true` |
| Clerk | Optional | Required | Unused when demo on |
| Provider key | For live proxy | For live proxy | Leave unset |
| Stripe | Optional | Optional | Leave unset |
