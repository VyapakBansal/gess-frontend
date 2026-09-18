# GESS Website + Portal

Public website and authenticated self-serve content portal for the **Geomatics Engineering Student Society**.

## Stack

- Next.js App Router (Server Components + ISR)
- TypeScript + Tailwind CSS v4
- Supabase Auth, Postgres, Storage
- Webhook-driven on-demand revalidation

## Local development

```bash
cp .env.example .env.local
# fill Supabase + secrets (see supabase/SETUP.md)
npm install
npm run dev
```

## Routes

| Path | Audience |
| --- | --- |
| `/` `/about` `/events` `/contact` | Public |
| `/portal/login` | Executives |
| `/portal` `/portal/profile` `/portal/events` | Executives |
| `/portal/admin/accounts` | Admins |

## Design tokens

- Dark canvas / light canvas via theme toggle (default dark)
- Accent: desaturated cyan (`#5BA8A8` dark / `#3F8F8F` light)

## Important constraints

- Public routes must not import `@/lib/supabase/client` or portal forms.
- Use **publishable** + **secret** keys (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`) — not legacy anon/service_role.
- Secret key is server-only (`@/lib/supabase/admin`).
- Event upcoming/past status is **manual**, never date-derived.
- Apply `supabase/schema.sql` yourself — this repo does not provision Supabase/Vercel.
