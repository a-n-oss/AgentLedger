# Contributing to AgentLedger

Thanks for helping improve AgentLedger. This repo is **self-host first** open source: the core control plane stays free to run yourself. Hosted SaaS billing is optional and **off by default**.

## Development

```bash
docker compose up -d
cp apps/web/.env.example apps/web/.env.local
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- App: http://localhost:3000/app (Clerk)
- Docs: http://localhost:3000/docs
- Optional seeded UI: `AGENTLEDGER_DEMO_MODE=true` → `/demo` (local only)

Invite-only instances: `pnpm invite -- you@example.com` (needs `CLERK_SECRET_KEY` in `apps/web/.env.local`).

## Checks

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

## Branching

Use a `cursor/`-prefixed feature branch (or your usual short name), open a PR to `main`, and wait for GitHub Actions CI. Merges to `main` trigger Railway auto-deploy — do not `railway up` unless explicitly needed.

## Scope notes

- Prefer fixing docs and product posture against **self-host / invite-only / BYOK**.
- Do not enable `AGENTLEDGER_BILLING_ENABLED` on shared hosted smoke environments.
- Never commit `.env`, `.env.local`, or provider/Clerk/Stripe secrets. Use `apps/web/.env.example` as the template.

## License

By contributing, you agree that your contributions are licensed under the MIT License (see [LICENSE](LICENSE)).
