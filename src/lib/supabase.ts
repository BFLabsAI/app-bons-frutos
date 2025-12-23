import { createClient } from '@supabase/supabase-js';
console.log("Supabase module executing");


const manualSupabaseUrl = 'https://mszmrmgvjobvswzklclh.supabase.co';
const manualSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zem1ybWd2am9idnN3emtsY2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg5MDUsImV4cCI6MjA4MjA4NDkwNX0.bWj3V2xP8wCKoPe0OsvEBHhXnnolZgAVs_tbx0sJKDg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || manualSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || manualSupabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
