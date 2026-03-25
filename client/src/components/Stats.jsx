// client/src/components/Stats.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Stats({ apiUrl }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/stats`);
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    const totalResponses = stats.totalResponses;
    const maxResponses = Math.max(...stats.surveys.map(s => s.responses), 1);

    return (
        <div>
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold mb-3" style={{ color: '#2d3748' }}>
                    📊 Estadísticas
                </h1>
                <p className="lead text-muted">
                    Visualiza los resultados de todas las encuestas
                </p>
            </div>

            <div className="stat-card">
                <i className="bi bi-people" style={{ fontSize: '3rem' }}></i>
                <h2>{totalResponses}</h2>
                <p>Total de respuestas recibidas</p>
            </div>

            <div className="row">
                {stats.surveys.map((survey, index) => {
                    const percentage = (survey.responses / maxResponses) * 100;
                    return (
                        <div key={survey.id} className="col-12 mb-4">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center mb-3">
                                        <span style={{ fontSize: '2rem', marginRight: '1rem' }}>
                                            {survey.icon || '📝'}
                                        </span>
                                        <div className="flex-grow-1">
                                            <h5 className="card-title mb-1">{survey.title}</h5>
                                            <small className="text-muted">
                                                {survey.responses} respuesta{survey.responses !== 1 ? 's' : ''}
                                            </small>
                                        </div>
                                        <div className="text-end">
                                            <span className="h3 mb-0 fw-bold text-primary">
                                                {Math.round((survey.responses / totalResponses) * 100) || 0}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="progress">
                                        <div 
                                            className="progress-bar" 
                                            role="progressbar"
                                            style={{ width: `${percentage}%` }}
                                            aria-valuenow={percentage} 
                                            aria-valuemin="0" 
                                            aria-valuemax="100"
                                        >
                                            {survey.responses > 0 && `${survey.responses} respuestas`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Stats;