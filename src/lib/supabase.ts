// --- IMPORTS ---
import { createClient } from "@supabase/supabase-js";

// --- CONFIGURATION ---
// WE LOAD THE ENVIRONMENT VARIABLES FROM THE .ENV FILE
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- ERROR CHECKING ---
// THIS ENSURES WE DONT CRASH SILENTLY IF KEYS ARE MISSING
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase keys are missing in .env file!");
}

// --- INITIALIZATION ---
// WE CREATE A SINGLE INSTANCE OF THE CLIENT TO BE USED EVERYWHERE
export const supabase = createClient(supabaseUrl, supabaseAnonKey);