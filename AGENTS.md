## Learned User Preferences

- Solo entrepreneurship is how they build, not the ICP — do not scope products as solo-founder-only tools
- Comfortable with AI-native development; wants production-grade, subscription-worthy MVPs
- Prefers detailed architecture and flow documentation that explains how the product works without requiring provider keys for a live demo
- Landing and app should use an engaging light/dark theme; docs may stay calmer and more reader-friendly
- Feature branches use the `cursor/` name prefix

## Learned Workspace Facts

- This repo is AgentLedger — an AI agent ops and spend-control SaaS MVP (proxy, budgets, run ledger, dashboard, billing)
- Monorepo layout: `apps/web` plus `packages/{db,shared,sdk}`, managed with pnpm
- Stack centers on Next.js, Postgres (Docker Compose on port 5433), Clerk or `AGENTLEDGER_DEMO_MODE`, and Stripe
- OpenAI-compatible proxy lives at `/api/v1` with agent/team attribution, cost logging, and hard budgets that return HTTP 402 when exceeded
- Local demo works after `pnpm db:migrate` and `pnpm db:seed` without provider keys; `OPENAI_API_KEY` is only required for live LLM proxying
- Intended deploy targets discussed: Vercel for the Next.js app and Railway as an all-in-one option with Postgres
