## Learned User Preferences

- Solo entrepreneurship is how they build, not the ICP — do not scope products as solo-founder-only tools
- Comfortable with AI-native development; wants production-grade, subscription-worthy MVPs
- Prefers detailed architecture and flow documentation that explains how the product works without requiring provider keys for a live demo
- Landing and app should use an engaging light/dark theme; docs may stay calmer and more reader-friendly
- Feature branches use the `cursor/` name prefix
- Prefers custom branded sign-in/sign-up pages over default Clerk hosted UI
- Brand mark should be monochrome SVG (`currentColor`) and always paired with the AgentLedger wordmark in nav/headers

## Learned Workspace Facts

- This repo is AgentLedger — an AI agent ops and spend-control product (proxy, budgets, run ledger, dashboard); production path is self-host or private hosted with invite-only Clerk + BYOK
- Monorepo layout: `apps/web` plus `packages/{db,shared,sdk}`, managed with pnpm
- Stack centers on Next.js, Postgres (Docker Compose on port 5433 locally), Clerk for `/app`, Stripe Checkout subscriptions, and Resend alerts
- OpenAI-compatible proxy lives at `/api/v1` with agent/team attribution, cost logging, and hard budgets that return HTTP 402 when exceeded
- Provider keys are per-project BYOK for `openai` | `anthropic` | `google` | `xai` (AES-GCM via `AGENTLEDGER_SECRETS_KEY`); Grok models auto-route to xAI; optional env fallbacks include `OPENAI_API_KEY` and `XAI_API_KEY`
- `AGENTLEDGER_DEMO_MODE=true` enables seeded `/demo` only; `/app` is always the live Clerk console
- Local explore: `pnpm db:migrate` + `pnpm db:seed`, open `/demo` without provider keys
- Railway hosts the invite-only BYOK app for smoke testing with demo mode off; `/demo` is only when demo mode is on — see `DEPLOY.md`
- GitHub remote is `a-n-oss/AgentLedger` with GitHub Actions CI for install, typecheck, test, build, migrate, seed, and lint
- Custom Clerk auth lives at `/sign-in` and `/sign-up`; `NEXT_PUBLIC_CLERK_INVITE_ONLY=true` gates sign-up UI
