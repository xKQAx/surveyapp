-- =============================================================================
-- SurveyApp — esquema para Supabase (PostgreSQL)
-- Ejecuta TODO el archivo en: Supabase → SQL Editor → New query → Run
-- Idempotente: puedes lanzarlo más de una vez; añade lo que falte sin borrar datos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tablas (CREATE IF NOT EXISTS: encaja si empiezas desde cero)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    survey_id INT NOT NULL REFERENCES surveys (id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    question_type TEXT
);

CREATE TABLE IF NOT EXISTS options (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    option_id INT REFERENCES options (id) ON DELETE SET NULL,
    text_value TEXT,
    submission_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Migraciones suaves (si ya tenías tablas creadas sin estas columnas)
-- -----------------------------------------------------------------------------

ALTER TABLE surveys
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE surveys ADD COLUMN IF NOT EXISTS icon TEXT;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT;

ALTER TABLE responses ADD COLUMN IF NOT EXISTS text_value TEXT;

ALTER TABLE responses ADD COLUMN IF NOT EXISTS submission_id UUID;

-- Si option_id era NOT NULL en tu BD antigua, permite NULL para respuestas solo texto
ALTER TABLE responses
ALTER COLUMN option_id DROP NOT NULL;

-- -----------------------------------------------------------------------------
-- Índices (estadísticas y listados)
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON questions (survey_id);

CREATE INDEX IF NOT EXISTS idx_options_question_id ON options (question_id);

CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses (question_id);

CREATE INDEX IF NOT EXISTS idx_responses_submission_id ON responses (submission_id);

-- -----------------------------------------------------------------------------
-- Row Level Security (lectura pública + insert de respuestas)
-- Si usas SUPABASE_SERVICE_ROLE_KEY en el backend, puedes relajar o desactivar RLS
-- en desarrollo; en producción conviene políticas explícitas.
-- -----------------------------------------------------------------------------

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE options ENABLE ROW LEVEL SECURITY;

ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS surveyapp_public_read_surveys ON surveys;

DROP POLICY IF EXISTS surveyapp_public_read_questions ON questions;

DROP POLICY IF EXISTS surveyapp_public_read_options ON options;

DROP POLICY IF EXISTS surveyapp_public_insert_responses ON responses;

CREATE POLICY surveyapp_public_read_surveys ON surveys FOR
SELECT
    USING (TRUE);

CREATE POLICY surveyapp_public_read_questions ON questions FOR
SELECT
    USING (TRUE);

CREATE POLICY surveyapp_public_read_options ON options FOR
SELECT
    USING (TRUE);

CREATE POLICY surveyapp_public_insert_responses ON responses FOR INSERT
WITH
    CHECK (TRUE);

-- Opcional: permitir leer respuestas solo a service role (sin policy de SELECT)
-- El panel de Supabase con rol postgres sigue viendo todo.
