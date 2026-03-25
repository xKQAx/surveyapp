import React from 'react';
import { Link } from 'react-router-dom';

function SurveyList({ surveys, loading }) {
    if (loading) {
        return <div className="text-center">Cargando encuestas...</div>;
    }

    return (
        <div>
            <h2 className="mb-4">Encuestas Disponibles</h2>
            <div className="row">
                {surveys.map(survey => (
                    <div key={survey.id} className="col-md-6 mb-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">{survey.title}</h5>
                                <p className="card-text">{survey.description}</p>
                                <p className="card-text">
                                    <small className="text-muted">
                                        {survey.questions.length} preguntas
                                    </small>
                                </p>
                                <Link 
                                    to={`/survey/${survey.id}`} 
                                    className="btn btn-primary"
                                >
                                    Responder Encuesta
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SurveyList;