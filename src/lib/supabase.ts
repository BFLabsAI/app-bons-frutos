import { createClient } from '@supabase/supabase-js';
console.log("Supabase module executing");


const manualSupabaseUrl = 'https://inwilptjnjeqxjgzexqm.supabase.co';
const manualSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlud2lscHRqbmplcXhqZ3pleHFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MzI4MTYsImV4cCI6MjA4MTUwODgxNn0.qdV3FI4yoyF1jShhq5NtcoVopcJH5gxXNfiyw_LM_Vg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || manualSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || manualSupabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
