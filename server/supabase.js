const { createClient } = require('@supabase/supabase-js');

let client;

/** Clave de servidor: service role (varios nombres según integración Vercel/Supabase) */
function resolveSecretKey() {
    return (
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SECRET_KEY
    );
}

/** Clave pública anon (también NEXT_PUBLIC_* si la integración solo inyecta esa) */
function resolveAnonKey() {
    return (
        process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

function resolveApiKey() {
    return resolveSecretKey() || resolveAnonKey();
}

/** Para diagnóstico en /api/health (sin exponer secretos) */
function getKeySource() {
    if (resolveSecretKey()) return 'service_role';
    if (resolveAnonKey()) return 'anon';
    return null;
}

function getSupabase() {
    if (client) return client;
    const url = process.env.SUPABASE_URL;
    const key = resolveApiKey();
    if (!url || !key) return null;
    client = createClient(url, key);
    return client;
}

function isSupabaseConfigured() {
    return !!(process.env.SUPABASE_URL && resolveApiKey());
}

if (process.env.VERCEL === '1' && !isSupabaseConfigured()) {
    console.warn(
        '[surveyapp] Vercel: faltan SUPABASE_URL y/o una clave (SUPABASE_ANON_KEY, SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY). Las respuestas no se guardarán en la BD.'
    );
}

module.exports = {
    getSupabase,
    isSupabaseConfigured,
    getKeySource
};
