# Supabase + deployment setup (you apply this)

The app code is ready. Apply the following in Supabase (and your host) yourself.

## 1. Database & storage

1. Open the Supabase SQL Editor.
2. Run [`schema.sql`](./schema.sql) in full.
3. Confirm buckets `team-photos` and `event-images` exist and are public.

## 2. Auth settings

1. **Disable public sign-ups** (Authentication → Providers → Email).
2. Set the Site URL to your production domain (and `http://localhost:3000` for local).
3. Add redirect URLs:
   - `http://localhost:3000/portal/login`
   - `https://YOUR_DOMAIN/portal/login`

## 3. API keys (publishable + secret)

Use the **new** keys from **Settings → API Keys** (not legacy `anon` / `service_role`):

| Variable | Key type | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Public |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` | Safe for browser / portal client |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` | Server-only admin invites/deactivation |

Copy [`.env.example`](../.env.example) → `.env.local` and fill these in.

## 4. Bootstrap the first admin

1. Create the first Auth user in the Supabase dashboard.
2. Insert the matching team row:

```sql
insert into public.team (id, display_name, role, is_admin, display_order, is_active)
values (
  '<auth-user-uuid>',
  'Your Name',
  'President',
  true,
  1,
  true
);
```

## 5. Other environment variables

| Variable | Purpose |
| --- | --- |
| `REVALIDATE_SECRET` | Shared webhook secret |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `RESEND_API_KEY` / `CONTACT_*` | Optional contact email delivery |

## 6. Database webhook → on-demand ISR

Create Database Webhooks on `public.team` and `public.events` for INSERT/UPDATE/DELETE:

- URL: `https://YOUR_DOMAIN/api/revalidate`
- HTTP method: `POST`
- Header: `x-revalidate-secret: <REVALIDATE_SECRET>`
- Body must include `"table": "team"` or `"table": "events"`

Public pages also use `revalidate = 21600` (6h) as a fallback.

## 7. Image host allowlist

`next.config.ts` reads `NEXT_PUBLIC_SUPABASE_URL` and allows `/storage/v1/object/public/**` for `next/image`.
