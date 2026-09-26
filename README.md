# echoglitch.in

The production codebase for **echoglitch**, a productivity brand and digital-product platform.

## What is included

- Motion-led marketing website, playbook catalogue, blog, SEO/AEO metadata, and policy pages
- Razorpay order creation, Checkout verification, and signed/idempotent webhooks
- Automatic Resend fulfilment with private Supabase Storage attachments
- Supabase-backed leads, waitlists, orders, rate limits, catalogue management, and admin authentication
- Cloudflare Worker runtime with Git-based builds and deployment
- Automated security tests and GitHub Actions verification

## Local development

Requirements: Node.js 22.23.2 and npm.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

On macOS or Linux, use `cp .env.example .env.local` instead of `copy`.

The public pages work without integrations. Payments, forms, email fulfilment, and admin access require the environment values documented in `.env.example`.

## Verify a change

```bash
npm test
npm run build
```

## Production launch

Follow [docs/CLOUDFLARE-LAUNCH-GUIDE.md](docs/CLOUDFLARE-LAUNCH-GUIDE.md) from top to bottom. It covers:

1. Supabase database, private product storage, and admin user
2. Razorpay test keys, Checkout, webhooks, and live-mode cutover
3. Resend domain verification and automatic PDF delivery
4. Cloudflare Git deployment, runtime secrets, and `echoglitch.in`
5. End-to-end checks, go-live, rollback, and troubleshooting

Never commit `.env`, `.env.local`, `.dev.vars`, API keys, webhook secrets, customer exports, or paid product files.
