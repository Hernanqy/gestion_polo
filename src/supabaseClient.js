import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://bvirrjlhcqnbzlpoveam.supabase.co";

const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY EXISTE:", Boolean(supabaseKey));

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan datos de Supabase en .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
