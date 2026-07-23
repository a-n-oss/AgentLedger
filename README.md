# AgentLedger

The control plane for AI agent spend and actions.

Hard budgets, agent-run ledgers, chargeback by team/product, and audit export — not another LLM trace debugger.

## Quick start

```bash
# 1. Start Postgres (maps host :5433 → container :5432)
docker compose up -d

# 2. Configure env
cp apps/web/.env.example apps/web/.env.local
# DATABASE_URL should be postgres://postgres:postgres@localhost:5433/agentledger

# 3. Install, migrate, seed
pnpm install
pnpm db:migrate
pnpm db:seed
# Seed prints a one-time Demo API key — save it.

# 4. Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (demo mode opens `/app` without Clerk).

### Demo mode (no Clerk/Stripe keys)

Set `AGENTLEDGER_DEMO_MODE=true` in `.env.local`. The app uses a local demo org and bypasses Clerk auth so you can explore the dashboard immediately.

### Proxy install (customer apps)

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AGENTLEDGER_API_KEY,
  baseURL: "http://localhost:3000/api/v1",
  defaultHeaders: {
    "x-al-agent": "support-triage",
    "x-al-team": "support",
  },
});
```

Point `OPENAI_API_KEY` / provider keys on the AgentLedger server (not the client) via env.

## Monorepo

- `apps/web` — Next.js marketing site, dashboard, proxy, ingest APIs
- `packages/db` — Drizzle schema + migrations
- `packages/shared` — pricing, plans, zod schemas
- `packages/sdk` — `@agentledger/node` run ledger client

## Plans

| Plan | Price | Events/mo | Hard budgets |
|------|-------|-----------|--------------|
| Free | $0 | 10k | Soft alerts only |
| Pro | $99 | 250k | Yes |
| Team | $299 | 1M | Yes + audit export |

## License

Proprietary — all rights reserved.
