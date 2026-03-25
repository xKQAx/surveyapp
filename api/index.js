// api/index.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Datos simulados - Encuestas de prueba
let surveys = [
    {
        id: 1,
        title: '📊 Encuesta de Satisfacción General',
        description: 'Ayúdanos a mejorar calificando tu experiencia',
        icon: '⭐',
        questions: [
            { id: 1, text: '¿Cómo calificas la atención al cliente?', type: 'rating' },
            { id: 2, text: '¿Recomendarías nuestros servicios?', type: 'boolean' },
            { id: 3, text: '¿Qué mejorarías?', type: 'text' }
        ]
    },
    {
        id: 2,
        title: '💻 Experiencia con la Aplicación',
        description: 'Cuéntanos qué te parece nuestra plataforma',
        icon: '📱',
        questions: [
            { id: 1, text: '¿Qué tan fácil es de usar?', type: 'rating' },
            { id: 2, text: '¿Has encontrado algún error?', type: 'boolean' },
            { id: 3, text: 'Sugerencias para mejorar', type: 'text' }
        ]
    },
    {
        id: 3,
        title: '🎓 Encuesta de Curso/Taller',
        description: 'Evalúa la calidad del contenido educativo',
        icon: '📚',
        questions: [
            { id: 1, text: '¿Cómo calificas el contenido?', type: 'rating' },
            { id: 2, text: '¿El instructor fue claro?', type: 'rating' },
            { id: 3, text: '¿Recomendarías este curso?', type: 'boolean' }
        ]
    },
    {
        id: 4,
        title: '🚀 Nuevas Funcionalidades',
        description: 'Ayúdanos a priorizar qué desarrollar primero',
        icon: '💡',
        questions: [
            { id: 1, text: '¿Qué funcionalidad te gustaría ver?', type: 'text' },
            { id: 2, text: '¿Usarías una versión móvil?', type: 'boolean' },
            { id: 3, text: '¿Qué tan urgente es?', type: 'rating' }
        ]
    },
    {
        id: 5,
        title: '🎯 Calidad del Servicio',
        description: 'Tu opinión es muy importante para nosotros',
        icon: '🏆',
        questions: [
            { id: 1, text: 'Tiempo de respuesta', type: 'rating' },
            { id: 2, text: 'Profesionalismo', type: 'rating' },
            { id: 3, text: '¿Volverías a contratarnos?', type: 'boolean' }
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
            message: '¡Gracias por tu respuesta!',
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
            icon: survey.icon,
            responses: responses.filter(r => r.surveyId === survey.id).length
        }))
    };
    res.json(stats);
});

module.exports = app;