# Stripe sandbox bootstrap (AgentLedger)

Billing is **deferred**. Checkout, portal, and plan paywalls stay inert until `AGENTLEDGER_BILLING_ENABLED=true`. Do **not** enable that flag on the current Railway invite-only smoke host.

Products created in the connected Stripe sandbox (`Koramaple sandbox`):

| Plan | Product | Price ID | Amount |
|---|---|---|---|
| Pro | AgentLedger Pro | `price_1U09qjPB0mcy51K4QsRkacCl` | $99/mo |
| Team | AgentLedger Team | `price_1U09qkPB0mcy51K4P31nx1M2` | $299/mo |

Webhook (when billing is on):

- URL: `https://<your-paid-host>/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

Required env vars on the **paid host only**:

```bash
AGENTLEDGER_BILLING_ENABLED=true
STRIPE_SECRET_KEY=sk_test_…          # from Dashboard → API keys
STRIPE_WEBHOOK_SECRET=whsec_…        # from webhook endpoint
STRIPE_PRICE_PRO=price_1U09qjPB0mcy51K4QsRkacCl
STRIPE_PRICE_TEAM=price_1U09qkPB0mcy51K4P31nx1M2
# optional:
# STRIPE_METERED_PRICE=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Enable Customer Portal: https://dashboard.stripe.com/test/settings/billing/portal

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

See also [DEPLOY.md](../DEPLOY.md) (Billing reactivation) and [README.md](../README.md#billing-and-plans).
