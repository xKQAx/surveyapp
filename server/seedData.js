/** Datos en memoria cuando no hay Supabase o para desarrollo sin BD */
module.exports = {
    surveys: [
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
    ]
};
