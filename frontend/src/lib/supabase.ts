// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  string | undefined;

// Fallback agar aplikasi tidak crash (layar putih) saat env belum diisi.
export const supabase = createClient(
  supabaseUrl || "http://localhost",
  supabaseAnonKey || "missing-anon-key",
);
