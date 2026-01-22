import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ [SupabaseClient] Environment variables missing!");
}

// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(supabaseUrl, supabaseKey);
