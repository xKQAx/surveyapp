const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Datos simulados - Encuestas
let surveys = [
    {
        id: 1,
        title: 'Encuesta de Satisfacción',
        description: '¿Cómo calificas nuestro servicio?',
        questions: [
            { id: 1, text: 'Calidad del servicio', type: 'rating' },
            { id: 2, text: 'Recomendarías nuestro servicio', type: 'boolean' }
        ]
    },
    {
        id: 2,
        title: 'Encuesta de Producto',
        description: 'Tu opinión sobre nuestro producto',
        questions: [
            { id: 1, text: '¿Qué tan útil te resulta?', type: 'rating' },
            { id: 2, text: '¿Qué mejorarías?', type: 'text' }
        ]
    }
];

let responses = [];

// API Routes
app.get('/api/surveys', (req, res) => {
    res.json(surveys);
});

app.get('/api/surveys/:id', (req, res) => {
    const survey = surveys.find(s => s.id === parseInt(req.params.id));
    if (survey) {
        res.json(survey);
    } else {
        res.status(404).json({ error: 'Encuesta no encontrada' });
    }
});

app.post('/api/surveys/:id/responses', (req, res) => {
    const { answers, respondentName } = req.body;
    const survey = surveys.find(s => s.id === parseInt(req.params.id));
    
    if (survey) {
        const newResponse = {
            id: responses.length + 1,
            surveyId: parseInt(req.params.id),
            surveyTitle: survey.title,
            answers,
            respondentName: respondentName || 'Anónimo',
            date: new Date().toISOString()
        };
        responses.push(newResponse);
        res.status(201).json({ 
            message: 'Respuesta guardada exitosamente',
            response: newResponse
        });
    } else {
        res.status(404).json({ error: 'Encuesta no encontrada' });
    }
});

app.get('/api/stats', (req, res) => {
    const stats = {
        totalResponses: responses.length,
        surveys: surveys.map(survey => ({
            id: survey.id,
            title: survey.title,
            responses: responses.filter(r => r.surveyId === survey.id).length
        }))
    };
    res.json(stats);
});

// Servir el build del frontend en producción
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});