import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ThemeKey } from "./themes";

/**
 * A wish row as it lives in Supabase.
 * `scheduled_for` arrives as an ISO string (timestamptz), or null.
 */
export type Wish = {
  id: string;
  recipient_name: string;
  sender_name: string;
  message: string;
  theme: ThemeKey;
  photo_urls: string[] | null;
  scheduled_for: string | null;
  created_at: string;
  view_count: number;
};

let client: SupabaseClient | null = null;

/**
 * Returns the server-side Supabase client (singleton).
 *
 * Authenticates with the public publishable/anon key; data access is
 * protected by the table's RLS policies, not by key secrecy. The
 * "server-only" import guard prevents accidental use in client bundles.
 * Throws with setup guidance when environment variables are missing.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("PASTE_") || key.includes("PASTE_")) {
    throw new Error(
      "Supabase is not configured yet. " +
        "Copy .env.local.example to .env.local, paste your Project URL + anon key " +
        "(Supabase dashboard → Settings → API), then restart the dev server. " +
        "Full steps are in the README."
    );
  }

  client = createClient(url, key);
  return client;
}