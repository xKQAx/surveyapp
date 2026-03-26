// client/src/components/SurveyForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SurveyForm({ apiUrl }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});
    const [respondentName, setRespondentName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    useEffect(() => {
        fetchSurvey();
    }, [id]);

    const fetchSurvey = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/surveys/${id}`);
            setSurvey(response.data);
        } catch (error) {
            console.error('Error fetching survey:', error);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${apiUrl}/api/surveys/${id}/responses`, {
                answers,
                respondentName
            });
            setSubmitted(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error('Error submitting survey:', error);
            alert('Error al enviar la encuesta. Por favor, intenta de nuevo.');
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < survey.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    if (!survey) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="alert alert-success text-center mt-5">
                <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3">¡Gracias por tu participación!</h4>
                <p>Tu respuesta ha sido registrada exitosamente.</p>
                <p className="small">Redirigiendo al inicio...</p>
            </div>
        );
    }

    const currentQ = survey.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / survey.questions.length) * 100;

    return (
        <div className="card">
            <div className="card-body">
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="card-title mb-0">{survey.title}</h2>
                        <span className="badge bg-primary rounded-pill">
                            Pregunta {currentQuestion + 1} de {survey.questions.length}
                        </span>
                    </div>
                    <div className="progress mb-3">
                        <div 
                            className="progress-bar" 
                            role="progressbar" 
                            style={{ width: `${progress}%` }}
                            aria-valuenow={progress} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                        >
                            {Math.round(progress)}%
                        </div>
                    </div>
                    <p className="card-text text-muted">{survey.description}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {currentQuestion === 0 && (
                        <div className="mb-4">
                            <label className="form-label">
                                <i className="bi bi-person"></i> Tu nombre (opcional)
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ingresa tu nombre..."
                                value={respondentName}
                                onChange={(e) => setRespondentName(e.target.value)}
                            />
                            <small className="text-muted">Puedes dejar esto en blanco si prefieres ser anónimo</small>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="form-label h5">
                            {currentQ.text}
                        </label>
                        
                        {currentQ.type === 'rating' && (
                            <div className="mt-3">
                                <select
                                    className="form-select"
                                    value={answers[currentQ.id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona una opción</option>
                                    <option value="5">⭐ 5 - Excelente</option>
                                    <option value="4">⭐ 4 - Muy bueno</option>
                                    <option value="3">⭐ 3 - Bueno</option>
                                    <option value="2">⭐ 2 - Regular</option>
                                    <option value="1">⭐ 1 - Malo</option>
                                </select>
                            </div>
                        )}

                        {currentQ.type === 'boolean' && (
                            <div className="mt-3">
                                <div className="d-flex gap-3">
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="yes"
                                            name={`question-${currentQ.id}`}
                                            value="si"
                                            checked={answers[currentQ.id] === 'si'}
                                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                            required
                                        />
                                        <label className="form-check-label" htmlFor="yes">
                                            ✅ Sí
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="no"
                                            name={`question-${currentQ.id}`}
                                            value="no"
                                            checked={answers[currentQ.id] === 'no'}
                                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="no">
                                            ❌ No
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentQ.type === 'text' && (
                            <div className="mt-3">
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Escribe tu respuesta aquí..."
                                    value={answers[currentQ.id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                    required
                                ></textarea>
                            </div>
                        )}
                    </div>

                    <div className="d-flex justify-content-between gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={prevQuestion}
                            disabled={currentQuestion === 0}
                        >
                            <i className="bi bi-arrow-left"></i> Anterior
                        </button>
                        
                        {currentQuestion < survey.questions.length - 1 ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={nextQuestion}
                                disabled={!answers[currentQ.id]}
                            >
                                Siguiente <i className="bi bi-arrow-right"></i>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn btn-success"
                                disabled={Object.keys(answers).length !== survey.questions.length}
                            >
                                <i className="bi bi-send"></i> Enviar Respuestas
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SurveyForm;