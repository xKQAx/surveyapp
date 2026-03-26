-- Si en producción el POST a /api/surveys/:id/responses falla con error de RLS
-- o no aparecen filas en `responses`, ejecuta esto en el SQL Editor de Supabase.
-- Asegura que el rol `anon` (clave pública) pueda insertar respuestas.

DROP POLICY IF EXISTS surveyapp_public_insert_responses ON responses;

CREATE POLICY surveyapp_public_insert_responses ON responses FOR INSERT TO anon
WITH
    CHECK (TRUE);

-- Opcional: mismo permiso para usuarios autenticados si los usas más adelante
DROP POLICY IF EXISTS surveyapp_authenticated_insert_responses ON responses;

CREATE POLICY surveyapp_authenticated_insert_responses ON responses FOR INSERT TO authenticated
WITH
    CHECK (TRUE);
