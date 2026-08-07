## Learned User Preferences

- Solo entrepreneurship is how they build, not the ICP — do not scope products as solo-founder-only tools
- Comfortable with AI-native development; wants production-grade, subscription-worthy MVPs
- Prefers detailed architecture and flow documentation that explains how the product works without requiring provider keys for a live demo
- Landing and app should use an engaging light/dark theme; docs may stay calmer and more reader-friendly
- Feature branches use the `cursor/` name prefix
- Prefers custom branded sign-in/sign-up pages over default Clerk hosted UI
- Brand mark should be monochrome SVG (`currentColor`) and always paired with the AgentLedger wordmark in nav/headers
- Do not deploy via Railway CLI (`railway up`) unless the user explicitly overrides; rely on GitHub merge → Railway auto-deploy so CI failures are visible
- Product posture is self-host / private deploy first; hosted SaaS monetization is deferred

## Learned Workspace Facts

- This repo is AgentLedger — an AI agent ops and spend-control product (proxy, budgets, run ledger, dashboard); production path is self-host or private hosted with invite-only Clerk + BYOK
- Open source under MIT (`LICENSE`); `package.json` has `"license": "MIT"`; self-host stays free; hosted monetization is optional via `AGENTLEDGER_BILLING_ENABLED`
- Monorepo layout: `apps/web` plus `packages/{db,shared,sdk}`, managed with pnpm
- Stack centers on Next.js, Postgres (Docker Compose on port 5433 locally), Clerk for `/app`, and Resend alerts; Stripe SaaS billing is deferred (`AGENTLEDGER_BILLING_ENABLED` unset → full self-host entitlements)
- OpenAI-compatible proxy lives at `/api/v1` with agent/team attribution, cost logging, and hard budgets that return HTTP 402 when exceeded
- Provider keys are per-project BYOK for `openai` | `anthropic` | `google` | `xai` (AES-GCM via `AGENTLEDGER_SECRETS_KEY`); Grok models auto-route to xAI; optional env fallbacks include `OPENAI_API_KEY` and `XAI_API_KEY`
- `AGENTLEDGER_DEMO_MODE` defaults off; `true` enables optional seeded `/demo` for local explore only; `/app` is the live Clerk console; local explore: `pnpm db:migrate` + `pnpm db:seed`
- Invite users with `pnpm invite -- email@…` (`scripts/invite-user.ts`, requires `CLERK_SECRET_KEY`)
- Production app domain is `agentledger.koramaple.ca` (Clerk Production + Railway); Cloudflare zone `koramaple.ca` manages DNS, including Clerk Frontend API / accounts / DKIM CNAMEs (DNS-only)
- Clerk Production requires custom Google OAuth client credentials; Development shared Google OAuth does not work on Production; gate the UI with `NEXT_PUBLIC_CLERK_GOOGLE_OAUTH=true` only after credentials are configured
- Railway hosts the invite-only BYOK app for smoke testing with demo mode off — public app service, private Postgres; no `railway up` unless overridden; leave billing flag unset — see `DEPLOY.md`
- Custom Clerk auth lives at `/sign-in` and `/sign-up`; `NEXT_PUBLIC_CLERK_INVITE_ONLY=true` gates sign-up UI; GitHub remote is `a-n-oss/AgentLedger` with Actions CI; budget alert emails use `apps/web/public/brand/email-logo.png`
