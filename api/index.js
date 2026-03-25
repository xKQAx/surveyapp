const { sql } = require('@vercel/postgres');

// Obtener encuestas
app.get('/api/surveys', async (req, res) => {
    try {
        const surveys = await sql`SELECT * FROM surveys`;
        res.json(surveys.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Guardar respuesta
app.post('/api/surveys/:id/responses', async (req, res) => {
    const { answers, respondentName } = req.body;
    const surveyId = req.params.id;
    
    try {
        await sql`
            INSERT INTO responses (survey_id, answers, respondent_name)
            VALUES (${surveyId}, ${JSON.stringify(answers)}, ${respondentName})
        `;
        res.json({ message: 'Respuesta guardada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});