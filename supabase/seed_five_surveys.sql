-- =============================================================================
-- Carga las 5 encuestas canónicas (alineadas con server/seedData.js).
-- Ejecutar en Supabase SQL Editor DESPUÉS de schema.sql.
-- ADVERTENCIA: borra datos existentes en estas tablas (solo para dev / BD de prueba).
-- =============================================================================

TRUNCATE responses, options, questions, surveys RESTART IDENTITY CASCADE;

INSERT INTO surveys (title, description, icon)
VALUES
    (
        'Encuesta de Satisfacción General',
        'Ayúdanos a mejorar calificando tu experiencia con nuestro servicio',
        '⭐'
    ),
    (
        'Experiencia con la Aplicación',
        'Cuéntanos qué te parece nuestra plataforma y cómo podemos mejorarla',
        '💻'
    ),
    (
        'Calidad del Servicio',
        'Tu opinión es muy importante para seguir mejorando',
        '🏆'
    ),
    (
        'Nuevas Funcionalidades',
        'Ayúdanos a priorizar qué características desarrollar primero',
        '🚀'
    ),
    (
        'Feedback del Curso',
        'Evalúa la calidad del contenido educativo',
        '📚'
    );

-- survey_id 1
INSERT INTO
    questions (survey_id, text, question_type)
VALUES (1, '¿Cómo calificas la atención al cliente?', 'rating'),
    (1, '¿Recomendarías nuestros servicios?', 'boolean'),
    (1, '¿Qué mejorarías?', 'text');

-- survey_id 2
INSERT INTO
    questions (survey_id, text, question_type)
VALUES (2, '¿Qué tan fácil es de usar la aplicación?', 'rating'),
    (2, '¿Has encontrado algún error o bug?', 'boolean'),
    (2, 'Sugerencias para mejorar la experiencia', 'text');

-- survey_id 3
INSERT INTO
    questions (survey_id, text, question_type)
VALUES (3, 'Tiempo de respuesta del equipo', 'rating'),
    (3, 'Profesionalidad y atención', 'rating'),
    (3, '¿Volverías a contratar nuestros servicios?', 'boolean');

-- survey_id 4
INSERT INTO
    questions (survey_id, text, question_type)
VALUES (4, '¿Qué funcionalidad te gustaría ver?', 'text'),
    (4, '¿Usarías una versión móvil?', 'boolean'),
    (4, '¿Qué tan urgente es para ti?', 'rating');

-- survey_id 5
INSERT INTO
    questions (survey_id, text, question_type)
VALUES (5, '¿Cómo calificas el contenido?', 'rating'),
    (5, '¿El instructor fue claro y didáctico?', 'rating'),
    (5, '¿Recomendarías este curso?', 'boolean');

-- Opciones: rating 5..1, boolean Sí/No (ids de pregunta según orden INSERT arriba: 1..15)
INSERT INTO options (question_id, text)
VALUES
    (1, '5'),
    (1, '4'),
    (1, '3'),
    (1, '2'),
    (1, '1'),
    (2, 'Sí'),
    (2, 'No'),
    (4, '5'),
    (4, '4'),
    (4, '3'),
    (4, '2'),
    (4, '1'),
    (5, 'Sí'),
    (5, 'No'),
    (7, '5'),
    (7, '4'),
    (7, '3'),
    (7, '2'),
    (7, '1'),
    (8, '5'),
    (8, '4'),
    (8, '3'),
    (8, '2'),
    (8, '1'),
    (9, 'Sí'),
    (9, 'No'),
    (11, 'Sí'),
    (11, 'No'),
    (12, '5'),
    (12, '4'),
    (12, '3'),
    (12, '2'),
    (12, '1'),
    (13, '5'),
    (13, '4'),
    (13, '3'),
    (13, '2'),
    (13, '1'),
    (14, '5'),
    (14, '4'),
    (14, '3'),
    (14, '2'),
    (14, '1'),
    (15, 'Sí'),
    (15, 'No');

-- Secuencias alineadas
SELECT setval(
        pg_get_serial_sequence('surveys', 'id'),
        (
            SELECT COALESCE(MAX(id), 1)
            FROM surveys
        )
    );

SELECT setval(
        pg_get_serial_sequence('questions', 'id'),
        (
            SELECT COALESCE(MAX(id), 1)
            FROM questions
        )
    );

SELECT setval(
        pg_get_serial_sequence('options', 'id'),
        (
            SELECT COALESCE(MAX(id), 1)
            FROM options
        )
    );
