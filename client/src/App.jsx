import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SurveyList from './components/SurveyList';
import SurveyForm from './components/SurveyForm';
import Stats from './components/Stats';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);

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
        <Router>
            <div className="container mt-4">
                <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
                    <div className="container-fluid">
                        <Link className="navbar-brand" to="/">
                            📊 SurveyApp
                        </Link>
                        <div className="collapse navbar-collapse">
                            <ul className="navbar-nav me-auto">
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">
                                        Encuestas
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/stats">
                                        Estadísticas
                                    </Link>
                                </li>
                            </ul>
                            <span className="navbar-text">
                                {import.meta.env.VITE_APP_VERSION || 'v1.0.0'}
                            </span>
                        </div>
                    </div>
                </nav>

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
        </Router>
    );
}

export default App;