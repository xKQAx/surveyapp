// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SurveyList from './components/SurveyList';
import SurveyForm from './components/SurveyForm';
import Stats from './components/Stats';
import axios from 'axios';
import VITE_APP_VERSION from '../.env';
const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/surveys`);
            setSurveys(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching surveys:', error);
            setLoading(false);
        }
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg sticky-top">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        <i className="bi bi-bar-chart-steps"></i> SurveyApp
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
                                    <i className="bi bi-house-door"></i> Inicio
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`} to="/stats">
                                    <i className="bi bi-graph-up"></i> Estadísticas
                                </Link>
                            </li>
                        </ul>
                        <span className="navbar-text">
                            <i className="bi bi-rocket-takeoff"></i> {import.meta.env.VITE_APP_VERSION || 'v2.3.0'}
                        </span>
                    </div>
                </div>
            </nav>

            <div className="container">
                <Routes>
                    <Route 
                        path="/" 
                        element={<SurveyList surveys={surveys} loading={loading} />} 
                    />
                    <Route 
                        path="/survey/:id" 
                        element={<SurveyForm apiUrl={API_URL} />} 
                    />
                    <Route 
                        path="/stats" 
                        element={<Stats apiUrl={API_URL} />} 
                    />
                </Routes>
            </div>
        </div>
    );
}

// Wrapper para usar useLocation
function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default AppWrapper;