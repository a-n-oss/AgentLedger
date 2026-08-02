## Learned User Preferences

- Solo entrepreneurship is how they build, not the ICP — do not scope products as solo-founder-only tools
- Comfortable with AI-native development; wants production-grade, subscription-worthy MVPs
- Prefers detailed architecture and flow documentation that explains how the product works without requiring provider keys for a live demo
- Landing and app should use an engaging light/dark theme; docs may stay calmer and more reader-friendly
- Feature branches use the `cursor/` name prefix
- Prefers custom branded sign-in/sign-up pages over default Clerk hosted UI
- Brand mark should be monochrome SVG (`currentColor`) and always paired with the AgentLedger wordmark in nav/headers

## Learned Workspace Facts

- This repo is AgentLedger — an AI agent ops and spend-control product (proxy, budgets, run ledger, dashboard); self-host is the intended production path
- Monorepo layout: `apps/web` plus `packages/{db,shared,sdk}`, managed with pnpm
- Stack centers on Next.js, Postgres (Docker Compose on port 5433 locally), Clerk or `AGENTLEDGER_DEMO_MODE`, and optional Stripe
- OpenAI-compatible proxy lives at `/api/v1` with agent/team attribution, cost logging, and hard budgets that return HTTP 402 when exceeded
- Local self-host works after `pnpm db:migrate` and `pnpm db:seed` without provider keys; `OPENAI_API_KEY` is only required for live LLM proxying on your host
- Railway deployment is public docs + seeded demo only (`AGENTLEDGER_DEMO_MODE=true`, no provider keys); see `DEPLOY.md`
- GitHub remote is `a-n-oss/AgentLedger` with GitHub Actions CI for install, typecheck, test, build, migrate, seed, and lint
- Custom Clerk auth lives at `/sign-in` and `/sign-up` for private multi-user self-host; demo mode skips Clerk
