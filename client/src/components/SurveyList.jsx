// client/src/components/SurveyList.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function SurveyList({ surveys, loading }) {
    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando encuestas...</span>
                </div>
                <p className="mt-3 text-muted">Cargando encuestas disponibles...</p>
            </div>
        );
    }

    if (surveys.length === 0) {
        return (
            <div className="text-center mt-5">
                <i className="bi bi-inbox" style={{ fontSize: '4rem', color: '#cbd5e0' }}></i>
                <h3 className="mt-3 text-muted">No hay encuestas disponibles</h3>
                <p>Vuelve luego para participar en nuevas encuestas.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold mb-3" style={{ color: '#2d3748' }}>
                    📋 Encuestas Disponibles
                </h1>
                <p className="lead text-muted">
                    Participa en nuestras encuestas y ayúdanos a mejorar
                </p>
            </div>

            <div className="row">
                {surveys.map((survey, index) => (
                    <div key={survey.id} className="col-md-6 col-lg-4 mb-4">
                        <div className="card h-100" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="card-body d-flex flex-column">
                                <div className="mb-3">
                                    <span style={{ fontSize: '3rem' }}>{survey.icon || '📝'}</span>
                                </div>
                                <h5 className="card-title">{survey.title}</h5>
                                <p className="card-text flex-grow-1">{survey.description}</p>
                                <div className="mt-3">
                                    <div className="mb-2">
                                        <small className="text-muted">
                                            <i className="bi bi-question-circle"></i> {survey.questions.length} preguntas
                                        </small>
                                    </div>
                                    <Link 
                                        to={`/survey/${survey.id}`} 
                                        className="btn btn-primary w-100"
                                    >
                                        <i className="bi bi-pencil-square"></i> Responder Encuesta
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SurveyList;