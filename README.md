# AgentLedger

**The control plane for AI agent spend and actions — self-host first.**

AgentLedger sits between your apps and LLM providers. It attributes every call to an agent/team, enforces hard spend caps, and keeps an audit ledger — without being another trace debugger (Langfuse) or router (Portkey).

Run it on your own Postgres + Node host. The public Railway site is **docs + a seeded demo** only — not a production proxy. If you have **no OpenAI/Anthropic/Google keys**, you can still explore the dashboard with seed data; provider keys are only required for the live LLM **proxy** on your host.

---

## Table of contents

1. [What problem it solves](#what-problem-it-solves)
2. [Mental model (how to think about it)](#mental-model-how-to-think-about-it)
3. [Architecture](#architecture)
4. [How a request flows](#how-a-request-flows)
5. [How agent runs work (SDK)](#how-agent-runs-work-sdk)
6. [Budgets and hard stops](#budgets-and-hard-stops)
7. [Auth, orgs, and demo mode](#auth-orgs-and-demo-mode)
8. [Billing and plans](#billing-and-plans)
9. [Alerts](#alerts)
10. [Explore without provider keys](#explore-without-provider-keys)
11. [Quick start](#quick-start)
12. [Environment variables](#environment-variables)
13. [Repo layout](#repo-layout)
14. [API reference](#api-reference)
15. [UI map](#ui-map)
16. [Verification](#verification)

---

## What problem it solves

Teams shipping agents hit three pains:

1. **Surprise bills** — spend is invisible until the provider invoice lands.
2. **No chargeback** — finance cannot answer “which agent / team spent this?”
3. **No kill switch** — soft alerts still let an agent burn money overnight.

AgentLedger’s wedge:

| Capability | What it does |
|---|---|
| Proxy | Swap OpenAI `baseURL` → AgentLedger logs cost + attribution |
| Hard budgets | When spent ≥ cap on a hard budget → **HTTP 402** (request blocked) |
| Run ledger | Multi-step agents record LLM + tool/MCP spans under one `runId` |
| Audit export | CSV/JSON of events (Team plan) |

---

## Mental model (how to think about it)

```text
Your app / agent
      │
      │  OpenAI SDK (or @agentledger/sdk)
      │  Authorization: Bearer al_live_…
      │  Headers: x-al-agent, x-al-team, x-al-user
      ▼
┌─────────────────────────────────────┐
│           AgentLedger               │
│  1. Validate API key                │
│  2. Rate limit + plan quota         │
│  3. Check hard budgets              │
│  4a. PROXY: forward to OpenAI/etc.  │  ← needs provider keys on server
│  4b. SDK:  record run/span only     │  ← works without provider keys
│  5. Write event + update spend      │
└─────────────────────────────────────┘
      │
      ▼
  Dashboard / alerts / Stripe
```

**Two ways data enters the system:**

1. **Proxy path** — customer apps call AgentLedger as if it were OpenAI. AgentLedger calls the real provider, then logs tokens/cost.
2. **SDK path** — customer apps call AgentLedger’s run APIs directly to open/close runs and attach tool/LLM spans (useful even if they call providers themselves).

---

## Architecture

```mermaid
flowchart TB
  subgraph clients [Customer systems]
    App[App or Agent Runtime]
    OpenAISDK[OpenAI-compatible SDK]
    ALSDK["@agentledger/sdk"]
  end

  subgraph web [apps/web - Next.js]
    UI[Dashboard /app]
    Proxy["/api/v1/* proxy"]
    RunsAPI["/api/v1/runs*"]
    StripeWH["/api/stripe/webhook"]
    InngestAPI["/api/inngest"]
  end

  subgraph pkgs [Packages]
    Shared["@agentledger/shared\nplans + pricing + zod"]
    DB["@agentledger/db\nDrizzle schema"]
  end

  subgraph data [Postgres]
    Tables[(orgs projects keys\nagents budgets events runs)]
  end

  subgraph external [External]
    Providers[OpenAI / Anthropic / Google]
    Stripe[Stripe]
    Slack[Slack / Resend]
  end

  App --> OpenAISDK --> Proxy
  App --> ALSDK --> RunsAPI
  Proxy --> Providers
  Proxy --> DB
  RunsAPI --> DB
  UI --> DB
  StripeWH --> DB
  Proxy --> Shared
  RunsAPI --> Shared
  DB --> Tables
  Stripe --> StripeWH
  InngestAPI --> Slack
```

### Stack

| Layer | Choice |
|---|---|
| App | Next.js 15 App Router + TypeScript |
| Auth | Clerk (or demo mode) |
| DB | Postgres + Drizzle ORM |
| Billing | Stripe Checkout + Customer Portal |
| Jobs | Inngest (optional; alerts also run inline) |
| Email | Resend (optional) |

---

## How a request flows

### Proxy (live LLM calls)

Route: [`apps/web/src/app/api/v1/[...path]/route.ts`](apps/web/src/app/api/v1/[...path]/route.ts)

```mermaid
sequenceDiagram
  participant App
  participant Proxy as AgentLedger Proxy
  participant DB as Postgres
  participant Prov as LLM Provider

  App->>Proxy: POST /api/v1/chat/completions<br/>Bearer al_live_… + x-al-agent
  Proxy->>DB: Lookup hashed API key
  alt invalid key
    Proxy-->>App: 401
  end
  Proxy->>DB: Rate limit + quota + hard budget
  alt hard budget exceeded
    Proxy-->>App: 402
  end
  Proxy->>Prov: Forward with server OPENAI_API_KEY etc.
  alt provider key missing
    Proxy-->>App: 503 Provider not configured
  end
  Prov-->>Proxy: Completion + usage tokens
  Proxy->>DB: Insert event + recordSpend
  Proxy-->>App: Provider response + x-al-cost-usd
```

**Attribution headers** (set by the customer app):

| Header | Purpose |
|---|---|
| `Authorization: Bearer al_live_…` | Project API key (created in UI) |
| `x-al-agent` | Agent name (auto-creates agent row) |
| `x-al-team` | Team label for chargeback |
| `x-al-user` | End-user label |
| `x-al-run-id` | Optional: attach proxy call to an SDK run |
| `x-al-provider` | Optional force: `openai` \| `anthropic` \| `google` |

**Costing:** tokens × model price table in [`packages/shared/src/pricing.ts`](packages/shared/src/pricing.ts). Unknown models are estimated and flagged.

**Streaming:** SSE is passed through. Cost is logged as a provisional estimate (token usage is incomplete mid-stream).

### Customer install (when you have a provider key on the server)

```ts
import OpenAI from "openai";

const openai = new OpenAI({
  // This is the AgentLedger project key — NOT the OpenAI key
  apiKey: process.env.AGENTLEDGER_API_KEY!,
  baseURL: "http://localhost:3000/api/v1",
  defaultHeaders: {
    "x-al-agent": "support-triage",
    "x-al-team": "support",
  },
});

await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Hello" }],
});
```

The **OpenAI/Anthropic/Google keys live only on the AgentLedger server** (`OPENAI_API_KEY`, etc.). Customers never need those keys in their apps when using the proxy.

---

## How agent runs work (SDK)

For multi-step agents (LLM + tools + MCP), use [`@agentledger/sdk`](packages/sdk):

```mermaid
sequenceDiagram
  participant Agent
  participant SDK as @agentledger/sdk
  participant API as /api/v1/runs*
  participant DB as Postgres

  Agent->>SDK: openRun({ agent, team })
  SDK->>API: POST /api/v1/runs
  API->>DB: Insert run status=running
  API-->>SDK: { runId }
  Agent->>SDK: span({ runId, type: "llm" | "tool" | "mcp" })
  SDK->>API: POST /api/v1/runs/spans
  API->>DB: Insert event + spend
  Agent->>SDK: endRun({ runId, status: "completed" })
  SDK->>API: POST /api/v1/runs/end
  API->>DB: Set endedAt + status
```

```ts
import { createClient } from "@agentledger/sdk";

const al = createClient({
  apiKey: process.env.AGENTLEDGER_API_KEY!,
  baseUrl: "http://localhost:3000",
});

const { runId } = await al.openRun({ agent: "support-triage", team: "support" });

await al.span({
  runId,
  type: "tool",
  toolName: "lookup_order",
  latencyMs: 80,
});

await al.span({
  runId,
  type: "llm",
  model: "gpt-4o-mini",
  tokensIn: 1200,
  tokensOut: 400,
});

await al.endRun({ runId, status: "completed" });
```

**Important:** `openRun` and the **proxy** enforce hard budgets. `span` records cost but does not re-block mid-run. Use budgets + proxy for the kill switch.

Runs appear under **App → Runs**.

---

## Budgets and hard stops

Implemented in [`apps/web/src/lib/budgets.ts`](apps/web/src/lib/budgets.ts).

```text
Budget {
  scope:  project | agent
  period: daily | monthly
  amountUsd
  hard:   true | false
  alertThresholds: [50, 80, 100]   // percent
}
```

| Situation | Behavior |
|---|---|
| Soft budget crossed | Alerts fire; traffic continues |
| Hard budget crossed **and** plan allows hard budgets (Pro/Team) | Proxy / `openRun` return **402** |
| Free plan | Soft alerts only — no hard stop |

Spend is tracked in `budget_usages` per period window (UTC day or month).

---

## Auth, orgs, and demo mode

```mermaid
flowchart LR
  Demo["AGENTLEDGER_DEMO_MODE=true"] --> DemoSession["Fixed demo owner session\norg_demo_agentledger"]
  Clerk["Clerk configured"] --> Protect["/app requires sign-in"]
  Protect --> Org["Clerk org or personal org"]
  DemoSession --> Dashboard
  Org --> Dashboard
  APIKey["Bearer al_live_…"] --> ProxyAndRuns["Proxy + Runs APIs"]
```

- **Dashboard auth** = Clerk session **or** demo session.
- **Proxy/SDK auth** = project API key only (hashed at rest; raw key shown once).

---

## Billing and plans

From [`packages/shared/src/plans.ts`](packages/shared/src/plans.ts):

| Plan | Price | Events/mo | Hard budgets | Audit export | Payload retain |
|---|---|---|---|---|---|
| Free | $0 | 10k | No | No | No |
| Pro | $99 | 250k | Yes | No | No |
| Team | $299 | 1M | Yes | Yes | Yes |

Stripe Checkout + Customer Portal update `organizations.plan` via webhook ([`apps/web/src/app/api/stripe/webhook/route.ts`](apps/web/src/app/api/stripe/webhook/route.ts)). Without Stripe keys, billing buttons redirect to a demo notice.

---

## Alerts

When spend crosses 50% / 80% / 100% of a budget:

1. Prefer Inngest event `budget/alert` if configured.
2. Otherwise send inline to configured Slack webhooks / Resend emails.
3. If no channels exist → log to server console.

Configure channels under **App → Alerts**.

---

## Explore without provider keys

You do **not** need `OPENAI_API_KEY` to understand or demo the product UI.

### What works out of the box (demo mode + seed)

| Feature | Works? | Notes |
|---|---|---|
| Landing, docs, legal pages | Yes | Static |
| `/app` overview charts | Yes | Seeded spend series |
| Projects / API keys | Yes | Create, rotate, revoke |
| Agents list | Yes | From seed + headers |
| Runs explorer | Yes | Seed includes a completed run |
| Budgets CRUD | Yes | Create hard/soft caps |
| Alerts channels | Yes | Add Slack/email targets |
| Audit export | Yes | Seed org is Team plan |
| Run SDK ingest | Yes | `openRun` / `span` / `endRun` with demo API key |
| Live LLM proxy | **No** | Returns **503** until a provider key is set |
| Real Stripe checkout | **No** | Shows demo billing notice |

### Walkthrough (no provider keys)

1. Start Postgres + migrate + seed (see Quick start).
2. Open http://localhost:3000/app — seeded KPIs and charts.
3. Open **Projects** → open the seeded project → copy install snippet (use the API key printed by `pnpm db:seed`).
4. Open **Agents** / **Runs** / **Budgets** to see seeded entities.
5. Optionally hit the SDK (still no provider key needed):

```bash
# Replace with the key printed by db:seed
export AL_KEY=al_live_…

curl -s http://localhost:3000/api/v1/runs \
  -H "authorization: Bearer $AL_KEY" \
  -H "content-type: application/json" \
  -d '{"agent":"demo-agent","team":"platform"}'
```

6. Refresh **Runs** — your new run appears.

### What a provider key unlocks

Set `OPENAI_API_KEY=` (or Anthropic/Google) in `apps/web/.env.local`, restart `pnpm dev`, then:

```bash
curl -s http://localhost:3000/api/v1/chat/completions \
  -H "authorization: Bearer $AL_KEY" \
  -H "content-type: application/json" \
  -H "x-al-agent: support-triage" \
  -H "x-al-team: support" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"ping"}]}'
```

You’ll see a real completion, `x-al-cost-usd` response header, and a new event on the overview chart.

---

## Deploy

**Self-host** is the intended production path (Docker Compose Postgres + `pnpm`). The Railway deployment in this project is for **public docs + demo** only (`AGENTLEDGER_DEMO_MODE=true`, no provider keys).

See **[DEPLOY.md](DEPLOY.md)** for self-host steps, demo-site notes, and smoke checks. Configs: [`railway.toml`](railway.toml) (demo), [`apps/web/vercel.json`](apps/web/vercel.json) (optional marketing).

## Quick start

```bash
# 1. Postgres on host port 5433
docker compose up -d

# 2. Env
cp apps/web/.env.example apps/web/.env.local
# Defaults already use:
#   DATABASE_URL=postgres://postgres:postgres@localhost:5433/agentledger
#   AGENTLEDGER_DEMO_MODE=true

# 3. Install + schema + demo data
pnpm install
pnpm db:migrate
pnpm db:seed
# ← save the printed Demo API key

# 4. App
pnpm dev
```

Open:

- Marketing: http://localhost:3000  
- App: http://localhost:3000/app  
- Docs: http://localhost:3000/docs  
- Health: http://localhost:3000/api/health  

---

## Environment variables

| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection |
| `AGENTLEDGER_DEMO_MODE` | Recommended locally | `true` skips Clerk; uses demo org |
| `SEED_CLERK_ORG_ID` | Optional | Demo/seed org id (default `org_demo_agentledger`) |
| `NEXT_PUBLIC_APP_URL` | Yes for links/Stripe | e.g. `http://localhost:3000` |
| `OPENAI_API_KEY` | Only for proxy | Upstream OpenAI |
| `ANTHROPIC_API_KEY` | Only for proxy | Upstream Anthropic |
| `GOOGLE_API_KEY` | Only for proxy | Upstream Google |
| Clerk keys | Only if demo off | Real multi-user auth |
| Stripe keys | Only for live billing | Checkout / portal / webhooks |
| `RESEND_API_KEY` | Optional | Email budget alerts |
| `INNGEST_*` | Optional | Async alert delivery |

See [`apps/web/.env.example`](apps/web/.env.example).

---

## Repo layout

```text
apps/web/                 Next.js UI + APIs
  src/app/api/v1/         Proxy + run ingest
  src/app/app/            Authenticated dashboard
  src/lib/                Budgets, auth, proxy helpers, Stripe
packages/db/              Drizzle schema, migrate, seed
packages/shared/          Plans, pricing, Zod schemas
packages/sdk/             @agentledger/sdk client
docker-compose.yml        Local Postgres (:5433)
```

---

## API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `*` | `/api/v1/[...path]` | API key | OpenAI-compatible proxy |
| `POST` | `/api/v1/runs` | API key | Open a run |
| `POST` | `/api/v1/runs/spans` | API key | Attach span/event |
| `POST` | `/api/v1/runs/end` | API key | Complete a run |
| `POST` | `/api/stripe/webhook` | Stripe signature | Plan sync |
| `GET/POST` | `/api/inngest` | Inngest | Alert worker |
| `GET` | `/api/health` | none | Liveness + DB check |

### Common proxy status codes

| Code | Meaning |
|---|---|
| 401 | Missing/invalid API key |
| 402 | Hard budget or free-plan quota exceeded |
| 429 | Rate limited |
| 503 | Provider API key not configured on server |

---

## UI map

| Route | What you’ll see |
|---|---|
| `/` | Product landing + pricing |
| `/docs` | Proxy + SDK quickstart |
| `/app` | 30-day spend KPIs + charts |
| `/app/projects` | Projects + create form |
| `/app/projects/[id]` | API keys + install snippet |
| `/app/agents` | Spend by agent |
| `/app/runs` | Multi-step run list |
| `/app/budgets` | Hard/soft budget config |
| `/app/alerts` | Slack/email channels |
| `/app/export` | CSV/JSON audit download (Team) |
| `/app/settings/billing` | Plan + Stripe actions |

---

## Verification

```bash
pnpm --filter @agentledger/shared test
pnpm --filter @agentledger/sdk test
pnpm --filter @agentledger/web test
pnpm --filter @agentledger/web test:e2e   # Playwright (dev server)
```

---

## License

Proprietary — all rights reserved.
