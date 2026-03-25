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
            }, 2000);
        } catch (error) {
            console.error('Error submitting survey:', error);
            alert('Error al enviar la encuesta');
        }
    };

    if (!survey) {
        return <div className="text-center">Cargando encuesta...</div>;
    }

    if (submitted) {
        return (
            <div className="alert alert-success text-center">
                <h4>¡Gracias por responder!</h4>
                <p>Redirigiendo al inicio...</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">{survey.title}</h2>
                <p className="card-text">{survey.description}</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Tu nombre (opcional)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={respondentName}
                            onChange={(e) => setRespondentName(e.target.value)}
                        />
                    </div>

                    {survey.questions.map((question) => (
                        <div key={question.id} className="mb-3">
                            <label className="form-label">{question.text}</label>
                            {question.type === 'rating' && (
                                <select
                                    className="form-select"
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona una opción</option>
                                    <option value="5">Excelente</option>
                                    <option value="4">Muy bueno</option>
                                    <option value="3">Bueno</option>
                                    <option value="2">Regular</option>
                                    <option value="1">Malo</option>
                                </select>
                            )}
                            {question.type === 'boolean' && (
                                <div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            name={`question-${question.id}`}
                                            value="si"
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                            required
                                        />
                                        <label className="form-check-label">Sí</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            name={`question-${question.id}`}
                                            value="no"
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        />
                                        <label className="form-check-label">No</label>
                                    </div>
                                </div>
                            )}
                            {question.type === 'text' && (
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    required
                                ></textarea>
                            )}
                        </div>
                    ))}

                    <button type="submit" className="btn btn-primary">
                        Enviar Respuesta
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SurveyForm;