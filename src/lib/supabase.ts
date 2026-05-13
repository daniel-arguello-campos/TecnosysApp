import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const fallbackUrl = "https://example.supabase.co";
const fallbackKey = "sb_publishable_placeholder_key_for_local_boot";

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en el archivo .env.");
}

export const supabase = createClient(supabaseUrl ?? fallbackUrl, supabasePublishableKey ?? fallbackKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
