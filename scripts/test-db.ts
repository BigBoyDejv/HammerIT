import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xxx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'xxx';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing craftsman query...");
    const { data, error } = await supabase
        .from('craftsman_profiles')
        .select(`
            *,
            user:profiles!craftsman_profiles_user_id_fkey(full_name, avatar_url, phone, bio, nationality)
        `);
    
    if (error) {
        console.error("DB Error:", error);
    } else {
        console.log("Success. Rows:", data?.length);
        console.log(data);
    }
}
test();
