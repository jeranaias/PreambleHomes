import { createBrowserClient } from "@supabase/ssr";
import { createMockClient, isDemoMode, getDemoRole } from "@/lib/demo/mock-client";

export function createClient() {
  // Demo mode: return mock client instead of real Supabase
  if (isDemoMode()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createMockClient(getDemoRole()) as any;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createBrowserClient(
    url || "https://placeholder.supabase.co",
    key || "placeholder"
  );
}
