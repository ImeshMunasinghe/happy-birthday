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
--   - Photo uploads go to a public storage bucket; the `photo_urls`
--     column stores the public URLs.
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
    check (theme in ('pastel', 'fireworks', 'funny', 'elegant', 'ocean', 'sunset', 'custom')),
  photo_urls text[] default '{}',               -- public URLs of uploaded wish images
  scheduled_for timestamptz,                    -- optional unlock moment (UTC)
  custom_theme jsonb,                           -- custom theme overrides (colors, font, card style)
  music_track text,                             -- optional background music track key
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

-- ------------------------------------------------------------
-- Storage bucket for wish images
--
-- Public read (anyone can view uploaded images), but uploads are
-- restricted to the wish-creation flow via the anon key. Files are
-- stored under `wish-images/{wishId}/{nanoid}.webp`.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('wish-images', 'wish-images', true)
on conflict (id) do nothing;

-- Public read access for wish images.
create policy "wish_images_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'wish-images');

-- Anyone may upload to the wish-images bucket (the wish-creation
-- flow generates random filenames, preventing overwrites).
create policy "wish_images_insert_public"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'wish-images');