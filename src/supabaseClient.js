import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bvirrjlhcqnbzlpoveam.supabase.co";
const supabaseKey = "sb_publishable_6B9CHvv8JuDaxwB3OGEBdQ_1u6eOoPa";

export const supabase = createClient(supabaseUrl, supabaseKey);
