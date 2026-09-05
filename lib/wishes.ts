import "server-only";
import { cache } from "react";
import { getSupabase, type Wish } from "./supabase";

/**
 * Fetches a wish by its short id.
 *
 * Wrapped in React's cache() so that all callers within a single request
 * (page component, generateMetadata, Open Graph image) share one query
 * instead of issuing duplicate requests.
 *
 * @returns The wish row, or null when the id does not exist or the
 *          query fails (failures are logged, not thrown).
 */
export const getWish = cache(async (id: string): Promise<Wish | null> => {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getWish failed:", error.message);
    return null;
  }

  return (data as Wish) ?? null;
});

/**
 * Determines whether a scheduled wish is still locked.
 *
 * The comparison happens server-side against the stored UTC instant, so
 * a locked wish's message is never included in the client payload —
 * only the countdown timestamp is.
 */
export function isWishLocked(wish: Wish): boolean {
  if (!wish.scheduled_for) return false;
  return new Date(wish.scheduled_for).getTime() > Date.now();
}