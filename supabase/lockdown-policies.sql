-- ============================================================
-- RLS lockdown for public.wishes
--
-- Purpose: repair a table that was created through the dashboard's
-- Table Editor, which may have added permissive default policies
-- before supabase/schema.sql was applied. This script removes all
-- existing policies and reinstates only the two this application
-- requires.
--
-- Apply via the Supabase dashboard:
--   SQL Editor -> New query -> paste this file -> Run
-- ============================================================

-- 1. Ensure RLS is enabled and enforced for the table owner as well.
alter table public.wishes enable row level security;
alter table public.wishes force row level security;

-- 2. Drop every existing policy on the table. The dynamic loop catches
--    permissive policies auto-created by the dashboard, whose names
--    are not known in advance.
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'wishes'
  loop
    execute format('drop policy if exists %I on public.wishes', pol.policyname);
  end loop;
end $$;

-- 3. Reinstate only the policies the application needs.
--    No UPDATE or DELETE policies exist: visitors cannot tamper
--    with an existing wish.

create policy "wishes_select_public"
  on public.wishes for select
  to anon, authenticated
  using (true);

create policy "wishes_insert_public"
  on public.wishes for insert
  to anon, authenticated
  with check (true);

-- 4. Output the resulting policy list for verification.
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'wishes';