# echoglitch.in — complete production launch guide

This guide takes the repository from GitHub to a live Cloudflare Worker with Supabase, Razorpay, Resend, automatic PDF delivery, and the `echoglitch.in` domain.

Complete the sections in order. Begin with Razorpay **Test Mode**. Do not put a live secret in GitHub, a committed file, a screenshot, or a support message.

## 0. What you need

- Access to `github.com/AnkitmeAnkit/beginning`
- A Cloudflare account
- Control of the `echoglitch.in` domain
- A Supabase account
- A Razorpay account
- A Resend account
- The final paid playbook PDF
- The email address that will be allowed into `/admin`

The application uses this flow:

```text
Visitor
  → Cloudflare Worker
      → Supabase database and private Storage
      → Razorpay Orders and Checkout
      → Resend transactional email
```

## 1. Confirm the GitHub repository

1. Open `https://github.com/AnkitmeAnkit/beginning`.
2. Select **Settings → General**.
3. Confirm the default branch is `main`.
4. Select **Settings → Collaborators and teams** and confirm your account has **Admin** access.
5. Select **Actions → General** and allow actions created by GitHub. The repository contains a verification workflow that runs tests and a production build on every push to `main`.
6. Return to the **Code** tab. Confirm these important paths exist after the first push:
   - `.github/workflows/verify.yml`
   - `app/`
   - `public/hero-motion.mp4`
   - `supabase/migrations/001_initial.sql`
   - `docs/CLOUDFLARE-LAUNCH-GUIDE.md`
   - `.env.example`

Do not upload `.env.local`, paid PDFs, API keys, customer CSV files, or database exports.

## 2. Create and configure Supabase

### 2.1 Create the project

1. Open `https://supabase.com/dashboard`.
2. Select **New project**.
3. Choose your organisation.
4. Set the project name to `echoglitch-production`.
5. Generate and save a strong database password in a password manager.
6. Choose the closest suitable region for your customers.
7. Select **Create new project** and wait until provisioning finishes.

### 2.2 Create the tables, indexes, security rules, and seed catalogue

1. In this repository, open `supabase/migrations/001_initial.sql` and copy the entire file.
2. In Supabase, select **SQL Editor → New query**.
3. Paste the SQL.
4. Select **Run**.
5. Confirm the result shows success and no red error.
6. Open `supabase/verification.sql` in this repository and copy it.
7. In Supabase, select **SQL Editor → New query**, paste it, and select **Run**.
8. Confirm:
   - Three playbooks are returned.
   - Every listed table shows `row_level_security_enabled = true`.
   - `claim_submission_slot` is present with `DEFINER` security.

The migration creates:

- `playbooks`
- `leads`
- `waitlist`
- `orders`
- `webhook_events`
- `form_rate_limits`
- the atomic `claim_submission_slot` rate-limit function

Public table access is revoked. The Worker uses a server-only Supabase secret key.

### 2.3 Create private playbook storage

1. In Supabase, select **Storage**.
2. Select **New bucket**.
3. Enter the bucket name exactly as `playbooks`.
4. Keep **Public bucket** turned **off**.
5. If the dashboard offers file restrictions, allow `application/pdf` and choose a limit appropriate for the product. Keeping the PDF below 10 MB makes email delivery more reliable.
6. Select **Create bucket**.
7. Open the `playbooks` bucket.
8. Create the folder `day-one-execution-system`.
9. Open that folder and upload the final PDF as `v1.pdf`.

Now save the private object path in the catalogue:

1. Select **SQL Editor → New query**.
2. Run:

```sql
update public.playbooks
set file_path = 'day-one-execution-system/v1.pdf',
    updated_at = now()
where slug = 'day-one-execution-system';

select slug, status, price, file_path
from public.playbooks
order by slug;
```

3. Confirm the Day One row contains the exact path and its price is `49900`. Prices are stored in paise, so `49900` means ₹499.

### 2.4 Create the admin user

1. In Supabase, select **Authentication → Users**.
2. Select **Add user → Create new user**.
3. Enter the admin email you control.
4. Enter a unique strong password.
5. Enable email confirmation/auto-confirm if the dashboard offers it.
6. Select **Create user**.
7. Save the exact lowercase email. You will use it for `ADMIN_EMAIL_ALLOWLIST` in Cloudflare.

### 2.5 Copy the Supabase connection values

1. Open the project’s **Connect** dialog, or select **Project Settings → API Keys**.
2. Copy the project URL. It looks like `https://abcxyz.supabase.co`.
3. Copy a **publishable key** beginning with `sb_publishable_`.
4. Create or copy a server-only **secret key** beginning with `sb_secret_`.
5. Store both in a password manager.

Map them later as:

| Cloudflare name | Supabase value | Cloudflare type |
|---|---|---|
| `SUPABASE_URL` | Project URL | Text |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Text |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` | Secret |

Legacy `anon` and `service_role` keys are also supported by the code, but new production projects should use the current publishable/secret keys.

Official references: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [SQL functions](https://supabase.com/docs/guides/database/functions), and [Storage buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets).

## 3. Prepare Resend automatic email delivery

### 3.1 Add the sending domain

1. Open `https://resend.com/domains`.
2. Select **Add domain**.
3. Enter `echoglitch.in`.
4. Select the region appropriate for your account and create the domain.
5. Resend will display DNS records. Keep this page open.
6. In another tab, open **Cloudflare → echoglitch.in → DNS → Records**.
7. Add every DNS record Resend provides, exactly as shown.
8. For any Resend CNAME record, set **Proxy status** to **DNS only** (grey cloud). MX and TXT records are DNS-only automatically.
9. If an SPF TXT record already exists on the same hostname, do not create a second SPF record. Merge the required include value into the existing SPF record.
10. Return to Resend and select **Verify DNS Records**.
11. Wait until the domain status becomes **Verified**.

Resend requires a verified domain before sending from it. The application sends from `echoglitch <downloads@echoglitch.in>` and sets `help@echoglitch.in` as the reply address.

### 3.2 Create the sending key

1. In Resend, open **API Keys**.
2. Select **Create API Key**.
3. Name it `echoglitch-production-worker`.
4. Give it sending access only if the dashboard offers scoped permissions.
5. Restrict it to `echoglitch.in` if that option is available.
6. Create the key and copy the `re_...` value immediately.
7. Store it in a password manager. Resend will not show the full value again.

Map the values later as:

| Cloudflare name | Value | Cloudflare type |
|---|---|---|
| `RESEND_API_KEY` | `re_...` | Secret |
| `RESEND_FROM_EMAIL` | `echoglitch <downloads@echoglitch.in>` | Text |

The Worker downloads the purchased PDF from the private Supabase bucket and sends it as a Base64 attachment. Resend currently accepts email attachments up to 40 MB after Base64 encoding; use a much smaller product PDF for reliability.

Official references: [Resend verified domains](https://resend.com/docs/dashboard/domains/introduction) and [Send Email API/attachments](https://resend.com/docs/api-reference/emails/send-email).

## 4. Prepare Razorpay in Test Mode

### 4.1 Generate test keys

1. Open the Razorpay Dashboard.
2. Switch the account to **Test Mode**.
3. Open **Account & Settings → API Keys**.
4. Select **Generate Key**.
5. Download or copy both values:
   - Key ID: normally begins with `rzp_test_`
   - Key Secret: shown only when generated
6. Store both in a password manager.

Map them later as:

| Cloudflare name | Value | Cloudflare type |
|---|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_...` | Text |
| `RAZORPAY_KEY_SECRET` | Test key secret | Secret |

The browser receives the Key ID only. The Key Secret stays in the Worker and is used to create orders and verify Checkout signatures.

### 4.2 Set automatic capture

1. In the Razorpay Dashboard, open the payment capture settings.
2. Enable automatic capture for successful payments.
3. Save the setting.

Digital fulfilment must happen only after a captured/paid event. The application listens for `payment.captured` and `order.paid`.

Do not create the webhook yet. Its public URL is available after the first Cloudflare deployment.

Official reference: [Razorpay integration and go-live checklist](https://razorpay.com/docs/server-integration/python/test-app/).

## 5. Put `echoglitch.in` on Cloudflare DNS

Skip this section if Cloudflare already shows the domain as **Active**.

1. Open the Cloudflare Dashboard.
2. Select **Add a domain**.
3. Enter `echoglitch.in` and continue.
4. Select the desired Cloudflare plan.
5. Review the imported DNS records carefully, especially email MX/TXT records.
6. Cloudflare will show two assigned nameservers.
7. Sign in to the registrar where `echoglitch.in` was purchased.
8. Replace the registrar’s current nameservers with the two Cloudflare nameservers.
9. Return to Cloudflare and select **Check nameservers now**.
10. Wait until the zone status is **Active** before attaching the Worker domain.

Do not delete Resend DNS records while changing nameservers.

## 6. Deploy the GitHub repository with Cloudflare Workers Builds

### 6.1 Import the repository

1. In Cloudflare, open **Workers & Pages**.
2. Select **Create application**.
3. Next to **Import a repository**, select **Get started**.
4. Select **GitHub**.
5. If asked, install/authorise the Cloudflare GitHub App for the `AnkitmeAnkit` account.
6. Grant it access to the `beginning` repository.
7. Select `AnkitmeAnkit/beginning`.

### 6.2 Use these build settings exactly

| Setting | Value |
|---|---|
| Worker name | `echoglitch` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy --config dist/server/wrangler.json` |
| Non-production branch command | `npx wrangler preview --config dist/server/wrangler.json` |

The Worker name must be `echoglitch` because the generated Wrangler configuration uses the project package name.

### 6.3 Pin the build runtime

1. On the same setup screen, open **Build variables and secrets** or **Advanced settings**.
2. Add a build variable:
   - Name: `NODE_VERSION`
   - Value: `22.23.2`
3. Do not add runtime API keys here.
4. Select **Save and Deploy**.

Cloudflare installs dependencies, runs the build, then deploys the generated Worker configuration. Wait for the build status to become **Success** and open the provided `workers.dev` URL.

Official references: [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/), [build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), and [build image/runtime versions](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/).

## 7. Add Cloudflare runtime variables and secrets

Build variables affect compilation. The following are **runtime** values used by the deployed Worker.

1. Open **Workers & Pages → echoglitch**.
2. Select **Settings → Variables and Secrets**.
3. Select **Add**.
4. Add every row below.

| Name | Value | Type |
|---|---|---|
| `SITE_URL` | `https://echoglitch.in` | Text |
| `SUPABASE_URL` | Your Supabase project URL | Text |
| `SUPABASE_PUBLISHABLE_KEY` | Your `sb_publishable_...` key | Text |
| `SUPABASE_SECRET_KEY` | Your `sb_secret_...` key | Secret |
| `RAZORPAY_KEY_ID` | Your `rzp_test_...` key ID | Text |
| `RAZORPAY_KEY_SECRET` | Your Razorpay test key secret | Secret |
| `RAZORPAY_WEBHOOK_SECRET` | A new random webhook secret | Secret |
| `RESEND_API_KEY` | Your `re_...` key | Secret |
| `RESEND_FROM_EMAIL` | `echoglitch <downloads@echoglitch.in>` | Text |
| `ADMIN_EMAIL_ALLOWLIST` | Exact Supabase admin email | Text |

For the webhook secret, generate a long random value in your password manager. This is not the Razorpay API Key Secret. You will paste the same value into Razorpay.

5. Select **Deploy** to create a Worker version containing the new bindings.
6. Wait for the deployment to finish.
7. Open the `workers.dev` URL and confirm `/`, `/playbooks`, `/blog`, and `/admin/login` load.

Cloudflare secrets are encrypted and are not displayed again. Official references: [environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/) and [secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

## 8. Attach `echoglitch.in`

1. Open **Workers & Pages → echoglitch**.
2. Open **Settings → Domains & Routes** (or the **Domains** tab).
3. Select **Add → Custom Domain**.
4. Enter `echoglitch.in`.
5. Confirm the domain.
6. Cloudflare will create the required DNS record and TLS certificate.
7. Wait until the domain shows **Active**.
8. Open `https://echoglitch.in` in a private/incognito window.

Optional `www` handling:

1. Add `www.echoglitch.in` as another custom domain if you want it to serve the site.
2. Prefer a Cloudflare Redirect Rule that permanently redirects `www.echoglitch.in/*` to `https://echoglitch.in/$1` so there is one canonical host.

Official reference: [Cloudflare Worker custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## 9. Create the Razorpay test webhook

1. Confirm `https://echoglitch.in/api/payments/webhook` loads publicly. A normal browser visit may return an error because the route expects a signed POST; that is expected.
2. In Razorpay, stay in **Test Mode**.
3. Open **Account & Settings → Webhooks**.
4. Select **Add New Webhook**.
5. Enter the URL:

```text
https://echoglitch.in/api/payments/webhook
```

6. Paste the exact value used for Cloudflare’s `RAZORPAY_WEBHOOK_SECRET`.
7. Enable these events:
   - `payment.captured`
   - `order.paid`
8. Enable the webhook and save it. Razorpay may request the test-mode OTP shown in its dashboard guidance.

The route validates `X-Razorpay-Signature` against the unmodified raw request body using HMAC-SHA256. It also stores each event ID in `webhook_events`, so Razorpay retries do not send the same fulfilment twice.

Official reference: [Validate and test Razorpay webhooks](https://razorpay.com/docs/webhooks/validate-test/).

## 10. Run the full test-mode launch test

Use a new email address or remove old test rows before repeating a rate-limited flow.

### 10.1 Public-site checks

1. Open `https://echoglitch.in` in a private/incognito window.
2. Confirm the hero video plays and the text is readable.
3. Open the playbooks page, blog, Privacy, Terms, Refunds, Data Policy, and Editorial Policy.
4. Open:
   - `https://echoglitch.in/robots.txt`
   - `https://echoglitch.in/sitemap.xml`
5. Confirm both use the production domain.

### 10.2 Lead and waitlist checks

1. Submit the homepage contact form after accepting consent.
2. In Supabase, select **Table Editor → leads** and confirm one row exists.
3. Join the AI Workday OS waitlist.
4. In Supabase, select **Table Editor → waitlist** and confirm one row exists.
5. Submit the same waitlist email again and confirm no duplicate is created.

### 10.3 Admin check

1. Open `https://echoglitch.in/admin/login`.
2. Sign in with the Supabase admin email and password.
3. Confirm the admin dashboard loads.
4. Try a different Supabase user or email and confirm access is denied unless the address is in `ADMIN_EMAIL_ALLOWLIST`.

### 10.4 Razorpay and automatic-email check

1. Open the available Day One playbook.
2. Select **Get the playbook**.
3. Enter a real inbox you control and accept consent.
4. Complete a Razorpay Test Mode payment using Razorpay’s test flow.
5. Confirm the site reports successful payment.
6. In Razorpay, open **Transactions → Payments** and confirm the payment is **Captured**.
7. In Supabase, open `orders` and confirm:
   - `status = paid`
   - `fulfilment_status = sent`
   - `razorpay_payment_id` is present
   - `fulfilment_email_id` is present
8. In Supabase, open `webhook_events` and confirm the payment event is present once.
9. In Resend, open **Emails/Logs** and confirm the delivery is successful.
10. Open the recipient inbox and confirm the PDF attachment is present and readable.

If `fulfilment_status` is `awaiting_asset`, recheck the private bucket name and `file_path`. If it is `failed` or the order stays pending, inspect Cloudflare Worker logs and Resend logs.

## 11. Switch from test payments to live payments

Only continue after every test in section 10 passes and the Razorpay account is fully activated.

1. In Razorpay, switch to **Live Mode**.
2. Open **Account & Settings → API Keys**.
3. Generate and securely save the Live Key ID and Live Key Secret.
4. Open **Account & Settings → Webhooks** in Live Mode.
5. Create the same webhook URL:
   `https://echoglitch.in/api/payments/webhook`
6. Generate a new, separate live webhook secret.
7. Enable `payment.captured` and `order.paid`.
8. In Cloudflare, open **echoglitch → Settings → Variables and Secrets**.
9. Replace:
   - `RAZORPAY_KEY_ID` with the live Key ID
   - `RAZORPAY_KEY_SECRET` with the live Key Secret
   - `RAZORPAY_WEBHOOK_SECRET` with the live webhook secret
10. Select **Deploy**.
11. Make one low-value real purchase using an email you control.
12. Reconcile the same purchase in all three systems:
   - Razorpay: payment captured
   - Supabase: order paid and fulfilment sent
   - Resend: email delivered
13. Confirm the correct PDF arrived.

Do not deliver from a merely `authorized` payment. Keep Razorpay automatic capture enabled and review tax, invoice, refund, support, and business identity requirements with the appropriate Indian legal/accounting professional before wider sales.

## 12. Normal publishing workflow after launch

Every push to `main` triggers both GitHub verification and Cloudflare deployment.

```bash
git pull origin main
npm ci
npm test
npm run build
git add .
git commit -m "Describe the change"
git push origin main
```

Then:

1. Open GitHub → **Actions** and confirm **Verify** passes.
2. Open Cloudflare → **echoglitch → Deployments/Builds** and confirm the build passes.
3. Open the production URL and test the changed path.

## 13. Rollback

If a production deployment is broken:

1. Open **Cloudflare → Workers & Pages → echoglitch → Deployments**.
2. Find the last known-good deployment.
3. Select it and use the dashboard’s rollback/redeploy action.
4. Confirm the production URL is healthy.
5. Revert the bad Git commit in GitHub and push the revert so source control matches production.

Never solve a deployment problem by committing secrets or disabling signature verification, RLS, or the admin allowlist.

## 14. Troubleshooting map

### Cloudflare build fails with a Worker-name mismatch

- Cloudflare Worker name must be `echoglitch`.
- Build command must be `npm run build`.
- Deploy command must be `npx wrangler deploy --config dist/server/wrangler.json`.
- Root directory must be `/`.

### Checkout says payments are being connected

- Check that `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are runtime values, not only build variables.
- After editing Variables and Secrets, select **Deploy**.
- Confirm the Key ID and Secret belong to the same Razorpay mode.

### Razorpay reports an invalid webhook signature

- The Cloudflare `RAZORPAY_WEBHOOK_SECRET` must exactly match the webhook secret for the current Razorpay mode.
- Do not use the Razorpay API Key Secret as the webhook secret.
- If the webhook secret was rotated, older retries may still be signed with the previous secret.

### Payment is captured but no email arrives

- Confirm the Resend domain is verified.
- Confirm `RESEND_FROM_EMAIL` uses that verified domain.
- Confirm `RESEND_API_KEY` is a Cloudflare runtime secret.
- Confirm the Supabase bucket is named exactly `playbooks` and is private.
- Confirm `playbooks.file_path` exactly matches the uploaded object path.
- Review Cloudflare logs, the Supabase `orders` row, and Resend logs.

### Admin login fails

- Confirm the user exists in Supabase Authentication and has a password.
- Confirm the email is confirmed.
- Confirm `ADMIN_EMAIL_ALLOWLIST` exactly matches the lowercase email.
- Confirm `SUPABASE_PUBLISHABLE_KEY` is present.
- Delete old cookies or retry in a private/incognito window after changing credentials.

### Forms return a temporary-unavailable message

- Confirm `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are deployed runtime values.
- Run `supabase/verification.sql` again.
- Review Cloudflare Worker logs for the exact Supabase response.

## 15. Final production checklist

- [ ] GitHub `main` contains the complete source and guide
- [ ] GitHub Verify workflow passes
- [ ] Cloudflare build and deployment pass
- [ ] `echoglitch.in` is active with HTTPS
- [ ] `www` redirects to the canonical host, if used
- [ ] Supabase migration and verification queries pass
- [ ] `playbooks` Storage bucket is private
- [ ] Product PDF path is saved in `playbooks.file_path`
- [ ] Admin user and email allowlist work
- [ ] Resend domain is verified
- [ ] Resend sender and reply mailbox work
- [ ] Razorpay test payment, signature verification, and webhook work
- [ ] PDF is delivered once after a captured test payment
- [ ] Live Razorpay keys and live webhook replace test values
- [ ] One low-value live purchase is reconciled end to end
- [ ] Privacy, Terms, Refunds, Data Policy, and support details are reviewed for the real business
