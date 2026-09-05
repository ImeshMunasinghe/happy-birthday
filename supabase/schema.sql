-- ============================================================
-- Birthday Wish Site -- Supabase schema
--
-- Apply via the Supabase dashboard:
--   SQL Editor -> New query -> paste this file -> Run
--
-- Design notes:
--   - The `id` primary key is a short nanoid used directly in URLs.
--   - Row Level Security permits public SELECT and INSERT only; there
--     are deliberately no UPDATE or DELETE policies for anon users.
--   - View counting goes through a security-definer function so the
--     counter can be incremented atomically without granting UPDATE.
-- ============================================================

-- ------------------------------------------------------------
-- Wishes table
-- ------------------------------------------------------------
create table if not exists public.wishes (
  id text primary key,                          -- short nanoid, used in the URL
  recipient_name text not null,
  sender_name text not null,
  message text not null,
  theme text not null default 'pastel'
    check (theme in ('pastel', 'fireworks', 'funny', 'elegant')),
  photo_urls text[] default '{}',               -- reserved for a future photo feature
  scheduled_for timestamptz,                    -- optional unlock moment (UTC)
  created_at timestamptz not null default now(),
  view_count int not null default 0
);

-- Supports queries over scheduled wishes; the primary key already
-- covers the by-id lookups used by the app.
create index if not exists wishes_scheduled_for_idx
  on public.wishes (scheduled_for)
  where scheduled_for is not null;

-- ------------------------------------------------------------
-- Row Level Security
--
-- The publishable/anon key is public by design; RLS is the mechanism
-- that actually protects the data.
-- ------------------------------------------------------------
alter table public.wishes enable row level security;

-- Anyone may read wishes (required by the reveal page).
create policy "wishes_select_public"
  on public.wishes for select
  to anon, authenticated
  using (true);

-- Anyone may create wishes (required by the create form).
create policy "wishes_insert_public"
  on public.wishes for insert
  to anon, authenticated
  with check (true);

-- No UPDATE or DELETE policies are granted to anon or authenticated:
-- visitors can never modify or remove an existing wish.

-- ------------------------------------------------------------
-- Atomic view counter
--
-- Exposing UPDATE to anon would allow arbitrary row modification.
-- A security-definer function instead allows a single, scoped,
-- atomic increment and nothing else.
-- ------------------------------------------------------------
create or replace function public.increment_view_count(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.wishes
  set view_count = view_count + 1
  where id = p_id;
end;
$$;

grant execute on function public.increment_view_count(text) to anon, authenticated;