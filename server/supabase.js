const { createClient } = require('@supabase/supabase-js');

let client;

function getSupabase() {
    if (client) return client;
    const url = process.env.SUPABASE_URL;
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    client = createClient(url, key);
    return client;
}

function isSupabaseConfigured() {
    return !!(
        process.env.SUPABASE_URL &&
        (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
    );
}

module.exports = { getSupabase, isSupabaseConfigured };
