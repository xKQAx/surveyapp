-- =============================================================================
-- Datos de ejemplo (opcional) — ejecutar DESPUÉS de schema.sql
-- Crea una encuesta con rating (5 opciones), boolean (2 opciones) y texto (sin opciones).
-- =============================================================================

DO $$
DECLARE
    sid INT;
    q1 INT;
    q2 INT;
    q3 INT;
BEGIN
    INSERT INTO surveys (title, description, icon)
    VALUES ('Encuesta de demostración', 'Generada por seed_example.sql', '⭐')
    RETURNING id INTO sid;

    INSERT INTO questions (survey_id, text, question_type)
    VALUES (sid, '¿Cómo calificas el servicio?', 'rating')
    RETURNING id INTO q1;

    INSERT INTO options (question_id, text)
    VALUES
        (q1, '5'),
        (q1, '4'),
        (q1, '3'),
        (q1, '2'),
        (q1, '1');

    INSERT INTO questions (survey_id, text, question_type)
    VALUES (sid, '¿Recomendarías el producto?', 'boolean')
    RETURNING id INTO q2;

    INSERT INTO options (question_id, text)
    VALUES
        (q2, 'Sí'),
        (q2, 'No');

    INSERT INTO questions (survey_id, text, question_type)
    VALUES (sid, 'Comentarios adicionales', 'text')
    RETURNING id INTO q3;
END $$;
