# Birthday Wish

A shareable site where anyone can create a customized birthday wish and send it
via a single link. The link opens a themed page with confetti, animation, and —
optionally — a countdown that unlocks the wish at the perfect moment.

## Features

- **4 themes** — Pastel Dream, Fireworks Night, Funny Bones, Elegant Gold
  (each with its own font, colors, decor, and confetti choreography)
- **One-link sharing** — short id URLs (`/wish/x7k2p9`), copy-link, WhatsApp and X share buttons
- **Dynamic preview cards** — per-wish Open Graph image (recipient name + theme colors) when the link is shared
- **Scheduled unlock** — optionally lock the wish behind a live countdown; the message
  isn't even sent to the browser until the moment arrives
- **View counter** — atomic server-side increment
- **Spam-resistant** — honeypot field + strict server-side validation + RLS (read/insert only)

## Tech stack

| Layer     | Choice                                    |
| --------- | ----------------------------------------- |
| Framework | Next.js 16 (App Router) + React 19        |
| Styling   | Tailwind CSS v4                           |
| Database  | Supabase (Postgres)                       |
| Animation | framer-motion + canvas-confetti           |
| Deploy    | Vercel                                    |

All mutations go through **Server Actions** (`lib/actions.ts`) — no API routes.

## Setup (first time)

### 1. Install dependencies

```bash
npm install
```

### 2. Create a free Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Pick any name (e.g. `birthday-wish`), a strong DB password, and a region close to you
3. Wait ~1 minute for provisioning

### 3. Create the table + security policies

1. In the Supabase dashboard open **SQL Editor** → **New query**
2. Open [`supabase/schema.sql`](./supabase/schema.sql), copy **everything**, paste it in
3. Click **Run**

This creates:
- the `wishes` table (your exact schema: short-id PK, theme check constraint, `scheduled_for`, `view_count`)
- **Row Level Security** with public read/insert only (no update/delete for anyone)
- an atomic `increment_view_count()` function so the counter can't be tampered with

### 4. Add your keys

1. **Project URL**: click the **Connect** button at the top of the dashboard
   (or Settings → General). It looks like `https://xxxx.supabase.co`
2. **API key**: go to **API Keys** and copy the **Publishable key**
   (starts with `sb_publishable_…`; older projects show an "anon public" `eyJ…` key — either works)
3. In this folder, copy `.env.local.example` → `.env.local` and paste them:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxx
```

> ⚠️ The publishable/anon key is *designed* to be public — the RLS policies you ran
> in step 3 are what protect the data. **Never** put the `secret` / `service_role`
> key in this app; it bypasses RLS entirely.

### 5. Run it

```bash
npm run dev
```

Open http://localhost:3000 → create a wish → watch the round-trip work.

## Deploying to Vercel

1. Push this folder to a GitHub repo
2. [vercel.com/new](https://vercel.com/new) → import the repo
3. Add the env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   and optionally `NEXT_PUBLIC_SITE_URL` = your final URL)
4. Deploy

## Project structure

```
app/
  page.tsx                 # Landing page
  create/page.tsx          # Create form page
  wish/[id]/page.tsx       # The reveal (server component)
  wish/[id]/opengraph-image.tsx  # Dynamic share-card image
components/
  CreateWishForm.tsx       # Form (useActionState, honeypot, theme picker)
  WishReveal.tsx           # Confetti + framer-motion reveal (client)
  Countdown.tsx            # Scheduled-unlock timer, auto-refreshes at zero
  ShareButtons.tsx         # Copy / WhatsApp / X
lib/
  actions.ts               # 'use server' — createWish, incrementViewCount
  supabase.ts              # Server-only Supabase client + Wish type
  wishes.ts                # Cached fetch + scheduled-unlock check
  themes.ts                # Theme config map (single source of truth)
supabase/
  schema.sql               # Run once in the Supabase SQL editor
```

## Notes & gotchas

- **Server Actions only** — form handling uses React 19's `useActionState` +
  `redirect`; there are deliberately no API routes to keep one consistent pattern.
- **Timezones** — the create form converts the user's local date/time to a UTC
  instant in the browser (browsers know their zone; servers don't). Stored as
  `timestamptz`, compared server-side at render time.
- **Collision handling** — 6-char ids from a 31-char alphabet (~887M combos) with a
  retry-on-unique-violation loop, just in case.
- **Animations never block paint** — the reveal card is server-rendered;
  canvas-confetti is dynamically imported after mount.
- **`view_count` is best-effort** — bots will inflate it; fine for this scale.

## Roadmap ideas (Phase 5)

- Photo upload (Supabase Storage + `photo_urls`, already in the schema)
- Background music toggle per theme
- Guestbook (friends add messages to a wish)
- "Tap to reveal" suspense mode as an alternative to instant load