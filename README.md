# AdsIQ + BuildPredict — Live Dashboard

Single Next.js 16 (App Router) app serving a public, share-link style metrics dashboard for both **AdsIQ** and **BuildPredict** clients — plus an authenticated admin view. Modeled on the MBM portal.

## Routes

| Path | Who | Purpose |
|---|---|---|
| `/` | public | Landing: pick an app, see its live snapshot card |
| `/c/[slug]` | public share-link | Client dashboard scoped by `dashboard_shares.slug` |
| `/app` | auth (magic link) | Signed-in user dashboard, scoped by `user_id` |
| `/app/admin` | admin emails only | Global stats across both apps |
| `/api/share/[slug]` | public | JSON for `/c/[slug]`, service-role read, slug + expiry enforced |
| `/api/metrics` | auth | JSON for `/app`, user JWT (RLS applies) |

## Dev

```bash
cp .env.example .env.local   # fill in Supabase keys
npm install
npm run dev
```

Without Supabase env vars present every page falls back to sample data so the UI is still useful for demos.

## Database

Run `supabase/migrations/001_dashboard_shares.sql` in the Supabase SQL editor. It creates the `dashboard_shares` table (slug → user_id, app, expires_at, revoked) with RLS and the `create_dashboard_share(user_id, app, expires)` RPC that generates a short slug.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_ORG/YOUR_REPO/tree/main/mcp-servers/dashboard&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,ADMIN_EMAILS,NEXT_PUBLIC_ADSIQ_APP_URL,NEXT_PUBLIC_BPIQ_APP_URL&project-name=adsiq-bpiq-dashboard&repository-name=adsiq-bpiq-dashboard)

Set the env vars from `.env.example` in the Vercel project settings.
