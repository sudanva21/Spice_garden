import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
    console.log("Checking if users table exists...");
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
        console.error("Error referencing 'users' table:", error.message);
    } else {
        console.log("Users table exists! Data:", data);
    }
}
check();
