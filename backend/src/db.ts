import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-key';

if (supabaseUrl === 'https://mock-project.supabase.co' || supabaseKey === 'mock-key') {
    console.warn('Missing Supabase environment variables! DB operations will fail. Starting in mock mode.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
