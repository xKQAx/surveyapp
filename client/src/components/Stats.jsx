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
        return <div className="text-center">Cargando estadísticas...</div>;
    }

    return (
        <div>
            <h2 className="mb-4">📈 Estadísticas</h2>
            
            <div className="card mb-4 bg-primary text-white">
                <div className="card-body text-center">
                    <h5 className="card-title">Total de Respuestas</h5>
                    <h2 className="display-3">{stats.totalResponses}</h2>
                    <p className="mb-0">Opiniones recibidas</p>
                </div>
            </div>

            <h4>📋 Detalle por Encuesta</h4>
            <div className="row">
                {stats.surveys.map(survey => (
                    <div key={survey.id} className="col-md-6 mb-3">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">
                                    {survey.icon || '📝'} {survey.title}
                                </h5>
                                <div className="mt-3">
                                    <div className="progress" style={{ height: '30px' }}>
                                        <div 
                                            className="progress-bar bg-success" 
                                            role="progressbar"
                                            style={{ 
                                                width: `${Math.min(100, (survey.responses / Math.max(1, stats.totalResponses) * 100))}%` 
                                            }}
                                        >
                                            {survey.responses} respuestas
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-2 text-muted small">
                                    {survey.responses === 0 ? 'Aún sin respuestas' : `${survey.responses} participantes`}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Stats;