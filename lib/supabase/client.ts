import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://njefepwxmwfhcntvhvie.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWZlcHd4bXdmaGNudHZodmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTE0NTEsImV4cCI6MjEwMzE2NzQ1MX0.smoR1dSUwc43t-UzrWnXdqz-Jpwv0sgBEgq_UFH15W8";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

