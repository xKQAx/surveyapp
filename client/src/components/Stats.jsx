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
            <h2 className="mb-4">Estadísticas</h2>
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Total de Respuestas</h5>
                    <h2 className="display-4">{stats.totalResponses}</h2>
                </div>
            </div>

            <h4>Respuestas por Encuesta</h4>
            <div className="row">
                {stats.surveys.map(survey => (
                    <div key={survey.id} className="col-md-6 mb-3">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{survey.title}</h5>
                                <p className="card-text">
                                    Respuestas: <strong>{survey.responses}</strong>
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