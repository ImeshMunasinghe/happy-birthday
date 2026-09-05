-- ============================================================
-- Migration 001: Add new features (run this in Supabase SQL Editor)
-- https://supabase.com/dashboard → SQL Editor → New query → paste → Run
--
-- This migration is safe to run multiple times (idempotent).
-- It adds the columns and storage needed for:
--   - Custom themes (custom_theme JSONB)
--   - Background music (music_track TEXT)
--   - Photo gallery (storage bucket + policies)
--   - New theme keys (ocean, sunset, custom)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add new columns to wishes table
-- ------------------------------------------------------------
alter table public.wishes
  add COLUMN if not exists custom_theme jsonb;

alter table public.wishes
  ADD COLUMN if not exists music_track text;

-- ------------------------------------------------------------
-- 2. Update theme check constraint to include new themes
-- ------------------------------------------------------------
-- First drop the old constraint (if it exists)
alter table public.wishes
  DROP CONSTRAINT if exists wishes_theme_check;

-- Add the updated constraint with all 7 theme keys
alter table public.wishes
  ADD CONSTRAINT wishes_theme_check
  CHECK (theme in ('pastel', 'fireworks', 'funny', 'elegant', 'ocean', 'sunset', 'custom'));

-- ------------------------------------------------------------
-- 3. Create storage bucket for wish images
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('wish-images', 'wish-images', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 4. Create storage policies for wish-images bucket
-- Public read access (anyone can view uploaded images)
CREATE POLICY IF NOT EXISTS "wish_images_select_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'wish-images');

-- Public insert access (anyone can upload images)
CREATE POLICY IF NOT EXISTS "wish_images_insert_public"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'wish-images');

-- ------------------------------------------------------------
-- Done! Verify with:
--   SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'wishes';
--   SELECT * FROM storage.buckets WHERE id = 'wish-images';
-- ============================================================