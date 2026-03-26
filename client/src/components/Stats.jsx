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

<<<<<<< HEAD
    if (!stats || !stats.surveys) {
        return (
            <div className="alert alert-warning mt-4">
                No se pudieron cargar las estadísticas.
            </div>
        );
    }

    const totalResponses = stats.totalResponses || 0;
    const maxResponses = Math.max(...stats.surveys.map((s) => s.responses), 1);
    const source = stats.source || 'memory';
    const isSupabase = source === 'supabase';

    return (
        <div className="stats-page pb-5">
            <div className="text-center mb-4">
                <h1 className="display-5 fw-bold mb-2" style={{ color: '#2d3748' }}>
                    Estadísticas
                </h1>
                <p className="lead text-muted mb-3">
                    Resultados agregados de las 5 encuestas
                </p>
                <div className="d-flex flex-wrap justify-content-center gap-2 align-items-center">
                    <span
                        className={`badge rounded-pill px-3 py-2 ${
                            isSupabase ? 'bg-success' : 'bg-secondary'
                        }`}
                    >
                        {isSupabase ? (
                            <>
                                <i className="bi bi-database-fill me-1"></i>
                                Datos: Supabase
                            </>
                        ) : (
                            <>
                                <i className="bi bi-hdd-stack me-1"></i>
                                Datos: memoria local
                            </>
                        )}
                    </span>
                    <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                        {stats.surveys.length} encuestas
                    </span>
                </div>
                {stats.warning && (
                    <div className="alert alert-warning mt-3 text-start small mx-auto" style={{ maxWidth: '640px' }}>
                        {stats.warning}
                    </div>
                )}
            </div>

            <div className="stat-card mb-4">
                <i className="bi bi-people" style={{ fontSize: '2.75rem' }}></i>
                <h2 className="mb-0">{totalResponses}</h2>
                <p className="mb-0 text-muted">
                    Envíos completos registrados
                    {isSupabase && (
                        <span className="d-block small mt-1">
                            (cada envío agrupa todas las respuestas de una participación)
                        </span>
                    )}
                </p>
            </div>

            <div className="row g-4">
                {stats.surveys.map((survey) => {
                    const pctBar =
                        maxResponses > 0
                            ? (survey.responses / maxResponses) * 100
                            : 0;
                    const pctTotal =
                        totalResponses > 0
                            ? Math.round((survey.responses / totalResponses) * 100)
                            : 0;

                    return (
                        <div key={survey.id} className="col-12">
                            <div className="card shadow-sm border-0 stats-survey-card">
                                <div className="card-body">
                                    <div className="d-flex flex-wrap align-items-start gap-3 mb-3">
                                        <span className="display-6 mb-0">
                                            {survey.icon || '📝'}
                                        </span>
                                        <div className="flex-grow-1">
                                            <h2 className="h5 card-title mb-1">
                                                {survey.title}
                                            </h2>
                                            <p className="text-muted small mb-2">
                                                {survey.responses} envío
                                                {survey.responses !== 1 ? 's' : ''} ·{' '}
                                                {pctTotal}% del total global
                                            </p>
                                            <div className="progress" style={{ height: '10px' }}>
                                                <div
                                                    className="progress-bar bg-primary"
                                                    role="progressbar"
                                                    style={{ width: `${pctBar}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {survey.questions && survey.questions.length > 0 && (
                                        <div className="mt-3 pt-3 border-top">
                                            <h3 className="h6 text-uppercase text-muted mb-3">
                                                Resultados por pregunta
                                            </h3>
                                            <div className="row g-3">
                                                {survey.questions.map((q, qi) => (
                                                    <div
                                                        key={qi}
                                                        className="col-12 col-lg-6"
                                                    >
                                                        <div className="p-3 rounded bg-light h-100">
                                                            <div className="small text-muted mb-1">
                                                                {q.type === 'rating' && (
                                                                    <span className="badge bg-warning text-dark me-1">
                                                                        Escala
                                                                    </span>
                                                                )}
                                                                {q.type === 'boolean' && (
                                                                    <span className="badge bg-info text-dark me-1">
                                                                        Sí / No
                                                                    </span>
                                                                )}
                                                                {q.type === 'text' && (
                                                                    <span className="badge bg-secondary me-1">
                                                                        Texto
                                                                    </span>
                                                                )}
                                                                {q.type === 'choice' && (
                                                                    <span className="badge bg-primary me-1">
                                                                        Opción
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="fw-semibold mb-2 small">
                                                                {q.text}
                                                            </p>
                                                            {q.note && (
                                                                <p className="text-warning small mb-2">
                                                                    {q.note}
                                                                </p>
                                                            )}
                                                            {q.type === 'text' ? (
                                                                <div>
                                                                    <span className="small text-muted">
                                                                        {q.responseCount || 0}{' '}
                                                                        respuesta
                                                                        {(q.responseCount || 0) !== 1
                                                                            ? 's'
                                                                            : ''}
                                                                    </span>
                                                                    {q.textSamples &&
                                                                        q.textSamples.length > 0 && (
                                                                            <ul className="small mt-2 mb-0 ps-3">
                                                                                {q.textSamples.map(
                                                                                    (t, ti) => (
                                                                                        <li
                                                                                            key={ti}
                                                                                            className="text-break"
                                                                                        >
                                                                                            {t}
                                                                                        </li>
                                                                                    )
                                                                                )}
                                                                            </ul>
                                                                        )}
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {q.average != null && (
                                                                        <p className="mb-2">
                                                                            <span className="badge bg-dark">
                                                                                Media: {q.average}
                                                                            </span>
                                                                        </p>
                                                                    )}
                                                                    {q.distribution &&
                                                                        Object.keys(q.distribution)
                                                                            .length > 0 ? (
                                                                        <ul className="list-unstyled small mb-0">
                                                                            {Object.entries(
                                                                                q.distribution
                                                                            ).map(
                                                                                ([label, n]) => (
                                                                                    <li
                                                                                        key={label}
                                                                                        className="d-flex justify-content-between gap-2 py-1 border-bottom border-white"
                                                                                    >
                                                                                        <span>
                                                                                            {label}
                                                                                        </span>
                                                                                        <span className="fw-bold text-primary">
                                                                                            {n}
                                                                                        </span>
                                                                                    </li>
                                                                                )
                                                                            )}
                                                                        </ul>
                                                                    ) : (
                                                                        <p className="text-muted small mb-0">
                                                                            Sin respuestas aún
                                                                        </p>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
=======
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
>>>>>>> teammate/main
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
<<<<<<< HEAD

            {stats.recentResponses && stats.recentResponses.length > 0 && (
                <div className="mt-5">
                    <h3 className="h5 mb-3">Actividad reciente</h3>
                    <ul className="list-group list-group-flush shadow-sm rounded">
                        {stats.recentResponses.map((r, i) => (
                            <li
                                key={i}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <span>
                                    <i className="bi bi-check2-circle text-success me-2"></i>
                                    {r.surveyTitle}
                                    {r.respondentName && (
                                        <span className="text-muted small ms-2">
                                            ({r.respondentName})
                                        </span>
                                    )}
                                </span>
                                <small className="text-muted">
                                    {r.date
                                        ? new Date(r.date).toLocaleString('es', {
                                              dateStyle: 'short',
                                              timeStyle: 'short'
                                          })
                                        : ''}
                                </small>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
=======
>>>>>>> teammate/main
        </div>
    );
}

<<<<<<< HEAD
export default Stats;
=======
export default Stats;
>>>>>>> teammate/main
