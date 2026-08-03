# Stripe sandbox bootstrap (AgentLedger)

Products created in the connected Stripe sandbox (`Koramaple sandbox`):

| Plan | Product | Price ID | Amount |
|---|---|---|---|
| Pro | AgentLedger Pro | `price_1U09qjPB0mcy51K4QsRkacCl` | $99/mo |
| Team | AgentLedger Team | `price_1U09qkPB0mcy51K4P31nx1M2` | $299/mo |

Webhook:

- URL: `https://agentledger-production-17ff.up.railway.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

Required Railway / `.env` vars:

```bash
STRIPE_SECRET_KEY=sk_test_…          # from Dashboard → API keys
STRIPE_WEBHOOK_SECRET=whsec_…        # from webhook endpoint
STRIPE_PRICE_PRO=price_1U09qjPB0mcy51K4QsRkacCl
STRIPE_PRICE_TEAM=price_1U09qkPB0mcy51K4P31nx1M2
```

Enable Customer Portal: https://dashboard.stripe.com/test/settings/billing/portal

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.
