<<<<<<< HEAD
module.exports = require('../server/app');
=======
// api/index.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Datos simulados - Encuestas con iconos y preguntas mejoradas
let surveys = [
    {
        id: 1,
        title: 'Encuesta de Satisfacción General',
        description: 'Ayúdanos a mejorar calificando tu experiencia con nuestro servicio',
        icon: '⭐',
        questions: [
            { id: 1, text: '¿Cómo calificas la atención al cliente?', type: 'rating' },
            { id: 2, text: '¿Recomendarías nuestros servicios?', type: 'boolean' },
            { id: 3, text: '¿Qué mejorarías?', type: 'text' }
        ]
    },
    {
        id: 2,
        title: 'Experiencia con la Aplicación',
        description: 'Cuéntanos qué te parece nuestra plataforma y cómo podemos mejorarla',
        icon: '💻',
        questions: [
            { id: 1, text: '¿Qué tan fácil es de usar la aplicación?', type: 'rating' },
            { id: 2, text: '¿Has encontrado algún error o bug?', type: 'boolean' },
            { id: 3, text: 'Sugerencias para mejorar la experiencia', type: 'text' }
        ]
    },
    {
        id: 3,
        title: 'Calidad del Servicio',
        description: 'Tu opinión es muy importante para seguir mejorando',
        icon: '🏆',
        questions: [
            { id: 1, text: 'Tiempo de respuesta del equipo', type: 'rating' },
            { id: 2, text: 'Profesionalidad y atención', type: 'rating' },
            { id: 3, text: '¿Volverías a contratar nuestros servicios?', type: 'boolean' }
        ]
    },
    {
        id: 4,
        title: 'Nuevas Funcionalidades',
        description: 'Ayúdanos a priorizar qué características desarrollar primero',
        icon: '🚀',
        questions: [
            { id: 1, text: '¿Qué funcionalidad te gustaría ver?', type: 'text' },
            { id: 2, text: '¿Usarías una versión móvil?', type: 'boolean' },
            { id: 3, text: '¿Qué tan urgente es para ti?', type: 'rating' }
        ]
    },
    {
        id: 5,
        title: 'Feedback del Curso',
        description: 'Evalúa la calidad del contenido educativo',
        icon: '📚',
        questions: [
            { id: 1, text: '¿Cómo calificas el contenido?', type: 'rating' },
            { id: 2, text: '¿El instructor fue claro y didáctico?', type: 'rating' },
            { id: 3, text: '¿Recomendarías este curso?', type: 'boolean' }
        ]
    }
];

// Almacenamiento de respuestas
let responses = [];

// ==================== RUTAS API ====================

// Obtener todas las encuestas
app.get('/api/surveys', (req, res) => {
    res.json(surveys);
});

// Obtener una encuesta por ID
app.get('/api/surveys/:id', (req, res) => {
    const surveyId = parseInt(req.params.id);
    const survey = surveys.find(s => s.id === surveyId);
    
    if (survey) {
        res.json(survey);
    } else {
        res.status(404).json({ 
            error: 'Encuesta no encontrada',
            message: `No existe una encuesta con el ID ${surveyId}`
        });
    }
});

// Enviar respuestas de una encuesta
app.post('/api/surveys/:id/responses', (req, res) => {
    const { answers, respondentName } = req.body;
    const surveyId = parseInt(req.params.id);
    const survey = surveys.find(s => s.id === surveyId);
    
    if (!survey) {
        return res.status(404).json({ 
            error: 'Encuesta no encontrada',
            message: `No existe una encuesta con el ID ${surveyId}`
        });
    }
    
    // Validar que se hayan respondido todas las preguntas
    const totalQuestions = survey.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    
    if (answeredQuestions !== totalQuestions) {
        return res.status(400).json({
            error: 'Respuestas incompletas',
            message: `Por favor responde todas las ${totalQuestions} preguntas`
        });
    }
    
    // Crear nueva respuesta
    const newResponse = {
        id: responses.length + 1,
        surveyId: surveyId,
        surveyTitle: survey.title,
        answers: answers,
        respondentName: respondentName || 'Anónimo',
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    responses.push(newResponse);
    
    res.status(201).json({ 
        success: true,
        message: '¡Gracias por tu participación!',
        response: newResponse
    });
});

// Obtener estadísticas
app.get('/api/stats', (req, res) => {
    const stats = {
        totalResponses: responses.length,
        surveys: surveys.map(survey => ({
            id: survey.id,
            title: survey.title,
            icon: survey.icon,
            totalQuestions: survey.questions.length,
            responses: responses.filter(r => r.surveyId === survey.id).length
        })),
        recentResponses: responses.slice(-5).map(r => ({
            surveyTitle: r.surveyTitle,
            respondentName: r.respondentName,
            date: r.date
        }))
    };
    
    res.json(stats);
});

// Obtener todas las respuestas (útil para análisis)
app.get('/api/responses', (req, res) => {
    res.json({
        total: responses.length,
        responses: responses
    });
});

// Obtener respuestas de una encuesta específica
app.get('/api/surveys/:id/responses', (req, res) => {
    const surveyId = parseInt(req.params.id);
    const surveyResponses = responses.filter(r => r.surveyId === surveyId);
    
    res.json({
        surveyId: surveyId,
        total: surveyResponses.length,
        responses: surveyResponses
    });
});

// Endpoint para agregar una nueva encuesta (útil para administración)
app.post('/api/surveys', (req, res) => {
    const { title, description, questions, icon } = req.body;
    
    if (!title || !description || !questions) {
        return res.status(400).json({
            error: 'Datos incompletos',
            message: 'Se requiere título, descripción y preguntas'
        });
    }
    
    const newSurvey = {
        id: surveys.length + 1,
        title: title,
        description: description,
        icon: icon || '📝',
        questions: questions.map((q, index) => ({
            id: index + 1,
            text: q.text,
            type: q.type || 'text'
        }))
    };
    
    surveys.push(newSurvey);
    
    res.status(201).json({
        success: true,
        message: 'Encuesta creada exitosamente',
        survey: newSurvey
    });
});

// Endpoint para obtener estadísticas detalladas por encuesta
app.get('/api/stats/:id/detailed', (req, res) => {
    const surveyId = parseInt(req.params.id);
    const survey = surveys.find(s => s.id === surveyId);
    
    if (!survey) {
        return res.status(404).json({ error: 'Encuesta no encontrada' });
    }
    
    const surveyResponses = responses.filter(r => r.surveyId === surveyId);
    
    // Analizar respuestas por pregunta
    const detailedStats = {
        surveyId: surveyId,
        surveyTitle: survey.title,
        totalResponses: surveyResponses.length,
        questions: survey.questions.map(question => {
            const answers = surveyResponses
                .map(r => r.answers[question.id])
                .filter(a => a !== undefined && a !== null);
            
            // Calcular estadísticas según el tipo de pregunta
            let stats = {
                questionId: question.id,
                questionText: question.text,
                questionType: question.type,
                totalAnswers: answers.length
            };
            
            if (question.type === 'rating') {
                const numericAnswers = answers.map(a => parseInt(a)).filter(a => !isNaN(a));
                const average = numericAnswers.length > 0 
                    ? numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length 
                    : 0;
                
                stats.average = parseFloat(average.toFixed(2));
                stats.distribution = {
                    '5 (Excelente)': numericAnswers.filter(a => a === 5).length,
                    '4 (Muy bueno)': numericAnswers.filter(a => a === 4).length,
                    '3 (Bueno)': numericAnswers.filter(a => a === 3).length,
                    '2 (Regular)': numericAnswers.filter(a => a === 2).length,
                    '1 (Malo)': numericAnswers.filter(a => a === 1).length
                };
            } else if (question.type === 'boolean') {
                stats.distribution = {
                    'Sí': answers.filter(a => a === 'si').length,
                    'No': answers.filter(a => a === 'no').length
                };
            } else if (question.type === 'text') {
                stats.responses = answers.slice(0, 10); // Últimas 10 respuestas de texto
            }
            
            return stats;
        })
    };
    
    res.json(detailedStats);
});

// Endpoint para limpiar todas las respuestas (útil para pruebas)
app.delete('/api/responses', (req, res) => {
    const count = responses.length;
    responses = [];
    
    res.json({
        success: true,
        message: `Se eliminaron ${count} respuestas`,
        deletedCount: count
    });
});

// Endpoint para verificar el estado del servidor
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        surveysCount: surveys.length,
        responsesCount: responses.length
    });
});

// Exportar para Vercel
module.exports = app;
>>>>>>> teammate/main
