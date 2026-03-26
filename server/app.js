const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const surveyService = require('./surveyService');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/surveys', async (req, res) => {
    try {
        const surveys = await surveyService.listSurveys();
        res.json(surveys);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message || 'Error al listar encuestas' });
    }
});

app.get('/api/surveys/:id', async (req, res) => {
    try {
        const survey = await surveyService.getSurveyById(req.params.id);
        if (!survey) {
            return res.status(404).json({
                error: 'Encuesta no encontrada',
                message: `No existe una encuesta con el ID ${req.params.id}`
            });
        }
        res.json(survey);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message || 'Error al obtener encuesta' });
    }
});

app.post('/api/surveys/:id/responses', async (req, res) => {
    try {
        const surveyId = parseInt(req.params.id, 10);
        const { answers, respondentName } = req.body;
        const response = await surveyService.submitResponses(
            surveyId,
            answers || {},
            respondentName
        );
        res.status(201).json({
            success: true,
            message: '¡Gracias por tu participación!',
            response,
            storage: response.storage || 'memory'
        });
    } catch (e) {
        const code = e.statusCode || 500;
        if (code >= 500) console.error(e);
        res.status(code).json({
            error: e.message || 'Error al guardar respuestas',
            details: e.details
        });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const stats = await surveyService.getStats();
        res.json(stats);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message || 'Error al obtener estadísticas' });
    }
});

app.get('/api/responses', async (req, res) => {
    try {
        const responses = await surveyService.listMemoryResponses();
        res.json({ total: responses.length, responses });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/surveys/:id/responses', async (req, res) => {
    try {
        const surveyId = parseInt(req.params.id, 10);
        const list = await surveyService.getSurveyResponsesFromMemory(surveyId);
        res.json({
            surveyId,
            total: list.length,
            responses: list
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/surveys', async (req, res) => {
    try {
        const { title, description, questions, icon } = req.body;
        if (!title || !description || !questions) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Se requiere título, descripción y preguntas'
            });
        }
        const seed = surveyService.seedData.surveys;
        const newSurvey = {
            id: seed.length ? Math.max(...seed.map((s) => s.id)) + 1 : 1,
            title,
            description,
            icon: icon || '📝',
            questions: questions.map((q, index) => ({
                id: index + 1,
                text: q.text,
                type: q.type || 'text'
            }))
        };
        seed.push(newSurvey);
        res.status(201).json({
            success: true,
            message: 'Encuesta creada (solo en memoria; usa Supabase para persistir)',
            survey: newSurvey
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/stats/:id/detailed', async (req, res) => {
    try {
        const surveyId = parseInt(req.params.id, 10);
        const survey = await surveyService.getSurveyById(surveyId);
        if (!survey) {
            return res.status(404).json({ error: 'Encuesta no encontrada' });
        }
        const surveyResponses =
            await surveyService.getSurveyResponsesFromMemory(surveyId);
        const detailedStats = {
            surveyId,
            surveyTitle: survey.title,
            totalResponses: surveyResponses.length,
            questions: survey.questions.map((question) => {
                const answers = surveyResponses
                    .map((r) => r.answers[question.id])
                    .filter((a) => a !== undefined && a !== null);
                const stats = {
                    questionId: question.id,
                    questionText: question.text,
                    questionType: question.type,
                    totalAnswers: answers.length
                };
                if (question.type === 'rating') {
                    const numericAnswers = answers
                        .map((a) => parseInt(a, 10))
                        .filter((a) => !Number.isNaN(a));
                    const average =
                        numericAnswers.length > 0
                            ? numericAnswers.reduce((a, b) => a + b, 0) /
                              numericAnswers.length
                            : 0;
                    stats.average = parseFloat(average.toFixed(2));
                    stats.distribution = {
                        '5 (Excelente)': numericAnswers.filter((a) => a === 5)
                            .length,
                        '4 (Muy bueno)': numericAnswers.filter((a) => a === 4)
                            .length,
                        '3 (Bueno)': numericAnswers.filter((a) => a === 3)
                            .length,
                        '2 (Regular)': numericAnswers.filter((a) => a === 2)
                            .length,
                        '1 (Malo)': numericAnswers.filter((a) => a === 1).length
                    };
                } else if (question.type === 'boolean') {
                    stats.distribution = {
                        Sí: answers.filter((a) => a === 'si').length,
                        No: answers.filter((a) => a === 'no').length
                    };
                } else if (question.type === 'text') {
                    stats.responses = answers.slice(0, 10);
                }
                return stats;
            })
        };
        res.json(detailedStats);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/responses', async (req, res) => {
    try {
        const count = await surveyService.clearMemoryResponses();
        res.json({
            success: true,
            message: `Se eliminaron ${count} respuestas`,
            deletedCount: count
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/health', async (req, res) => {
    const supabaseMod = require('./supabase');
    const mem = surveyService.getMemoryResponses();
    let surveysCount = surveyService.seedData.surveys.length;
    let responsesCount = mem.length;

    const database = {
        configured: supabaseMod.isSupabaseConfigured(),
        connected: false,
        keySource: supabaseMod.getKeySource ? supabaseMod.getKeySource() : null,
        runtime: process.env.VERCEL === '1' ? 'vercel' : 'local'
    };

    if (!database.configured) {
        database.mode = 'memory';
        database.note =
            'Sin SUPABASE_URL + clave reconocida: la API usa datos en memoria (seed).';
        if (process.env.VERCEL === '1') {
            database.vercelFix =
                'Define SUPABASE_URL y SUPABASE_ANON_KEY o SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY) y haz redeploy.';
        }
    } else {
        try {
            const client = supabaseMod.getSupabase();
            const { error: errSurveys, count: surveyCount } = await client
                .from('surveys')
                .select('*', { count: 'exact', head: true });
            if (errSurveys) {
                database.error = errSurveys.message;
                database.details = errSurveys.details || errSurveys.hint;
            } else {
                database.connected = true;
                if (surveyCount != null) surveysCount = surveyCount;
                const { count: respCount, error: errResp } = await client
                    .from('responses')
                    .select('*', { count: 'exact', head: true });
                if (!errResp && respCount != null) responsesCount = respCount;
            }
        } catch (e) {
            database.error = e.message;
        }
    }

    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        surveysCount,
        responsesCount,
        canonicalSurveyCount: surveyService.seedData.surveys.length,
        listingMode: 'canonical',
        database
    });
});

module.exports = app;
