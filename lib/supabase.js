import { createClient } from '@supabase/supabase-js';

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseSERVER = process.env.SERVER_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseURL, supabaseKEY, supabaseSERVER)