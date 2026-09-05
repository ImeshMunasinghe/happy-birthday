/**
 * One-off round-trip test using the same client + credentials as the app.
 * Inserts a test wish, reads it back, increments views, then cleans up.
 * Run: node scripts/roundtrip-test.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Parse .env.local manually (no dotenv dependency needed)
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TEST_ID = "test01";

console.log("1. INSERT…");
const { error: insertError } = await supabase.from("wishes").insert({
  id: TEST_ID,
  recipient_name: "Round Trip",
  sender_name: "Cline",
  message: "If you can read this, the DB round-trip works!",
  theme: "fireworks",
});
if (insertError) {
  console.error("   INSERT failed:", insertError.message);
  process.exit(1);
}
console.log("   ✅ inserted");

console.log("2. SELECT…");
const { data, error: selectError } = await supabase
  .from("wishes")
  .select("*")
  .eq("id", TEST_ID)
  .maybeSingle();
if (selectError || !data) {
  console.error("   SELECT failed:", selectError?.message ?? "no row");
  process.exit(1);
}
console.log(`   ✅ read back: "${data.recipient_name}" from ${data.sender_name} (theme: ${data.theme})`);

console.log("3. RPC increment_view_count…");
const { error: rpcError } = await supabase.rpc("increment_view_count", {
  p_id: TEST_ID,
});
if (rpcError) {
  console.error("   RPC failed:", rpcError.message);
  process.exit(1);
}
const { data: after } = await supabase
  .from("wishes")
  .select("view_count")
  .eq("id", TEST_ID)
  .maybeSingle();
console.log(`   ✅ view_count is now ${after?.view_count} (expected 1)`);

console.log("4. UPDATE attempt (should FAIL — RLS blocks it)…");
const { error: updateError } = await supabase
  .from("wishes")
  .update({ message: "tampered" })
  .eq("id", TEST_ID);
console.log(
  updateError
    ? `   ✅ correctly blocked: ${updateError.message}`
    : "   ⚠️ WARNING: update succeeded — RLS update policy is open!"
);

console.log("5. DELETE test row (should FAIL — RLS blocks it, cleanup manual)…");
const { error: deleteError } = await supabase
  .from("wishes")
  .delete()
  .eq("id", TEST_ID);
console.log(
  deleteError
    ? `   ✅ correctly blocked: ${deleteError.message}`
    : "   ⚠️ WARNING: delete succeeded — RLS delete policy is open!"
);

console.log("\n🎉 Round-trip test complete. Check results above.");